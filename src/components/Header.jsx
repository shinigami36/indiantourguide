import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

const Header = ({ currentPage, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sectionActive, setSectionActive] = useState('');
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
    { code: 'ko', name: '한국어' },
    { code: 'ar', name: 'العربية' },
    { code: 'ru', name: 'Русский' },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  // Navigate to a full page and clear any section highlight
  const navigatePage = (page) => {
    onNavigate(page);
    setSectionActive('');
    closeMenu();
  };

  // Navigate home then scroll to a section id (works from any page)
  const goToSection = (sectionId) => {
    onNavigate('home');
    setSectionActive(sectionId);
    closeMenu();
    setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">

        <button
          type="button"
          className="brand"
          aria-label={t('header.brandHomeAria', { defaultValue: 'indiatoursguide Home' })}
          onClick={() => { onNavigate('home'); closeMenu(); }}
        >
          <img
            className="brand-logo"
            src="/assets/images/icons/Screenshot%202026-02-19%20at%208.32.35%E2%80%AFPM.png"
            alt="indiatoursguide logo"
          />
          <span className="brand-copy">
            <span className="brand-name">indiatoursguide</span>
            <small className="brand-tag">{t('header.brandTag', { defaultValue: 'Authentic India & World Travel' })}</small>
          </span>
        </button>

        <button
          className="menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="primaryNav"
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen(prev => !prev)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/>
          </svg>
        </button>

        <nav className="primary-nav" aria-label="Primary">
          <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`} id="primaryNav">
            <li>
              <button
                className={`nav-page-link ${currentPage === 'home' && !sectionActive ? 'active' : ''}`}
                onClick={() => navigatePage('home')}
                aria-current={currentPage === 'home' && !sectionActive ? 'page' : undefined}
              >
                {t('nav.home')}
              </button>
            </li>
            <li>
              <button
                className={`nav-page-link ${sectionActive === 'packages' ? 'active' : ''}`}
                onClick={() => goToSection('packages')}
              >
                {t('nav.tours', { defaultValue: 'Tours' })}
              </button>
            </li>
            <li>
              <button
                className={`nav-page-link ${currentPage === 'international' ? 'active' : ''}`}
                onClick={() => navigatePage('international')}
                aria-current={currentPage === 'international' ? 'page' : undefined}
              >
                {t('nav.internationalTour', { defaultValue: 'International Tours' })}
              </button>
            </li>
            <li>
              <button
                className={`nav-page-link ${currentPage === 'attractions' ? 'active' : ''}`}
                onClick={() => navigatePage('attractions')}
                aria-current={currentPage === 'attractions' ? 'page' : undefined}
              >
                {t('nav.attractions', { defaultValue: 'Attractions' })}
              </button>
            </li>
            <li className="mobile-only-nav-item">
              <select
                value={i18n.resolvedLanguage || 'en'}
                onChange={(e) => { i18n.changeLanguage(e.target.value); closeMenu(); }}
                className="language-select mobile-nav-lang"
                aria-label="Select language"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </li>
            <li className="mobile-only-nav-item">
              <button className="btn btn-primary mobile-nav-contact-btn" onClick={() => { setSectionActive(''); goToSection('enquiry'); }}>
                {t('nav.contact')}
              </button>
            </li>
          </ul>
        </nav>

        <div className="header-right">
          <div className="language-selector desktop-only">
            <select
              value={i18n.resolvedLanguage || 'en'}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="language-select"
              aria-label="Select language"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary contact-btn desktop-only" onClick={() => { setSectionActive(''); goToSection('enquiry'); }}>
            {t('nav.contact')}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;
