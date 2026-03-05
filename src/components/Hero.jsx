import { useTranslation } from 'react-i18next';
import './Hero.css';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <video className="hero-video" autoPlay muted loop playsInline>
        <source src="/assets/images/India-360-v2.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay"></div>
      <div className="container hero-inner">
        <div className="hero-content">
          <h1>{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <p className="hero-description">{t('hero.description')}</p>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;