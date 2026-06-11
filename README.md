# India Tours Guide — indiatoursguide.com

React 18 + Vite single-page site for a private India & world tour operator, with an
Express/MongoDB backend for enquiries, site reviews, and Google-reviews proxying.

## Repository layout

```
.                  React frontend (Vite)
├── src/           Components, hooks, data, i18n locales (10 languages)
├── public/        Static assets (tour videos, attraction images, sitemap, robots)
├── server/        Express backend — deployed to Render (api.indiatoursguide.com)
└── tools/         AES-256-GCM helpers to encrypt/decrypt secret env values
```

## Frontend

```bash
npm install
npm run dev      # http://localhost:5173 — proxies /api → http://localhost:3001
npm run build    # production bundle in dist/
npm run lint
```

Create `.env` (or copy `.env.example`) and set `VITE_API_URL` — empty for local dev
(the Vite proxy handles `/api`), or the deployed backend URL in production builds.
Set `VITE_GA_MEASUREMENT_ID` (GA4) on the production build host to enable analytics —
page views plus `enquiry_modal_open`, `enquiry_submit` and `review_submit` events.

### Routes

Real URLs served by react-router: `/` (home), `/attractions`, `/international`.
Unknown paths redirect to `/`.

### Reviews snapshot

`SiteReviews` renders instantly from `src/data/reviewsSnapshot.json` and then
refreshes from the live API. Re-sync the snapshot before a deploy with:

```bash
npm run snapshot:reviews        # pulls from the production API
```

### Admin console

`/admin/reviews.html` is a static, crawl-blocked moderation page: paste the
API base + `ADMIN_API_TOKEN` to approve/reject/delete pending reviews and
update enquiry statuses. The token is only stored in that browser's
localStorage.

## Backend (`server/`)

```bash
cd server
npm install
cp .env.example .env   # then fill in real values
npm run dev            # nodemon on :3001
npm test               # API tests (validation, honeypot, admin auth)
npm run seed:reviews   # seed 12 approved site reviews (idempotent)
```

See `server/.env.example` for every supported key. MongoDB is optional
(`USE_MONGODB=false` runs in email-only mode); WhatsApp notifications activate
automatically when `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_ID` / `WHATSAPP_TO` are set.

## Deployment

**Backend** — Render auto-deploys from this repo on push to `main`
(start command runs `server/index.js`; env vars live in the Render dashboard,
including `ADMIN_API_TOKEN` for the admin endpoints).

**Frontend** — the host MUST rewrite all paths to `index.html` (SPA fallback),
otherwise deep links like `/attractions` 404 on hard refresh:

- **Vercel** — covered by `vercel.json` in the repo root.
- **Netlify / Cloudflare Pages** — covered by `public/_redirects`
  (copied into `dist/` at build time).
- **Other hosts** — configure the equivalent: every path that isn't an existing
  file must serve `/index.html` with a 200 status.

After deploying, verify by cold-loading `https://indiatoursguide.com/attractions`.
