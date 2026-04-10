import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

const INTL_DESTINATIONS = [
  'Maldives', 'Thailand', 'Indonesia', 'Vietnam', 'Dubai',
  'Malaysia', 'Singapore', 'Andaman & Nicobar Islands', 'Nepal', 'Sri Lanka',
];

const Header = ({ currentPage, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sectionActive, setSectionActive] = useState('');
  const [intlDropdownOpen, setIntlDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const intlDropdownRef = useRef(null);

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

  // Close intl dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (intlDropdownRef.current && !intlDropdownRef.current.contains(e.target)) {
        setIntlDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const navigatePage = (page) => {
    onNavigate(page);
    setSectionActive('');
    setIntlDropdownOpen(false);
    closeMenu();
  };

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
          aria-label="India Tours Guide Home"
          onClick={() => { onNavigate('home'); closeMenu(); }}
        >
          <img
            className="brand-logo"
            src="/assets/images/icons/Screenshot%202026-02-19%20at%208.32.35%E2%80%AFPM.png"
            alt="India Tours Guide logo"
          />
          <span className="brand-copy">
            <span className="brand-name">India Tours Guide</span>
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

            {/* International Tours with dropdown */}
            <li className="dropdown" ref={intlDropdownRef}>
              <button
                className={`dropdown-toggle nav-page-link ${currentPage === 'international' ? 'active' : ''}`}
                onClick={() => setIntlDropdownOpen(prev => !prev)}
                aria-haspopup="true"
                aria-expanded={intlDropdownOpen}
              >
                {t('nav.internationalTour', { defaultValue: 'International Tours' })}
                <svg
                  className={`dropdown-chevron${intlDropdownOpen ? ' rotated' : ''}`}
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {intlDropdownOpen && (
                <ul className="dropdown-menu" role="menu">
                  <li role="none">
                    <button
                      className="dropdown-item-btn"
                      role="menuitem"
                      onClick={() => navigatePage('international')}
                    >
                      All International Tours
                    </button>
                  </li>
                  <li role="none" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', margin: '0.25rem 0' }} />
                  {INTL_DESTINATIONS.map(dest => (
                    <li key={dest} role="none">
                      <button
                        className="dropdown-item-btn"
                        role="menuitem"
                        onClick={() => navigatePage('international')}
                      >
                        {dest}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
