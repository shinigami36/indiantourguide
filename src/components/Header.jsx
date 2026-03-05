import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russian' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="site-header">
      <div className="container header-inner">

        <a href="/" className="brand" aria-label="indiatourguide Home">
          <img
            className="brand-logo"
            src="/assets/images/icons/Screenshot%202026-02-19%20at%208.32.35%E2%80%AFPM.png"
            alt="indiatourguide logo"
          />
          <span>
            <span className="brand-name">indiatourguide</span>
            <small className="brand-tag">Authentic India & World Travel</small>
          </span>
        </a>

        <button
          className="menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="primaryNav"
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/>
          </svg>
        </button>

        <nav className="primary-nav" aria-label="Primary">
          <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`} id="primaryNav">
            <li><a href="/" aria-current="page">{t('nav.home')}</a></li>
            <li><a href="#packages">{t('nav.northTour')}</a></li>
            <li><a href="#packages">{t('nav.southTour')}</a></li>

            <li className="dropdown" ref={dropdownRef}>
              <button
                className="dropdown-toggle"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {t('nav.internationalTour')}
                <svg
                  className={`dropdown-chevron ${isDropdownOpen ? 'rotated' : ''}`}
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {isDropdownOpen && (
                <ul className="dropdown-menu" role="menu">
                  <li role="none">
                    <a href="#packages" role="menuitem" onClick={() => setIsDropdownOpen(false)}>
                      {t('nav.thailand')}
                    </a>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div className="header-right">
          <div className="language-selector">
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="language-select"
              aria-label="Select language"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <a href="#enquiry" className="btn btn-primary contact-btn">
            {t('nav.contact')}
          </a>
        </div>

      </div>
    </header>
  );
};

export default Header;
