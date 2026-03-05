import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <a href="/" className="logo">
              <img
                src="/assets/images/icons/Screenshot%202026-02-19%20at%208.32.35%E2%80%AFPM.png"
                alt="indiatourguide Logo"
                width="40"
                height="40"
              />
              <span>indiatourguide</span>
            </a>
            <p>{t('footer.brand')}</p>
            <div className="social-links">
              <a href="https://www.facebook.com/share/1MhrNAYwni/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.instagram.com/indiatourguide_?igsh=MWxrdzc0ODl3aGY4MQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
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
              <li><a href="/tours">Tours</a></li>
              <li><a href="/contact">Contact Now</a></li>
            </ul>
          </nav>

          <div className="footer-contact">
            <h3>{t('footer.contact')}</h3>
            <ul>
              <li>Email: <a href="mailto:indiatourguide1@gmail.com">indiatourguide1@gmail.com</a></li>
              <li>WhatsApp: <a href="https://wa.me/917302028445" target="_blank" rel="noopener noreferrer">+91-730-202-8445</a></li>
              <li>Facebook: <a href="https://www.facebook.com/share/1MhrNAYwni/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">Follow us on Facebook</a></li>
              <li>Instagram: <a href="https://www.instagram.com/indiatourguide_?igsh=MWxrdzc0ODl3aGY4MQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">Follow us on Instagram</a></li>
              <li>{t('footer.address')}: 12 Heritage Lane, New Delhi 110001, India</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© <span id="year">{new Date().getFullYear()}</span> indiatourguide. {t('footer.copyright')}</span>
          <span><a href="/privacy">{t('footer.privacy')}</a> · <a href="/terms">{t('footer.terms')}</a></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;