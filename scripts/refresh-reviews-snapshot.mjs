// Refresh src/data/reviewsSnapshot.json from the live reviews API so the
// instantly-rendered snapshot doesn't drift from reality. Run before a
// deploy (or whenever reviews change):
//
//   npm run snapshot:reviews                       # uses the production API
//   npm run snapshot:reviews -- http://localhost:3001
//
// Deliberately NOT part of `npm run build` — builds must not depend on the
// backend being reachable (Render's free tier sleeps).
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DEFAULT_API = 'https://api.indiatoursguide.com';
const LIMIT = 6; // must match INITIAL_LIMIT in SiteReviews.jsx

const base = (process.argv[2] || process.env.VITE_API_URL || DEFAULT_API).replace(/\/$/, '');
const target = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..', 'src', 'data', 'reviewsSnapshot.json'
);

const res = await fetch(`${base}/api/reviews?skip=0&limit=${LIMIT}`);
if (!res.ok) {
  console.error(`Failed: ${base} responded ${res.status}`);
  process.exit(1);
}
const body = await res.json();
if (!body?.success || !Array.isArray(body?.data?.reviews)) {
  console.error('Failed: unexpected response shape', JSON.stringify(body).slice(0, 200));
  process.exit(1);
}

const { reviews, hasMore, stats } = body.data;
await writeFile(target, JSON.stringify({ reviews, hasMore, stats }, null, 2) + '\n');
console.log(`Wrote ${reviews.length} reviews (avg ${stats?.avgRating}, total ${stats?.total}) → ${path.relative(process.cwd(), target)}`);
