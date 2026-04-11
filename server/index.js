require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');
const mongoose = require('mongoose');
const { decryptSecret } = require('../tools/decrypt-secret');

const app = express();
const PORT = process.env.PORT || 3002;
const encryptionKey = process.env.ENC_MASTER_KEY || '';

const resolveSecret = (plainValue, encryptedValue, secretName) => {
  if (plainValue) return plainValue;
  if (!encryptedValue) return '';

  try {
    return decryptSecret(encryptedValue, encryptionKey);
  } catch (error) {
    console.error(`Failed to decrypt ${secretName}:`, error.message);
    return '';
  }
};
// ─── Global error handlers ────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[critical] Unhandled promise rejection:', reason instanceof Error ? reason.message : reason);
});

process.on('uncaughtException', (err) => {
  console.error('[critical] Uncaught exception:', err.message);
  process.exit(1);
});

app.disable('x-powered-by');
app.set('trust proxy', 1);

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => {
    try { return new URL(origin).origin; } catch { return null; }
  })
  .filter(Boolean);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({
  referrerPolicy: { policy: 'no-referrer' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'https:', 'data:'],
      connectSrc: [
        "'self'",
        'https://maps.googleapis.com',
        'https://graph.facebook.com',
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
}));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin only in development (curl, Postman)
    if (!origin) {
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      return callback(new Error('Origin header required'));
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: false,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

// Rate limit: max 5 enquiries per IP per 15 minutes
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many enquiries submitted. Please try again later.' },
  standardHeaders: false,
  legacyHeaders: false,
});

const sanitizeText = (value, max = 500) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const sanitizeBoolean = (value) => value === true || value === 'true' || value === 1 || value === '1';

// Strip CRLF characters to prevent header/message injection
const stripCRLF = (value) => String(value).replace(/[\r\n]/g, ' ');

// Validate Google Place ID format (alphanumeric + underscore + dash, 20-50 chars)
const isValidPlaceId = (id) => typeof id === 'string' && /^[a-zA-Z0-9_-]{20,50}$/.test(id);

// Whitelist of allowed enquiry fields
const ALLOWED_ENQUIRY_FIELDS = new Set([
  'name', 'email', 'phone', 'country', 'startDate', 'endDate',
  'noHotelRequired', 'hotelCategory', 'adults', 'children',
  'message', 'tourName', 'tourPackages',
]);

// ─── MongoDB with reconnection ────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI;

const connectMongo = async (attempt = 1) => {
  if (!MONGO_URI) {
    console.log('[startup] MONGODB_URI not set — enquiries will not be persisted');
    return;
  }
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('[startup] Connected to MongoDB');
  } catch (err) {
    const delay = Math.min(1000 * 2 ** attempt, 30000); // exponential backoff, max 30s
    console.error(`[startup] MongoDB connection error (attempt ${attempt}): ${err.name || 'Error'}`);
    console.log(`[startup] Retrying MongoDB in ${delay / 1000}s...`);
    setTimeout(() => connectMongo(attempt + 1), delay);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[mongo] Disconnected — attempting reconnect...');
  setTimeout(() => connectMongo(), 3000);
});

mongoose.connection.on('reconnected', () => {
  console.log('[mongo] Reconnected to MongoDB');
});

connectMongo();

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 200 },
  phone: { type: String, required: true, maxlength: 30 },
  country: { type: String, maxlength: 80 },
  startDate: { type: String, maxlength: 20 },
  endDate: { type: String, maxlength: 20 },
  noHotelRequired: { type: Boolean, default: false },
  hotelCategory: { type: String, maxlength: 50 },
  adults: { type: Number, default: 1, min: 1, max: 50 },
  children: { type: Number, default: 0, min: 0, max: 50 },
  tourPackages: [{ type: String, maxlength: 150 }],
  tourName: { type: String, maxlength: 150 },
  message: { type: String, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'new', enum: ['new', 'in-progress', 'contacted', 'closed'] },
}, { strict: true });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// ─── Resend email client ──────────────────────────────────────────────────────
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
console.log('[startup] Email notifications:', resend ? 'configured' : 'not configured');
console.log('[startup] Notify email:', process.env.NOTIFY_EMAIL ? 'configured' : 'not configured');

