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

    </section>
  );
};

export default Hero;