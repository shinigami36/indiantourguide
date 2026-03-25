import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

const Header = ({ currentPage, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russian' },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  // Navigate home then scroll to a section id (works from any page)
  const goToSection = (sectionId) => {
    onNavigate('home');
    closeMenu();
    setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">

        <button
          type="button"
          className="brand"
          aria-label={t('header.brandHomeAria', { defaultValue: 'indiatourguide Home' })}
          onClick={() => { onNavigate('home'); closeMenu(); }}
        >
          <img
            className="brand-logo"
            src="/assets/images/icons/Screenshot%202026-02-19%20at%208.32.35%E2%80%AFPM.png"
            alt="indiatourguide logo"
          />
          <span className="brand-copy">
            <span className="brand-name" aria-hidden="true">
              <span className="brand-name-primary">India</span>
              <span className="brand-name-accent">Tour</span>
              <span className="brand-mark" aria-hidden="true"></span>
              <span className="brand-name-primary">Guide</span>
            </span>
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
                className={`nav-page-link ${currentPage === 'home' ? 'active' : ''}`}
                onClick={() => { onNavigate('home'); closeMenu(); }}
                aria-current={currentPage === 'home' ? 'page' : undefined}
              >
                {t('nav.home')}
              </button>
            </li>
            <li>
              <button className="nav-page-link" onClick={() => goToSection('packages')}>
                {t('nav.tours', { defaultValue: 'Tours' })}
              </button>
            </li>
            <li>
              <button
                className={`nav-page-link ${currentPage === 'attractions' ? 'active' : ''}`}
                onClick={() => { onNavigate('attractions'); closeMenu(); }}
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
              <button className="btn btn-primary mobile-nav-contact-btn" onClick={() => goToSection('enquiry')}>
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

          <button className="btn btn-primary contact-btn desktop-only" onClick={() => goToSection('enquiry')}>
            {t('nav.contact')}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;