// ─── Validation ──────────────────────────────────────────────────────────────
function validateEnquiry({ name, email, phone, startDate, endDate, hotelCategory, noHotelRequired }) {
  const errors = {};
  if (!name || sanitizeText(name).length < 2) {
    errors.name = 'Full name is required (min 2 characters).';
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizeText(email, 200))) {
    errors.email = 'A valid email address is required.';
  }
  if (!phone || sanitizeText(phone, 30).replace(/\D/g, '').length < 6) {
    errors.phone = 'A valid phone/WhatsApp number is required.';
  }

  if (!startDate) {
    errors.startDate = 'Start date is required.';
  }

  if (!endDate) {
    errors.endDate = 'End date is required.';
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      errors.endDate = 'End date must be on or after start date.';
    }
  }

  const wantsNoHotel = sanitizeBoolean(noHotelRequired);
  if (!wantsNoHotel && !sanitizeText(hotelCategory)) {
    errors.hotelCategory = 'Please select a hotel option or choose No Hotel Required.';
  }

  return errors;
}

function formatTravelDates(startDate, endDate) {
  if (!startDate || !endDate) return 'Not provided';
  return `${startDate} to ${endDate}`;
}

function formatHotelPreference(hotelCategory, noHotelRequired) {
  const wantsNoHotel = noHotelRequired === true || noHotelRequired === 'true' || noHotelRequired === 1 || noHotelRequired === '1';
  return wantsNoHotel ? 'No Hotel Required' : (hotelCategory || 'Not selected');
}

