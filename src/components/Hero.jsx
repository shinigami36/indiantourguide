import { useTranslation } from 'react-i18next';
import './Hero.css';

const Hero = ({ onOpenEnquiry, onScrollToTours }) => {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <img
        className="hero-bg-img"
        src="/assets/images/tajmahaelherocss.avif"
        alt=""
        aria-hidden="true"
      />
      <div className="hero-overlay"></div>
      <div className="container hero-inner">
        <div className="hero-content">
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <h1>{t('hero.title')}</h1>
          <p className="hero-description">{t('hero.description')}</p>

          {/* Search / estimate bar */}
          <div className="hero-search-bar">
            <div className="hero-search-field">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Destination</span>
              <svg className="hero-search-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div className="hero-search-divider" aria-hidden="true"/>
            <div className="hero-search-field">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Travellers</span>
              <svg className="hero-search-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div className="hero-search-divider" aria-hidden="true"/>
            <div className="hero-search-field">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Select Days</span>
              <svg className="hero-search-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <button className="hero-search-btn" onClick={onOpenEnquiry}>
              Get Estimate
            </button>
          </div>
        </div>
      </div>

      {/* Floating cards — direct children of <section> to avoid layout interference */}
      <div className="hero-floating-review">
        <div className="hero-float-avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div className="hero-float-review-content">
          <div className="hero-float-stars">★★★★★</div>
          <div className="hero-float-name">James Anderson</div>
          <div className="hero-float-text">Unforgettable experience. Will plan again!</div>
        </div>
      </div>

      <div className="hero-floating-location">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <span>New Delhi, India</span>
        <span className="hero-float-date">· Taj Mahal Sunrise</span>
      </div>
    </section>
  );
};

export default Hero;