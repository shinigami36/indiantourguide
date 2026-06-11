const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');
const { decryptSecret } = require('../tools/decrypt-secret');
const sendWhatsApp = require('./sendWhatsApp');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const useMongoDb = process.env.USE_MONGODB === 'true' && Boolean(process.env.MONGODB_URI);
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

app.disable('x-powered-by');
app.set('trust proxy', 1);

const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllOrigins = configuredOrigins.includes('*');
const allowedOrigins = new Set(configuredOrigins.filter((origin) => origin !== '*'));

// Security middleware
app.use(helmet({
  referrerPolicy: { policy: 'no-referrer' },
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowAllOrigins || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    const corsError = new Error(`Origin ${origin} is not allowed by CORS`);
    corsError.status = 403;
    return callback(corsError);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use(limiter);

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many enquiries. Please try again later.' },
});

const reviewsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many review requests. Please try again later.' },
});

// Body parsing middleware — 50 kb is plenty for enquiry forms
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Connect to MongoDB only when explicitly enabled
if (useMongoDb) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
} else {
  console.log('MongoDB disabled (running in email-only mode)');
}

const resendApiKey = resolveSecret(process.env.RESEND_API_KEY, process.env.RESEND_API_KEY_ENC, 'RESEND_API_KEY_ENC');

// Resend client — null when not configured so the server still starts without it
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

const sanitizeText = (value, maxLen = 500) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
};

// Escape HTML to prevent XSS in email body
const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const sanitizeBoolean = (value) => value === true || value === 'true' || value === 1 || value === '1';

const sanitizeTourPackages = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 10)
    .map(item => sanitizeText(item))
    .filter(Boolean);
};

const normalizeWhatsAppNumber = (value) => sanitizeText(value).replace(/\D/g, '');

const formatTravelDates = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Not provided';
  return `${startDate} to ${endDate}`;
};

const formatHotelPreference = (enquiry) => {
  if (enquiry.noHotelRequired) return 'No Hotel Required';
  return enquiry.hotelCategory || 'Not selected';
};

const normalizeGoogleReview = (review, index) => {
  const authorName = sanitizeText(review?.author_name || 'Google User', 120);
  const text = sanitizeText(review?.text || '', 1600);
  const rating = Number.isFinite(Number(review?.rating))
    ? Math.max(1, Math.min(5, Number(review.rating)))
    : 5;
  const timeEpoch = Number.isFinite(Number(review?.time)) ? Number(review.time) : null;

  return {
    id: `${timeEpoch || Date.now()}-${index}`,
    name: authorName,
    rating,
    text,
    relativeTimeDescription: sanitizeText(review?.relative_time_description || ''),
    profilePhotoUrl: sanitizeText(review?.profile_photo_url || '', 1000),
    time: timeEpoch,
  };
};

const resolvePlaceIdFromQuery = async (placesApiKey, queryText) => {
  const query = sanitizeText(queryText, 220);
  if (!query) return '';

  const endpoint = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name&key=${encodeURIComponent(placesApiKey)}`;
  const response = await fetch(endpoint, { method: 'GET' });
  if (!response.ok) return '';

  const payload = await response.json();
  const candidate = Array.isArray(payload?.candidates) ? payload.candidates[0] : null;
  return sanitizeText(candidate?.place_id || '', 200);
};

const requireMongo = (req, res, next) => {
  if (!useMongoDb || mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, error: 'Database is not enabled on this server.' });
  }
  return next();
};

// Constant-time comparison so response timing can't leak the token
// prefix/length to an attacker probing the admin endpoints.
const safeTokenEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

const requireAdminToken = (req, res, next) => {
  const configuredToken = process.env.ADMIN_API_TOKEN;
  if (!configuredToken) {
    return res.status(503).json({ success: false, error: 'Admin API token is not configured' });
  }

  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const headerToken = req.headers['x-admin-token'];
  const token = bearerToken || headerToken;

  if (!token || !safeTokenEqual(token, configuredToken)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  return next();
};

const formatTravellerSummary = (enquiry) => `${enquiry.adults || 1} adult(s), ${enquiry.children || 0} child(ren)`;

const formatEnquiryMessage = (enquiry) => {
  const selectedTours = enquiry.tourPackages?.length ? enquiry.tourPackages.join(', ') : (enquiry.tourName || 'General enquiry');

  return [
    'New Travel Enquiry',
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Country: ${enquiry.country || 'Not provided'}`,
    `Phone: ${enquiry.phone}`,
    `Travel Dates: ${formatTravelDates(enquiry.startDate, enquiry.endDate)}`,
    `Hotel Preference: ${formatHotelPreference(enquiry)}`,
    `Adults: ${enquiry.adults || 1}`,
    `Children: ${enquiry.children || 0}`,
    `Tour Category: ${enquiry.tourCategory || 'Not specified'}`,
    `Tour: ${selectedTours}`,
    `Message: ${enquiry.message || 'No message provided'}`,
  ].join('\n');
};