// ─── Send Email ───────────────────────────────────────────────────────────────
async function sendEmail({ name, email, phone, country, startDate, endDate, noHotelRequired, hotelCategory, adults, children, message, tourName, tourPackages }) {
  if (!resend) {
    throw new Error('Email credentials are not configured');
  }

  const toursArray = Array.isArray(tourPackages) && tourPackages.length > 0
    ? tourPackages
    : tourName ? [tourName] : [];

  const tourBullets = toursArray.length > 0
    ? toursArray.map(t => `• ${t}`).join('\n')
    : '• (No specific tour selected)';

  const tourBulletsHtml = toursArray.length > 0
    ? toursArray.map(t => `<li style="margin:4px 0;color:#1f2937;">${escapeHtml(t)}</li>`).join('')
    : '<li style="margin:4px 0;color:#9ca3af;font-style:italic;">No specific tour selected</li>';

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeCountry = escapeHtml(country || '');
  const safeDates = escapeHtml(formatTravelDates(startDate, endDate));
  const safeHotelPreference = escapeHtml(formatHotelPreference(hotelCategory, noHotelRequired));
  const safeAdults = escapeHtml(String(adults));
  const safeChildren = escapeHtml(String(children));
  const safeMessage = escapeHtml(message || '');

  const toAddress = process.env.NOTIFY_EMAIL || 'Indiatoursguide.work@gmail.com';

  const { error } = await resend.emails.send({
    from: 'indiatourguide <onboarding@resend.dev>',
    to: toAddress,
    reply_to: email,
    subject: 'New Tour Enquiry – indiatourguide.com',
    html: `
      <div style="font-family:sans-serif;max-width:580px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0ea5e9 0%,#a78bfa 100%);padding:28px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:1.4rem;font-weight:700;letter-spacing:0.3px;">New Travel Enquiry Received</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:0.9rem;">indiatourguide.com</p>
        </div>

        <div style="padding:28px 32px;">
          <!-- Customer Details -->
          <h2 style="margin:0 0 16px;font-size:1rem;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">Customer Details</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
            <tr>
              <td style="padding:7px 0;color:#6b7280;width:140px;font-size:0.9rem;">Name</td>
              <td style="padding:7px 0;font-weight:600;color:#1f2937;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:7px 0;color:#6b7280;font-size:0.9rem;">Email</td>
              <td style="padding:7px 0;font-weight:600;color:#1f2937;"><a href="mailto:${safeEmail}" style="color:#0ea5e9;text-decoration:none;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding:7px 0;color:#6b7280;font-size:0.9rem;">Phone / WhatsApp</td>
              <td style="padding:7px 0;font-weight:600;color:#1f2937;">${safePhone}</td>
            </tr>
            ${country ? `<tr>
              <td style="padding:7px 0;color:#6b7280;font-size:0.9rem;">Country</td>
              <td style="padding:7px 0;font-weight:600;color:#1f2937;">${safeCountry}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:7px 0;color:#6b7280;font-size:0.9rem;">Travel Dates</td>
              <td style="padding:7px 0;font-weight:600;color:#1f2937;">${safeDates}</td>
            </tr>
            <tr>
              <td style="padding:7px 0;color:#6b7280;font-size:0.9rem;">Hotel Preference</td>
              <td style="padding:7px 0;font-weight:600;color:#1f2937;">${safeHotelPreference}</td>
            </tr>
            <tr>
              <td style="padding:7px 0;color:#6b7280;font-size:0.9rem;">Adults</td>
              <td style="padding:7px 0;font-weight:600;color:#1f2937;">${safeAdults}</td>
            </tr>
            <tr>
              <td style="padding:7px 0;color:#6b7280;font-size:0.9rem;">Children</td>
              <td style="padding:7px 0;font-weight:600;color:#1f2937;">${safeChildren}</td>
            </tr>
          </table>

          <!-- Interested Tours -->
          <h2 style="margin:0 0 12px;font-size:1rem;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">Interested Tours</h2>
          <ul style="margin:0 0 28px;padding-left:20px;">${tourBulletsHtml}</ul>

          <!-- Customer Message -->
          <h2 style="margin:0 0 12px;font-size:1rem;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">Customer Message</h2>
          <blockquote style="margin:0 0 28px;padding:14px 18px;background:#f8fafc;border-left:4px solid #0ea5e9;border-radius:0 8px 8px 0;color:#374151;font-style:italic;line-height:1.6;">
            ${safeMessage || '<span style="color:#9ca3af;">No message provided</span>'}
          </blockquote>
        </div>

        <!-- Footer -->
        <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#9ca3af;font-size:0.8rem;">Source: <strong>indiatourguide.com</strong> contact form &nbsp;·&nbsp; Reply to this email to respond to the customer</p>
        </div>
      </div>
    `,
  });
  if (error) {
    throw new Error(error.message);
  }
}

// ─── Send WhatsApp via Meta Cloud API ────────────────────────────────────────
// Setup: Create a Meta App at developers.facebook.com, enable WhatsApp,
// then set WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_NUMBER in .env
async function sendWhatsApp({ name, email, phone, country, startDate, endDate, noHotelRequired, hotelCategory, adults, children, message, tourName }) {
  const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_NUMBER } = process.env;
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_BUSINESS_NUMBER) {
    console.warn('WhatsApp: credentials not configured, skipping.');
    return;
  }

  const body =
    `🌍 *New Travel Enquiry*\n\n` +
    (tourName ? `*Tour Package:* ${stripCRLF(tourName)}\n` : '') +
    `*Name:* ${stripCRLF(name)}\n` +
    `*Email:* ${stripCRLF(email)}\n` +
    (country ? `*Country:* ${stripCRLF(country)}\n` : '') +
    `*Phone/WhatsApp:* ${stripCRLF(phone)}\n` +
    `*Travel Dates:* ${stripCRLF(formatTravelDates(startDate, endDate))}\n` +
    `*Hotel Preference:* ${stripCRLF(formatHotelPreference(hotelCategory, noHotelRequired))}\n` +
    `*Adults:* ${adults}\n` +
    `*Children:* ${children}\n` +
    `*Message:* ${stripCRLF(message || 'No message provided')}`;

  await axios.post(
    `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to: WHATSAPP_BUSINESS_NUMBER,
      type: 'text',
      text: { body },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );
}

// ─── Route ────────────────────────────────────────────────────────────────────
app.post('/api/enquiry', enquiryLimiter, (req, res) => {
  // Reject unexpected fields (mass assignment protection)
  const unexpectedFields = Object.keys(req.body).filter(f => !ALLOWED_ENQUIRY_FIELDS.has(f));
  if (unexpectedFields.length > 0) {
    return res.status(400).json({ errors: { general: 'Unexpected fields in request.' } });
  }

  const {
    name,
    email,
    phone,
    country,
    startDate,
    endDate,
    noHotelRequired,
    hotelCategory,
    adults,
    children,
    message,
    tourName,
    tourPackages,
  } = req.body;

  // Validate
  const errors = validateEnquiry({ name, email, phone, startDate, endDate, hotelCategory, noHotelRequired });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const wantsNoHotel = sanitizeBoolean(noHotelRequired);

  const data = {
    name: sanitizeText(name, 100),
    email: sanitizeText(email, 200).toLowerCase(),
    phone: sanitizeText(phone, 30),
    country: sanitizeText(country, 80),
    startDate: sanitizeText(startDate, 20),
    endDate: sanitizeText(endDate, 20),
    noHotelRequired: wantsNoHotel,
    hotelCategory: wantsNoHotel ? '' : sanitizeText(hotelCategory, 50),
    adults: Math.max(1, Math.min(50, parseInt(adults, 10) || 1)),
    children: Math.max(0, Math.min(50, parseInt(children, 10) || 0)),
    message: sanitizeText(message, 2000),
    tourName: sanitizeText(tourName, 150),
    tourPackages: Array.isArray(tourPackages) ? tourPackages.map((item) => sanitizeText(item, 150)).filter(Boolean) : [],
  };

  // Respond immediately so the user sees confirmation right away
  res.status(200).json({
    success: true,
    message: 'Thank you for your enquiry. Our travel expert will contact you shortly.',
  });

  // Save to MongoDB in background
  if (mongoose.connection.readyState === 1) {
    new Enquiry(data).save()
      .then(() => console.log('[enquiry] saved to MongoDB'))
      .catch(err => console.error('[enquiry] MongoDB save failed:', err.message));
  }

  // Fire email notification in background (non-blocking)
  console.log('[enquiry] sending email notification | resend client:', !!resend);
  sendEmail(data)
    .then(() => console.log('[enquiry] email sent OK'))
    .catch(err => console.error('[enquiry] Email failed:', err.message));
  // WhatsApp dispatch is disabled for this rollout.
});

// ── Google Reviews — 24-hour server-side cache ────────────────────────────────
const reviewsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: false,
  message: { error: 'Too many review requests. Please try again later.' },
  standardHeaders: false,
  legacyHeaders: false,
});

