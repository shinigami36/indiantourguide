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
          <h1>{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <p className="hero-description">{t('hero.description')}</p>

          <div className="hero-actions">
            <button className="btn hero-btn-primary" onClick={onScrollToTours}>
              {t('hero.exploreTours', { defaultValue: 'Explore Tours' })}
            </button>
            <button className="btn hero-btn-ghost" onClick={onOpenEnquiry}>
              {t('hero.getQuote', { defaultValue: 'Get a Free Quote' })}
            </button>
          </div>

          <div className="hero-trust">
            <span className="hero-trust-item">✓ Private Tours</span>
            <span className="hero-trust-dot" aria-hidden="true">·</span>
            <span className="hero-trust-item">✓ Expert Guides</span>
            <span className="hero-trust-dot" aria-hidden="true">·</span>
            <span className="hero-trust-item">✓ 4.9★ Rated</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;