const sendEmailNotification = async (enquiry) => {
  if (!resendClient) {
    return { sent: false, skipped: true, reason: 'RESEND_API_KEY not configured' };
  }

  const selectedTours = enquiry.tourPackages?.length ? enquiry.tourPackages.join(', ') : (enquiry.tourName || 'General enquiry');
  const hotelPref = escapeHtml(formatHotelPreference(enquiry));
  const textMessage = [
    'New Travel Enquiry',
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Country: ${enquiry.country || 'Not provided'}`,
    `Phone: ${enquiry.phone}`,
    `Travel Dates: ${formatTravelDates(enquiry.startDate, enquiry.endDate)}`,
    `Hotel Preference: ${formatHotelPreference(enquiry)}`,
    `Adults: ${enquiry.adults || 1}`,
    `Children: ${enquiry.children || 0}`,
    `Tour: ${selectedTours}`,
    `Message: ${enquiry.message || 'No message provided'}`,
  ].join('\n');
  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 14px;background:#f8fafc;color:#64748b;font-size:13px;font-weight:600;white-space:nowrap;border-bottom:1px solid #e2e8f0;width:38%;">${label}</td>
      <td style="padding:10px 14px;color:#1e293b;font-size:13px;border-bottom:1px solid #e2e8f0;">${value}</td>
    </tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0ea5e9 0%,#818cf8 100%);padding:28px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.75);">indiatoursguide.com</p>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">New Tour Enquiry</h1>
            <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Submitted ${submittedAt} IST</p>
          </td>
        </tr>

        <!-- Alert badge -->
        <tr>
          <td style="padding:20px 32px 0;text-align:center;">
            <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:12px;font-weight:700;padding:6px 16px;border-radius:20px;letter-spacing:0.04em;">ACTION REQUIRED — Review &amp; Reply to Guest</span>
          </td>
        </tr>

        <!-- Guest info -->
        <tr>
          <td style="padding:20px 32px 8px;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#0ea5e9;">Guest Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
              ${row('Full Name', escapeHtml(enquiry.name))}
              ${row('Email', `<a href="mailto:${escapeHtml(enquiry.email)}" style="color:#0ea5e9;text-decoration:none;">${escapeHtml(enquiry.email)}</a>`)}
              ${row('Phone', `<a href="tel:${escapeHtml(enquiry.phone.replace(/\D/g,''))}" style="color:#0ea5e9;text-decoration:none;">${escapeHtml(enquiry.phone)}</a>`)}
              ${row('Country', escapeHtml(enquiry.country || 'Not provided'))}
            </table>
          </td>
        </tr>

        <!-- Trip info -->
        <tr>
          <td style="padding:16px 32px 8px;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#0ea5e9;">Trip Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
              ${row('Tour Category', escapeHtml(enquiry.tourCategory || 'Not specified'))}
              ${row('Tour Package(s)', escapeHtml(selectedTours))}
              ${row('Travel Dates', escapeHtml(formatTravelDates(enquiry.startDate, enquiry.endDate)))}
              ${row('Travelers', `${escapeHtml(String(enquiry.adults || 1))} adult(s), ${escapeHtml(String(enquiry.children || 0))} child(ren)`)}
              ${row('Hotel Preference', hotelPref)}
            </table>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding:16px 32px 8px;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#0ea5e9;">Message</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;color:#374151;font-size:13px;line-height:1.65;">
              ${escapeHtml(enquiry.message || 'No message provided.')}
            </div>
          </td>
        </tr>

        <!-- CTA buttons -->
        <tr>
          <td style="padding:20px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:10px;">
                  <a href="mailto:${escapeHtml(enquiry.email)}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#818cf8);color:#ffffff;font-size:13px;font-weight:700;padding:11px 22px;border-radius:8px;text-decoration:none;">Reply via Email</a>
                </td>
                <td>
                  <a href="tel:${escapeHtml(enquiry.phone.replace(/\D/g,''))}" style="display:inline-block;background:#0f172a;color:#ffffff;font-size:13px;font-weight:700;padding:11px 22px;border-radius:8px;text-decoration:none;">Call Guest</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">This email was sent automatically by indiatoursguide.com · Do not reply to this email</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const fromAddress = process.env.RESEND_FROM || 'indiatoursguide <onboarding@resend.dev>';
  const toAddress = process.env.ADMIN_EMAIL;

  if (!toAddress) {
    return { sent: false, skipped: true, reason: 'ADMIN_EMAIL not configured' };
  }

  const { error } = await resendClient.emails.send({
    from: fromAddress,
    to: toAddress,
    subject: `New Enquiry from ${enquiry.name} — ${selectedTours}`,
    text: textMessage,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return { sent: true };
};

// Enquiry Schema — maxlength caps are defense-in-depth: the endpoint already
// truncates via sanitizeText, but the schema must hold even if a new code
// path writes Enquiry documents directly.
const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 200 },
  phone: { type: String, required: true, maxlength: 30 },
  country: { type: String, maxlength: 100 },
  startDate: { type: String, maxlength: 30 },
  endDate: { type: String, maxlength: 30 },
  noHotelRequired: { type: Boolean, default: false },
  hotelCategory: { type: String, maxlength: 30 },
  adults: { type: Number, default: 1 },
  children: { type: Number, default: 0 },
  tourPackages: {
    type: [{ type: String, maxlength: 500 }],
    validate: { validator: (arr) => arr.length <= 10, message: 'Too many tour packages' },
  },
  tourName: { type: String, maxlength: 600 },
  tourCategory: { type: String, maxlength: 40 },
  message: { type: String, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'new' }
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 200 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, maxlength: 150 },
  content: { type: String, required: true, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// ── 24-hour server-side cache for Google reviews ──────────────────
let reviewsCache = null;
let reviewsCacheAt = 0;
const REVIEWS_CACHE_TTL = 24 * 60 * 60 * 1000; // 1 day in ms

app.get('/api/google-reviews', reviewsLimiter, async (req, res) => {
  // Serve cached response if still fresh (< 24 hours old)
  if (reviewsCache && Date.now() - reviewsCacheAt < REVIEWS_CACHE_TTL) {
    return res.json({ success: true, data: reviewsCache, cached: true });
  }

  const placesApiKey = resolveSecret(
    process.env.GOOGLE_PLACES_API_KEY,
    process.env.GOOGLE_PLACES_API_KEY_ENC,
    'GOOGLE_PLACES_API_KEY_ENC'
  );
  let placeId = sanitizeText(process.env.GOOGLE_PLACE_ID || '', 200);
  const placeQuery = sanitizeText(process.env.GOOGLE_PLACE_QUERY || '', 220);

  if (!placesApiKey) {
    return res.status(503).json({
      success: false,
      error: 'Google reviews are not configured. Set GOOGLE_PLACES_API_KEY.',
    });
  }

  try {
    if (!placeId && placeQuery) {
      placeId = await resolvePlaceIdFromQuery(placesApiKey, placeQuery);
    }

    if (!placeId) {
      return res.status(503).json({
        success: false,
        error: 'Google reviews are not configured. Set GOOGLE_PLACE_ID or GOOGLE_PLACE_QUERY.',
      });
    }

    const fields = 'name,rating,user_ratings_total,reviews,url';
    const reviewsSort = 'newest';
    const endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fields)}&reviews_sort=${reviewsSort}&key=${encodeURIComponent(placesApiKey)}`;

    const response = await fetch(endpoint, { method: 'GET' });
    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: 'Failed to reach Google Places API.',
      });
    }

    const payload = await response.json();
    if (payload?.status !== 'OK' || !payload?.result) {
      return res.status(502).json({
        success: false,
        error: `Google Places API error: ${payload?.status || 'unknown'}`,
      });
    }

    const place = payload.result;
    const reviews = Array.isArray(place.reviews)
      ? place.reviews.map(normalizeGoogleReview).filter((review) => review.text)
      : [];

    const data = {
      businessName: sanitizeText(place.name || 'indiatoursguide', 140),
      rating: Number.isFinite(Number(place.rating)) ? Number(place.rating) : null,
      totalReviews: Number.isFinite(Number(place.user_ratings_total)) ? Number(place.user_ratings_total) : 0,
      googleUrl: sanitizeText(place.url || '', 2000),
      reviews,
      fetchedAt: new Date().toISOString(),
    };

    // Store in cache
    reviewsCache = data;
    reviewsCacheAt = Date.now();

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Failed to fetch Google reviews:', error);
    // Return stale cache if available rather than failing
    if (reviewsCache) {
      return res.json({ success: true, data: reviewsCache, cached: true, stale: true });
    }
    return res.status(500).json({ success: false, error: 'Failed to fetch Google reviews' });
  }
});