let reviewsCache = null;
let reviewsCacheAt = 0;
const REVIEWS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const normalizeGoogleReview = (review, index) => {
  const authorName = (review?.author_name || 'Google User').trim().slice(0, 120);
  const text = (review?.text || '').trim().slice(0, 1600);
  const rating = Number.isFinite(Number(review?.rating))
    ? Math.max(1, Math.min(5, Number(review.rating)))
    : 5;
  const timeEpoch = Number.isFinite(Number(review?.time)) ? Number(review.time) : null;
  return {
    id: `${timeEpoch || Date.now()}-${index}`,
    name: authorName,
    rating,
    text,
    relativeTimeDescription: (review?.relative_time_description || '').trim(),
    profilePhotoUrl: (review?.profile_photo_url || '').trim().slice(0, 1000),
    time: timeEpoch,
  };
};

app.get('/api/google-reviews', reviewsLimiter, async (req, res) => {
  if (reviewsCache && Date.now() - reviewsCacheAt < REVIEWS_CACHE_TTL) {
    return res.json({ success: true, data: reviewsCache, cached: true });
  }

  const placesApiKey = resolveSecret(
    process.env.GOOGLE_PLACES_API_KEY,
    process.env.GOOGLE_PLACES_API_KEY_ENC,
    'GOOGLE_PLACES_API_KEY_ENC'
  );
  const placeId = (process.env.GOOGLE_PLACE_ID || '').trim();

  if (!placesApiKey) {
    return res.status(503).json({ success: false, error: 'Google reviews not configured.' });
  }
  if (!placeId || !isValidPlaceId(placeId)) {
    return res.status(503).json({ success: false, error: 'Google reviews not configured.' });
  }

  try {
    const fields = 'name,rating,user_ratings_total,reviews,url';
    const endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fields)}&reviews_sort=newest&key=${encodeURIComponent(placesApiKey)}`;

    const fetchController = new AbortController();
    const fetchTimeout = setTimeout(() => fetchController.abort(), 10000);
    let response;
    try {
      response = await fetch(endpoint, { signal: fetchController.signal });
    } finally {
      clearTimeout(fetchTimeout);
    }
    if (!response.ok) {
      if (reviewsCache) return res.json({ success: true, data: reviewsCache, cached: true, stale: true });
      return res.status(502).json({ success: false, error: 'Failed to reach Google Places API.' });
    }

    const payload = await response.json();
    if (payload?.status !== 'OK' || !payload?.result) {
      if (reviewsCache) return res.json({ success: true, data: reviewsCache, cached: true, stale: true });
      return res.status(502).json({ success: false, error: 'Reviews service temporarily unavailable.' });
    }

    const place = payload.result;
    const reviews = Array.isArray(place.reviews)
      ? place.reviews.map(normalizeGoogleReview).filter(r => r.text)
      : [];

    const data = {
      businessName: (place.name || 'indiatoursguide').trim().slice(0, 140),
      rating: Number.isFinite(Number(place.rating)) ? Number(place.rating) : null,
      totalReviews: Number.isFinite(Number(place.user_ratings_total)) ? Number(place.user_ratings_total) : 0,
      googleUrl: (place.url || '').trim().slice(0, 2000),
      reviews,
      fetchedAt: new Date().toISOString(),
    };

    reviewsCache = data;
    reviewsCacheAt = Date.now();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Google reviews fetch error:', err?.name || 'Error');
    if (reviewsCache) return res.json({ success: true, data: reviewsCache, cached: true, stale: true });
    return res.status(500).json({ success: false, error: 'Failed to fetch Google reviews.' });
  }
});

// Health check
app.get('/api/health', globalLimiter, (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';
  const emailConfigured = !!process.env.RESEND_API_KEY;
  const googleConfigured = !!(process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACE_ID);

  const healthy = dbState === 1;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    db: dbStatus,
    email: emailConfigured ? 'configured' : 'not configured',
    googleReviews: googleConfigured ? 'configured' : 'not configured',
    uptime: Math.floor(process.uptime()),
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`indiatourguide API running on http://localhost:${PORT}`);

  // Ping self every 14 minutes to prevent Render free tier spin-down
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  const pingInterval = setInterval(() => {
    axios.get(`${SELF_URL}/api/health`).catch(() => {});
  }, 14 * 60 * 1000);

  // Graceful shutdown on SIGTERM (Render sends this before stopping)
  const shutdown = async (signal) => {
    console.log(`[shutdown] ${signal} received — shutting down gracefully`);
    clearInterval(pingInterval);
    server.close(async () => {
      console.log('[shutdown] HTTP server closed');
      try {
        await mongoose.connection.close();
        console.log('[shutdown] MongoDB connection closed');
      } catch (err) {
        console.error('[shutdown] Error closing MongoDB:', err.message);
      }
      process.exit(0);
    });
    // Force exit after 10s if graceful shutdown hangs
    setTimeout(() => {
      console.error('[shutdown] Forced exit after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});
