import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { COMING_SOON_COUNTRIES } from '../data/foreignTours';
import './Header.css';

const Header = ({ onOpenEnquiry }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sectionActive, setSectionActive] = useState('');
  const [intlDropdownOpen, setIntlDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const intlDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
    { code: 'th', name: 'ภาษาไทย' },
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

  // Shared cleanup when any nav link is followed
  const handleNavClick = () => {
    setSectionActive('');
    setIntlDropdownOpen(false);
    closeMenu();
  };

  const goToSection = (sectionId) => {
    if (pathname !== '/') navigate('/');
    setSectionActive(sectionId);
    closeMenu();
    setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">

        <Link
          to="/"
          className="brand"
          aria-label="India Tours Guide Home"
          onClick={handleNavClick}
        >
          <img
            className="brand-logo"
            src="/assets/images/logo.png"
            alt="India Tours Guide logo"
          />
          <span className="brand-copy">
            <span className="brand-name brand-name--script">India Tours Guide</span>
            <small className="brand-tag">{t('header.brandTag', { defaultValue: 'Authentic India & World Travel' })}</small>
          </span>
        </Link>

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
              <Link
                to="/"
                className={`nav-page-link ${pathname === '/' && !sectionActive ? 'active' : ''}`}
                onClick={handleNavClick}
                aria-current={pathname === '/' && !sectionActive ? 'page' : undefined}
              >
                {t('nav.home')}
              </Link>
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
                className={`dropdown-toggle nav-page-link ${pathname === '/international' ? 'active' : ''}`}
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
                <ul className="dropdown-menu intl-dropdown-menu" role="menu">
                  {/* Turkey — live */}
                  <li role="none" className="intl-dropdown-item">
                    <button
                      className="intl-dest-btn"
                      role="menuitem"
                      onClick={() => { handleNavClick(); navigate('/international'); }}
                    >
                      <span className="intl-dest-flag">🇹🇷</span>
                      <span className="intl-dest-name">Turkey</span>
                      <span className="intl-dest-badge intl-dest-badge--live">Available</span>
                    </button>
                  </li>

                  <li role="none" className="intl-dropdown-divider" />

                  {/* Coming soon destinations — same source as the International page */}
                  {COMING_SOON_COUNTRIES.map(dest => (
                    <li key={dest.country} role="none" className="intl-dropdown-item">
                      <div className="intl-dest-row">
                        <span className="intl-dest-flag">{dest.flag}</span>
                        <span className="intl-dest-name">{dest.country}</span>
                        <span className="intl-dest-badge intl-dest-badge--soon">Coming Soon</span>
                      </div>
                      <button
                        className="intl-register-btn"
                        role="menuitem"
                        onClick={() => { setIntlDropdownOpen(false); closeMenu(); onOpenEnquiry(); }}
                      >
                        Register Interest
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li>
              <Link
                to="/attractions"
                className={`nav-page-link ${pathname === '/attractions' ? 'active' : ''}`}
                onClick={handleNavClick}
                aria-current={pathname === '/attractions' ? 'page' : undefined}
              >
                {t('nav.attractions', { defaultValue: 'Attractions' })}
              </Link>
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