// Enquiry submission endpoint
app.post('/api/enquiry', enquiryLimiter, async (req, res) => {
  try {
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
      tourPackages,
      tourName,
      tourCategory,
    } = req.body;

    // Honeypot: the form ships a visually-hidden "website" field humans
    // never see. Bots that fill it get a normal success response and the
    // submission is silently dropped — no DB write, no notifications.
    if (sanitizeText(req.body.website)) {
      return res.json({
        success: true,
        message: 'Thank you for your enquiry! We will contact you soon.'
      });
    }

    // Validation
    if (!name || !email || !phone || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, phone, start date, and end date are required'
      });
    }

    if (String(name).length > 100 || String(email).length > 200) {
      return res.status(400).json({ success: false, error: 'Input too long' });
    }

    // Validate phone: allow formatted strings (spaces, dashes, parens, +) but
    // the actual digit count must be 6–15 to cover all international numbers (E.164).
    const phoneDigits = String(phone).replace(/\D/g, '');
    if (phoneDigits.length < 6 || phoneDigits.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Phone number must contain between 6 and 15 digits.',
      });
    }

    if (message && String(message).length > 2000) {
      return res.status(400).json({ success: false, error: 'Message must be 2000 characters or fewer' });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime()) || parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        error: 'Invalid travel dates. End date must be on or after start date.'
      });
    }

    const wantsNoHotel = sanitizeBoolean(noHotelRequired);
    if (!wantsNoHotel && !sanitizeText(hotelCategory)) {
      return res.status(400).json({
        success: false,
        error: 'Please select a hotel category or choose No Hotel Required.'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    const enquiryPayload = {
      name: sanitizeText(name),
      email: sanitizeText(email),
      phone: sanitizeText(phone),
      country: sanitizeText(country),
      startDate: sanitizeText(startDate),
      endDate: sanitizeText(endDate),
      noHotelRequired: wantsNoHotel,
      hotelCategory: wantsNoHotel ? '' : sanitizeText(hotelCategory),
      adults: Number.isFinite(Number(adults)) ? Math.max(1, Number(adults)) : 1,
      children: Number.isFinite(Number(children)) ? Math.max(0, Number(children)) : 0,
      tourPackages: sanitizeTourPackages(tourPackages),
      tourName: sanitizeText(tourName),
      tourCategory: sanitizeText(tourCategory),
      message: sanitizeText(message),
      createdAt: new Date(),
    };

    const enquiry = new Enquiry(enquiryPayload);

    if (useMongoDb && mongoose.connection.readyState === 1) {
      try {
        await enquiry.save();
      } catch (saveError) {
        console.warn('Enquiry persistence skipped:', saveError.message);
      }
    } else {
      console.warn('Enquiry persistence skipped: database disabled or not connected');
    }

    res.json({
      success: true,
      message: 'Thank you for your enquiry! We will contact you soon.'
    });

    // Email is intentionally sent in the background to keep UI response fast.
    void sendEmailNotification(enquiry)
      .then((emailResult) => {
        if (emailResult?.skipped) {
          console.warn('Email notification skipped:', emailResult.reason);
        }
      })
      .catch((emailError) => {
        console.error('Email sending failed:', emailError);
      });

    // WhatsApp runs in parallel, also best-effort. Log only the API error
    // message — the full axios error carries the bearer token in its headers.
    void sendWhatsApp(enquiry)
      .then((waResult) => {
        if (waResult?.skipped) {
          console.warn('WhatsApp notification skipped:', waResult.reason);
        }
      })
      .catch((waError) => {
        console.error('WhatsApp sending failed:', waError?.response?.data?.error?.message || waError.message);
      });

  } catch (error) {
    console.error('Enquiry submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    });
  }
});

// Get all enquiries (for admin)
app.get('/api/enquiries', requireAdminToken, requireMongo, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, data: enquiries });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
});

