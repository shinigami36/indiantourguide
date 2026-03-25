import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = ({ onNavigate }) => {
  const { t } = useTranslation();

  const goToSection = (sectionId) => {
    onNavigate('home');
    setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <button type="button" className="logo" onClick={() => onNavigate('home')}>
              <img
                src="/assets/images/icons/Screenshot%202026-02-19%20at%208.32.35%E2%80%AFPM.png"
                alt="indiatourguide Logo"
                width="40"
                height="40"
              />
              <span>indiatourguide</span>
            </button>
            <p>{t('footer.brand')}</p>
            <div className="social-links">
              <a href="https://www.facebook.com/share/1MhrNAYwni/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.instagram.com/indiatourguide_?igsh=MWxrdzc0ODl3aGY4MQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
            <div className="payment-methods">
              <span className="payment-badge">Visa</span>
              <span className="payment-badge">Mastercard</span>
              <span className="payment-badge">PayPal</span>
              <span className="payment-badge">UPI</span>
            </div>
          </div>

          <nav className="footer-links" aria-label="Quick links">
            <h3>{t('footer.links')}</h3>
            <ul>
              <li><button type="button" onClick={() => goToSection('packages')}>{t('footer.tours', { defaultValue: 'Tours' })}</button></li>
              <li><button type="button" onClick={() => goToSection('enquiry')}>{t('footer.contactNow', { defaultValue: 'Contact Now' })}</button></li>
            </ul>
          </nav>

          <div className="footer-contact">
            <h3>{t('footer.contact')}</h3>
            <ul>
              <li>{t('footer.email', { defaultValue: 'Email' })}: <a href="mailto:indiatourguide1@gmail.com">indiatourguide1@gmail.com</a></li>
              <li>{t('footer.whatsapp', { defaultValue: 'WhatsApp' })}: <a href="https://wa.me/917302028445" target="_blank" rel="noopener noreferrer">+91-730-202-8445</a></li>
              <li>{t('footer.facebook', { defaultValue: 'Facebook' })}: <a href="https://www.facebook.com/share/1MhrNAYwni/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">{t('footer.followOnFacebook', { defaultValue: 'Follow us on Facebook' })}</a></li>
              <li>{t('footer.instagram', { defaultValue: 'Instagram' })}: <a href="https://www.instagram.com/indiatourguide_?igsh=MWxrdzc0ODl3aGY4MQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">{t('footer.followOnInstagram', { defaultValue: 'Follow us on Instagram' })}</a></li>
              <li>{t('footer.address')}: 12 Heritage Lane, New Delhi 110001, India</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© <span id="year">{new Date().getFullYear()}</span> indiatourguide. {t('footer.copyright')}</span>
          <span>{t('footer.privacy')} · {t('footer.terms')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;