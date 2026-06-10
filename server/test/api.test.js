// API tests — node's built-in test runner + supertest, no extra framework.
// Run with: npm test (node --test test/)
//
// Env is pinned BEFORE the app is required: dotenv does not override
// already-set variables, so these values win over any local server/.env.
// MongoDB is disabled (the validation/auth paths under test run before
// any DB access) and all notification keys are blanked so no test ever
// makes an outbound call.
process.env.USE_MONGODB = 'false';
process.env.MONGODB_URI = '';
process.env.ADMIN_API_TOKEN = 'test-admin-token';
process.env.RESEND_API_KEY = '';
process.env.RESEND_API_KEY_ENC = '';
process.env.WHATSAPP_TOKEN = '';
process.env.GOOGLE_PLACES_API_KEY = '';
process.env.GOOGLE_PLACES_API_KEY_ENC = '';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../index');

const validEnquiry = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '+91 73020 28445',
  country: 'India',
  startDate: '2026-08-01',
  endDate: '2026-08-05',
  noHotelRequired: true,
  adults: 2,
  children: 0,
  tourPackages: ['Golden Triangle Tour'],
  tourName: 'Golden Triangle Tour',
  tourCategory: 'india',
  message: 'Test enquiry',
};

test('GET /api/health returns OK', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'OK');
});

test('POST /api/enquiry rejects missing required fields', async () => {
  const res = await request(app).post('/api/enquiry').send({ name: 'only a name' });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /required/i);
});

test('POST /api/enquiry rejects invalid phone (too few digits)', async () => {
  const res = await request(app).post('/api/enquiry').send({ ...validEnquiry, phone: '123' });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /phone/i);
});

test('POST /api/enquiry rejects end date before start date', async () => {
  const res = await request(app)
    .post('/api/enquiry')
    .send({ ...validEnquiry, startDate: '2026-08-05', endDate: '2026-08-01' });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /date/i);
});

test('POST /api/enquiry rejects missing hotel preference', async () => {
  const res = await request(app)
    .post('/api/enquiry')
    .send({ ...validEnquiry, noHotelRequired: false, hotelCategory: '' });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /hotel/i);
});

test('POST /api/enquiry rejects invalid email format', async () => {
  const res = await request(app).post('/api/enquiry').send({ ...validEnquiry, email: 'not-an-email' });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /email/i);
});

test('POST /api/enquiry accepts a valid enquiry', async () => {
  const res = await request(app).post('/api/enquiry').send(validEnquiry);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test('POST /api/enquiry honeypot: filled website field gets a fake success', async () => {
  // Even an otherwise-invalid payload returns success — bots must not be
  // able to tell they were caught, and nothing is validated or stored.
  const res = await request(app)
    .post('/api/enquiry')
    .send({ website: 'http://spam.example', name: 'bot' });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test('admin endpoint without token is rejected', async () => {
  const res = await request(app).get('/api/enquiries');
  assert.equal(res.status, 401);
});

test('admin endpoint with wrong token is rejected', async () => {
  const res = await request(app)
    .get('/api/enquiries')
    .set('X-Admin-Token', 'wrong-token');
  assert.equal(res.status, 401);
});

test('admin endpoint with wrong-length token is rejected (timing-safe path)', async () => {
  const res = await request(app)
    .get('/api/enquiries')
    .set('Authorization', 'Bearer x');
  assert.equal(res.status, 401);
});

test('admin endpoint with correct token passes auth (503 = Mongo disabled, auth OK)', async () => {
  const res = await request(app)
    .get('/api/enquiries')
    .set('Authorization', 'Bearer test-admin-token');
  assert.equal(res.status, 503);
  assert.match(res.body.error, /database/i);
});

test('unknown route returns 404', async () => {
  const res = await request(app).get('/api/nope');
  assert.equal(res.status, 404);
});