// Update enquiry status (for admin)
app.patch('/api/enquiries/:id', requireAdminToken, requireMongo, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['new', 'in-progress', 'contacted', 'closed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }

    res.json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ success: false, error: 'Failed to update enquiry' });
  }
});


// ── Site Reviews ─────────────────────────────────────────────────

const reviewSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many review submissions. Please try again later.' },
});

// Submit a new review (goes into pending for moderation)
app.post('/api/reviews', reviewSubmitLimiter, requireMongo, async (req, res) => {
  try {
    const { name, email, rating, title, content } = req.body;

    if (!name || !email || !rating || !title || !content) {
      return res.status(400).json({ success: false, error: 'Name, email, rating, title and content are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5.' });
    }

    const review = new Review({
      name: sanitizeText(name, 100),
      email: sanitizeText(email, 200),
      rating: Math.round(parsedRating),
      title: sanitizeText(title, 150),
      content: sanitizeText(content, 2000),
    });

    await review.save();

    return res.status(201).json({
      success: true,
      message: 'Thank you for your review! It will appear after moderation.',
    });
  } catch (err) {
    console.error('Review submission error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit review.' });
  }
});

// Fetch approved reviews + aggregate stats (paginated)
// Query params: ?skip=0&limit=6
app.get('/api/reviews', reviewsLimiter, requireMongo, async (req, res) => {
  try {
    const skip  = Math.max(0, parseInt(req.query.skip,  10) || 0);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 6));

    // Run page fetch + aggregate in parallel
    const [page, agg] = await Promise.all([
      Review.find({ status: 'approved' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-email')
        .lean(),
      Review.aggregate([
        { $match: { status: 'approved' } },
        { $group: {
          _id: null,
          total:   { $sum: 1 },
          sum:     { $sum: '$rating' },
          count5:  { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          count4:  { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          count3:  { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          count2:  { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          count1:  { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        }},
      ]),
    ]);

    const aggRow   = agg[0] || { total: 0, sum: 0, count5: 0, count4: 0, count3: 0, count2: 0, count1: 0 };
    const total    = aggRow.total;
    const avgRating = total > 0 ? Math.round((aggRow.sum / total) * 10) / 10 : null;
    const breakdown = { 5: aggRow.count5, 4: aggRow.count4, 3: aggRow.count3, 2: aggRow.count2, 1: aggRow.count1 };

    return res.json({
      success: true,
      data: {
        reviews: page,
        hasMore: skip + page.length < total,
        stats: { total, avgRating, breakdown },
      },
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch reviews.' });
  }
});

// Admin: list pending reviews
app.get('/api/reviews/pending', requireAdminToken, requireMongo, async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'pending' }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: reviews });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch pending reviews.' });
  }
});

// Admin: approve or reject a review
app.patch('/api/reviews/:id', requireAdminToken, requireMongo, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be approved or rejected.' });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ success: false, error: 'Review not found.' });
    return res.json({ success: true, data: review });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update review.' });
  }
});

// Admin: delete a review
app.delete('/api/reviews/:id', requireAdminToken, requireMongo, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found.' });
    return res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete review.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      error: 'This website origin is not allowed. Update FRONTEND_URL in backend/.env to include this domain.'
    });
  }

  return res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Listen only when run directly (node index.js); tests import the app
// via supertest without binding a port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;