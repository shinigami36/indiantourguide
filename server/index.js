require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');
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
app.disable('x-powered-by');
app.set('trust proxy', 1);

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({
  referrerPolicy: { policy: 'no-referrer' },
}));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

// Rate limit: max 5 enquiries per IP per 15 minutes
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many enquiries submitted. Please try again later.' },
  standardHeaders: true,
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

// ─── Resend email client ──────────────────────────────────────────────────────
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
console.log('[startup] RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
console.log('[startup] NOTIFY_EMAIL:', process.env.NOTIFY_EMAIL || '(not set)');

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
    (tourName ? `*Tour Package:* ${tourName}\n` : '') +
    `*Name:* ${name}\n` +
    `*Email:* ${email}\n` +
    (country ? `*Country:* ${country}\n` : '') +
    `*Phone/WhatsApp:* ${phone}\n` +
    `*Travel Dates:* ${formatTravelDates(startDate, endDate)}\n` +
    `*Hotel Preference:* ${formatHotelPreference(hotelCategory, noHotelRequired)}\n` +
    `*Adults:* ${adults}\n` +
    `*Children:* ${children}\n` +
    `*Message:* ${message || 'No message provided'}`;

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
    adults: Number(adults) || 1,
    children: Number(children) || 0,
    message: sanitizeText(message, 2000),
    tourName: sanitizeText(tourName, 150),
    tourPackages: Array.isArray(tourPackages) ? tourPackages.map((item) => sanitizeText(item, 150)).filter(Boolean) : [],
  };

  // Respond immediately so the user sees confirmation right away
  res.status(200).json({
    success: true,
    message: 'Thank you for your enquiry. Our travel expert will contact you shortly.',
  });

  // Fire email notification in background (non-blocking)
  console.log('[enquiry] sending email to:', data.email, '| resend client:', !!resend);
  sendEmail(data)
    .then(() => console.log('[enquiry] email sent OK'))
    .catch(err => console.error('[enquiry] Email failed:', err.message));
  // WhatsApp dispatch is disabled for this rollout.
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`indiatourguide API running on http://localhost:${PORT}`);
});
