import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiBaseUrl, postJsonWithRetry } from '../utils/api';
import './SiteReviews.css';

const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/place/indiatoursguide/@28.5886227,77.2420518,17z/data=!3m1!4b1!4m6!3m5!1s0xa6fc91abf481fa81:0x8a2c00ece6b4fc84!8m2!3d28.5886227!4d77.2420518!16s%2Fg%2F11z30dhpjg?entry=ttu';

const INITIAL_LIMIT = 6;
const MORE_LIMIT    = 10;

const toAvatar = (name) => {
  if (!name) return 'GU';
  return String(name).trim().split(/\s+/).filter(Boolean)
    .slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'GU';
};

const Stars = ({ count, size = 14 }) => (
  <div className="sr-stars" aria-label={`${count} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg key={n} width={size} height={size} viewBox="0 0 24 24"
        fill={n <= count ? 'var(--clr-gold)' : 'var(--clr-bg-muted)'} aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const StarPicker = ({ value, onChange }) => (
  <div className="sr-star-picker" role="radiogroup" aria-label="Select rating">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        className={`sr-star-pick ${n <= value ? 'filled' : ''}`}
        onClick={() => onChange(n)}
        aria-label={`${n} star${n > 1 ? 's' : ''}`}
      >★</button>
    ))}
  </div>
);

const EMPTY_FORM = { name: '', email: '', rating: 0, title: '', content: '' };

export default function SiteReviews() {
  const [reviews, setReviews]         = useState([]);
  const [stats, setStats]             = useState(null);
  const [hasMore, setHasMore]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [submitMsg, setSubmitMsg]     = useState('');
  const formRef    = useRef(null);
  const moreAnchor = useRef(null);

  const load = useCallback(async () => {
    try {
      const res  = await fetch(`${getApiBaseUrl()}/api/reviews?skip=0&limit=${INITIAL_LIMIT}`);
      const json = await res.json();
      if (json.success) {
        setReviews(json.data.reviews);
        setStats(json.data.stats);
        setHasMore(json.data.hasMore);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res  = await fetch(`${getApiBaseUrl()}/api/reviews?skip=${reviews.length}&limit=${MORE_LIMIT}`);
      const json = await res.json();
      if (json.success) {
        setReviews((prev) => [...prev, ...json.data.reviews]);
        setHasMore(json.data.hasMore);
        // Stats don't change — total is always from the aggregate
      }
    } catch { /* silent */ } finally {
      setLoadingMore(false);
      // Scroll to first new card after render
      setTimeout(() => moreAnchor.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required.';
    if (!form.email.trim())   e.email   = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.rating)         e.rating  = 'Please select a rating.';
    if (!form.title.trim())   e.title   = 'Review title is required.';
    if (!form.content.trim()) e.content = 'Review content is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { res, data } = await postJsonWithRetry('/api/reviews', form);
      if (res.ok && data.success) {
        setSubmitStatus('success');
        setSubmitMsg(data.message || 'Thank you! Your review will appear after moderation.');
        setForm(EMPTY_FORM);
        setShowForm(false);
      } else {
        setSubmitStatus('error');
        setSubmitMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitStatus('error');
      setSubmitMsg('Could not connect. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openForm = () => {
    setShowForm(true);
    setSubmitStatus('');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const hasStats     = stats && stats.total > 0;
  const maxBreakdown = hasStats ? Math.max(...Object.values(stats.breakdown)) || 1 : 1;

  return (
    <section className="sr-section section" aria-labelledby="sr-title">
      <div className="container">

        {/* ── Section heading ──────────────────── */}
        <div className="sr-heading">
          <div>
            <span className="section-eyebrow">Customer Reviews</span>
            <h2 className="section-title" id="sr-title">What Our Travelers Say</h2>
            <p className="section-subtitle">Honest reviews from guests who trusted us with their journey</p>
          </div>
          <a
            className="sr-google-pill"
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View India Tours Guide on Google Maps"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Verified on
            <span className="sr-google-wordmark" aria-label="Google">
              <span style={{color:'#4285F4'}}>G</span><span style={{color:'#EA4335'}}>o</span><span style={{color:'#FBBC05'}}>o</span><span style={{color:'#4285F4'}}>g</span><span style={{color:'#34A853'}}>l</span><span style={{color:'#EA4335'}}>e</span>
            </span>
          </a>
        </div>

        {/* ── Summary card ─────────────────────── */}
        <div className="sr-summary">
          <div className="sr-overall">
            <span className="sr-score">{hasStats ? stats.avgRating.toFixed(1) : '—'}</span>
            <Stars count={hasStats ? Math.round(stats.avgRating) : 0} size={20} />
            <p className="sr-total">
              {hasStats
                ? <><strong>{stats.total.toLocaleString()}</strong> verified review{stats.total !== 1 ? 's' : ''}</>
                : 'No reviews yet'}
            </p>
          </div>

          <div className="sr-divider" aria-hidden="true" />

          <div className="sr-breakdown">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = hasStats ? (stats.breakdown[star] || 0) : 0;
              const pct   = hasStats ? (count / maxBreakdown) * 100 : 0;
              return (
                <div key={star} className="sr-bar-row">
                  <span className="sr-bar-label">{star} ★</span>
                  <div className="sr-bar-track">
                    <div className="sr-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="sr-bar-count">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="sr-cta-col">
            {submitStatus === 'success' && (
              <p className="sr-status sr-status--ok">{submitMsg}</p>
            )}
            {!showForm && (
              <button className="btn btn-primary sr-write-btn" onClick={openForm}>
                Write a Review
              </button>
            )}
          </div>
        </div>

        {/* ── Write-review form ────────────────── */}
        {showForm && (
          <div ref={formRef} className="sr-form-wrap">
            <form className="sr-form" onSubmit={handleSubmit} noValidate>
              <h3 className="sr-form-title">Write a review</h3>

              <div className="sr-field sr-field--center">
                <span className="sr-label">RATING</span>
                <StarPicker value={form.rating} onChange={(v) => { setForm((p) => ({ ...p, rating: v })); setErrors((p) => ({ ...p, rating: '' })); }} />
                {errors.rating && <span className="sr-err">{errors.rating}</span>}
              </div>

              <div className="sr-field sr-field--center">
                <span className="sr-label">REVIEW TITLE</span>
                <input className={`sr-input ${errors.title ? 'sr-input--err' : ''}`}
                  name="title" value={form.title} onChange={handleChange}
                  placeholder="Give your review a title" />
                {errors.title && <span className="sr-err">{errors.title}</span>}
              </div>

              <div className="sr-field sr-field--center">
                <span className="sr-label">REVIEW CONTENT</span>
                <textarea className={`sr-textarea ${errors.content ? 'sr-input--err' : ''}`}
                  name="content" value={form.content} onChange={handleChange}
                  rows={5} placeholder="Start writing here..." />
                {errors.content && <span className="sr-err">{errors.content}</span>}
              </div>

              <div className="sr-field sr-field--center">
                <span className="sr-label">PICTURE / VIDEO (OPTIONAL)</span>
                <div className="sr-upload-box" aria-label="Upload photo or video">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 0l-3 3m3-3l3 3"/>
                  </svg>
                </div>
              </div>

              <div className="sr-field sr-field--center">
                <span className="sr-label">DISPLAY NAME <span className="sr-label-sub">(displayed publicly)</span></span>
                <input className={`sr-input ${errors.name ? 'sr-input--err' : ''}`}
                  name="name" value={form.name} onChange={handleChange}
                  placeholder="Display name" />
                {errors.name && <span className="sr-err">{errors.name}</span>}
              </div>

              <div className="sr-field sr-field--center">
                <span className="sr-label">EMAIL ADDRESS</span>
                <input type="email" className={`sr-input ${errors.email ? 'sr-input--err' : ''}`}
                  name="email" value={form.email} onChange={handleChange}
                  placeholder="Your email address" />
                {errors.email && <span className="sr-err">{errors.email}</span>}
                <p className="sr-privacy">
                  How we use your data: We'll only contact you about the review you left, and only if necessary. By submitting your review, you agree to our terms &amp; privacy policy.
                </p>
              </div>

              {submitStatus === 'error' && (
                <p className="sr-status sr-status--err">{submitMsg}</p>
              )}

              <div className="sr-form-actions">
                <button type="button" className="btn sr-btn-cancel" onClick={() => setShowForm(false)}>
                  Cancel review
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Review cards ─────────────────────── */}
        <div className="sr-cards">
          {loading
            ? [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="sr-card sr-card--skel" aria-hidden="true">
                  <div className="sr-card-top">
                    <div className="sr-skel sr-skel--avatar" />
                    <div className="sr-card-meta">
                      <div className="sr-skel sr-skel--line sr-skel--short" />
                      <div className="sr-skel sr-skel--line sr-skel--shorter" />
                    </div>
                  </div>
                  <div className="sr-skel sr-skel--stars" />
                  <div className="sr-skel sr-skel--line" />
                  <div className="sr-skel sr-skel--line" />
                  <div className="sr-skel sr-skel--line sr-skel--short" />
                </div>
              ))
            : reviews.length === 0
              ? (
                <div className="sr-empty">
                  <p>No reviews yet — be the first to share your experience!</p>
                  {!showForm && (
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openForm}>
                      Write the first review
                    </button>
                  )}
                </div>
              )
              : reviews.map((r, idx) => (
                  <article
                    key={r._id}
                    className="sr-card"
                    ref={idx === reviews.length - MORE_LIMIT ? moreAnchor : null}
                  >
                    <div className="sr-card-top">
                      <div className="sr-avatar" aria-hidden="true">{toAvatar(r.name)}</div>
                      <div>
                        <p className="sr-name">{r.name}</p>
                        <p className="sr-date">
                          {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <Stars count={r.rating} />
                    <p className="sr-card-title">{r.title}</p>
                    <p className="sr-card-body">"{r.content}"</p>
                  </article>
                ))}
        </div>

        {/* ── Show more / Show less / counter ─────── */}
        {!loading && reviews.length > 0 && (
          <div className="sr-footer">
            <p className="sr-shown-count">
              Showing {reviews.length.toLocaleString()} of {(stats?.total ?? reviews.length).toLocaleString()} reviews
            </p>
            <div className="sr-footer-btns">
              {hasMore && (
                <button
                  className="btn sr-load-more-btn"
                  onClick={loadMore}
                  disabled={loadingMore}
                  aria-label="Load more reviews"
                >
                  {loadingMore
                    ? <><span className="sr-spinner" aria-hidden="true" /> Loading…</>
                    : 'Show more reviews'}
                </button>
              )}
              {reviews.length > INITIAL_LIMIT && (
                <button
                  className="btn sr-show-less-btn"
                  onClick={() => {
                    setReviews((prev) => prev.slice(0, INITIAL_LIMIT));
                    setHasMore(true);
                    window.scrollTo({ top: document.getElementById('sr-title')?.offsetTop - 100 ?? 0, behavior: 'smooth' });
                  }}
                  aria-label="Show fewer reviews"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
