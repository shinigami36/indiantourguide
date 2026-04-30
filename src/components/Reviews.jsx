import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchGoogleReviews } from '../utils/api';
import './Reviews.css';

// Number of skeleton cards to render while real Google Reviews are loading.
// No fake reviews are ever shown — if the API is unavailable we display a
// "See all reviews on Google" CTA instead.
const SKELETON_COUNT = 4;

const toAvatar = (name) => {
  if (!name) return 'GU';
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('');
  return initials || 'GU';
};

const mapGoogleReviewToCard = (review, index) => ({
  id: review.id || `${index}`,
  name: review.name || 'Google User',
  country: 'Google Review',
  avatar: toAvatar(review.name),
  rating: Number.isFinite(Number(review.rating)) ? Number(review.rating) : 5,
  date: review.relativeTimeDescription || 'Recent review',
  text: review.text || '',
});

const Stars = ({ count }) => (
  <div className="review-stars" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={i < count ? '#f59e0b' : '#e5e7eb'}
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const Reviews = () => {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  // Start with null numeric fields so the UI doesn't show a fabricated
  // rating/count before the Google Places API responds.
  const [summary, setSummary] = useState({
    businessName: 'India Tours Guide',
    rating: null,
    totalReviews: null,
    googleUrl: '',
  });

  const nudge = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  const loadReviews = useCallback(async () => {
    try {
      const payload = await fetchGoogleReviews();

      const mapped = Array.isArray(payload?.reviews)
        ? payload.reviews
            .map(mapGoogleReviewToCard)
            .filter((review) => review.text)
            .slice(0, 10)
        : [];

      setReviews(mapped);
      setSummary({
        businessName: payload?.businessName || 'India Tours Guide',
        rating: Number.isFinite(Number(payload?.rating)) ? Number(payload.rating) : null,
        totalReviews: Number.isFinite(Number(payload?.totalReviews)) ? Number(payload.totalReviews) : mapped.length,
        googleUrl: payload?.googleUrl || '',
      });
      setLoadFailed(false);
    } catch {
      // Backend not configured / API unreachable — surface an honest CTA
      // instead of fake reviews.
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch once on mount only. The backend caches the Google Places payload
    // for 24h (file-backed across restarts) and serves it with Cache-Control
    // headers, so the browser will 304 almost every request. No client-side
    // polling needed — it just wastes requests for users who leave a tab open.
    let active = true;
    (async () => {
      if (active) await loadReviews();
    })();
    return () => { active = false; };
  }, [loadReviews]);

  const badgeCountText = useMemo(() => {
    if (!summary.totalReviews) {
      return t('reviews.badgeCount', { defaultValue: 'Google Reviews' });
    }
    return `${summary.totalReviews} Google Reviews`;
  }, [summary.totalReviews, t]);

  const hasLiveRating = Number.isFinite(Number(summary.rating));
  const showSkeleton = loading && reviews.length === 0;
  const showEmptyState = !loading && reviews.length === 0;

  return (
    <section className="reviews-section" aria-labelledby="reviews-title">
      <div className="container">

        {/* Header */}
        <div className="reviews-header">
          <div className="reviews-header-text">
            <span className="section-eyebrow">{t('reviews.eyebrow', { defaultValue: 'Traveler Experiences' })}</span>
            <h2 className="section-title" id="reviews-title">{t('reviews.title', { defaultValue: 'What Travelers Say About Us' })}</h2>
            <p className="section-subtitle">{t('reviews.subtitle', { defaultValue: 'Authentic stories from explorers who trusted us with their India journey' })}</p>
          </div>
          <a
            className="reviews-badge reviews-badge--link"
            href="https://www.google.com/maps/place/indiatoursguide/@28.5886227,77.2420518,17z/data=!3m1!4b1!4m6!3m5!1s0xa6fc91abf481fa81:0x8a2c00ece6b4fc84!8m2!3d28.5886227!4d77.2420518!16s%2Fg%2F11z30dhpjg?entry=ttu&g_ep=EgoyMDI2MDQwNy4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View India Tours Guide on Google Maps"
          >
            <div className="reviews-badge-verified">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#16a34a" aria-hidden="true">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span>Verified on Google</span>
            </div>
            {hasLiveRating ? (
              <div className="reviews-badge-rating">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="reviews-badge-score">{Number(summary.rating).toFixed(1)}</span>
                <span className="reviews-badge-max">/ 5</span>
              </div>
            ) : (
              <div className="reviews-badge-rating reviews-badge-rating--loading" aria-hidden={!loading}>
                <span className="reviews-skeleton reviews-skeleton--score" />
              </div>
            )}
            {summary.totalReviews ? (
              <p className="reviews-badge-count">{badgeCountText}</p>
            ) : (
              <p className="reviews-badge-count reviews-badge-count--muted">
                {loading ? 'Loading reviews…' : 'Google Reviews'}
              </p>
            )}
            <div className="reviews-google-logo" aria-label={t('reviews.googleAria', { defaultValue: 'Google' })}>
              <span style={{ color: '#4285F4' }}>G</span>
              <span style={{ color: '#EA4335' }}>o</span>
              <span style={{ color: '#FBBC05' }}>o</span>
              <span style={{ color: '#4285F4' }}>g</span>
              <span style={{ color: '#34A853' }}>l</span>
              <span style={{ color: '#EA4335' }}>e</span>
            </div>
          </a>
        </div>

        {/* Slider */}
        <div className="reviews-wrapper">
          <button className="review-arrow review-arrow-left" onClick={() => nudge(-1)} aria-label={t('reviews.scrollLeftAria', { defaultValue: 'Scroll reviews left' })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div className="reviews-scroll" ref={scrollRef}>
            {showSkeleton
              ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                  <article key={`skeleton-${i}`} className="review-card review-card--skeleton" aria-hidden="true">
                    <div className="review-card-top">
                      <div className="reviews-skeleton reviews-skeleton--avatar" />
                      <div className="review-meta">
                        <div className="reviews-skeleton reviews-skeleton--line reviews-skeleton--line-short" />
                        <div className="reviews-skeleton reviews-skeleton--line reviews-skeleton--line-shorter" />
                      </div>
                    </div>
                    <div className="reviews-skeleton reviews-skeleton--stars" />
                    <div className="reviews-skeleton reviews-skeleton--line" />
                    <div className="reviews-skeleton reviews-skeleton--line" />
                    <div className="reviews-skeleton reviews-skeleton--line reviews-skeleton--line-short" />
                  </article>
                ))
              : showEmptyState
                ? (
                  <article className="review-card review-card--empty">
                    <p className="review-text">
                      {loadFailed
                        ? 'Live Google reviews are temporarily unavailable. Please visit our Google profile to read the latest traveler stories.'
                        : 'No reviews to display yet.'}
                    </p>
                    {summary.googleUrl ? (
                      <a className="reviews-view-link" href={summary.googleUrl} target="_blank" rel="noopener noreferrer">
                        Read reviews on Google ↗
                      </a>
                    ) : (
                      <a
                        className="reviews-view-link"
                        href="https://www.google.com/maps/place/indiatoursguide"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read reviews on Google ↗
                      </a>
                    )}
                  </article>
                )
                : reviews.map(review => (
                    <article key={review.id} className="review-card">
                      <div className="review-card-top">
                        <div className="review-avatar" aria-hidden="true">{review.avatar}</div>
                        <div className="review-meta">
                          <p className="review-name">{review.name}</p>
                          <p className="review-country">{review.country}</p>
                        </div>
                      </div>
                      <Stars count={review.rating} />
                      <p className="review-text">"{review.text}"</p>
                      <p className="review-date">{review.date}</p>
                    </article>
                  ))}
          </div>

          <button className="review-arrow review-arrow-right" onClick={() => nudge(1)} aria-label={t('reviews.scrollRightAria', { defaultValue: 'Scroll reviews right' })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Reviews;
