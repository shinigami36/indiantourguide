import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Reviews.css';

// ─── Static review data ────────────────────────────────────────────────────
// To connect live Google Reviews, call your backend endpoint
// (e.g. GET /api/reviews) which proxies the Google Places API using your
// GOOGLE_PLACES_API_KEY and place ID. Replace REVIEWS with the fetched data.
const REVIEWS = [
  {
    id: 1,
    name: 'James Anderson',
    country: 'United Kingdom',
    avatar: 'JA',
    rating: 5,
    date: 'February 2026',
    text: 'Absolutely incredible experience! Our guide was knowledgeable, the itinerary was perfectly paced, and the Taj Mahal at sunrise is something I will never forget. World Tour India made every detail seamless.',
  },
  {
    id: 2,
    name: 'Sophie Laurent',
    country: 'France',
    avatar: 'SL',
    rating: 5,
    date: 'January 2026',
    text: 'From the Golden Triangle to Jaipur, every moment was magical. The private driver was punctual and professional, and the hotels were beautifully chosen. I would book with them again without hesitation.',
  },
  {
    id: 3,
    name: 'Michael Chen',
    country: 'Australia',
    avatar: 'MC',
    rating: 5,
    date: 'December 2025',
    text: 'Best travel experience of my life. The team responded instantly to all my questions before the trip and the on-ground support was exceptional. Highly recommended for first-time India visitors.',
  },
  {
    id: 4,
    name: 'Maria Santos',
    country: 'Brazil',
    avatar: 'MS',
    rating: 5,
    date: 'November 2025',
    text: 'We did the Golden Triangle with Varanasi — the sunset boat ride on the Ganges was breathtaking. Every guide was passionate about sharing their culture. A truly transformative journey.',
  },
  {
    id: 5,
    name: 'David Müller',
    country: 'Germany',
    avatar: 'DM',
    rating: 5,
    date: 'October 2025',
    text: 'Excellent organisation and very personal service. The customised itinerary matched our interest in history and architecture perfectly. Amber Fort and Fatehpur Sikri were highlights we will treasure forever.',
  },
  {
    id: 6,
    name: 'Yuki Tanaka',
    country: 'Japan',
    avatar: 'YT',
    rating: 5,
    date: 'September 2025',
    text: 'Professional, friendly, and genuinely caring. Our guide spoke excellent English and shared wonderful stories behind every monument. The Red Fort tour was spectacular. We will definitely return!',
  },
  {
    id: 7,
    name: 'Emma Wilson',
    country: 'Canada',
    avatar: 'EW',
    rating: 5,
    date: 'August 2025',
    text: 'Booked the Jaipur day tour and was blown away. The elephant safari at Amber Fort and the City Palace were incredible. The team was flexible when I wanted to extend the tour — top-class service.',
  },
];

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

  const nudge = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

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
          <div className="reviews-badge">
            <div className="reviews-badge-rating">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="reviews-badge-score">4.9</span>
              <span className="reviews-badge-max">/ 5</span>
            </div>
            <p className="reviews-badge-count">{t('reviews.badgeCount', { defaultValue: '128 Google Reviews' })}</p>
            <div className="reviews-google-logo" aria-label={t('reviews.googleAria', { defaultValue: 'Google' })}>
              <span style={{ color: '#4285F4' }}>G</span>
              <span style={{ color: '#EA4335' }}>o</span>
              <span style={{ color: '#FBBC05' }}>o</span>
              <span style={{ color: '#4285F4' }}>g</span>
              <span style={{ color: '#34A853' }}>l</span>
              <span style={{ color: '#EA4335' }}>e</span>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="reviews-wrapper">
          <button className="review-arrow review-arrow-left" onClick={() => nudge(-1)} aria-label={t('reviews.scrollLeftAria', { defaultValue: 'Scroll reviews left' })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div className="reviews-scroll" ref={scrollRef}>
            {REVIEWS.map(review => (
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
