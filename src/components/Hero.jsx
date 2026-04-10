import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Hero.css';

const DESTINATIONS = [
  'Golden Triangle Tour',
  'Full Day Agra Tour',
  'Jaipur Day Tour',
  'Half Day Old Delhi Tour',
  'Half Day New Delhi Tour',
  'Full Day New & Old Delhi Tour',
  'Golden Triangle with Mumbai',
  'Golden Triangle Tour with Varanasi',
];

const DAYS_OPTIONS = [
  '3–4 Days', '5–6 Days', '7–8 Days', '9–10 Days', '11–14 Days', '15+ Days',
];

const Hero = ({ onOpenEnquiry, onGetEstimate }) => {
  const { t } = useTranslation();
  const [destination, setDestination] = useState('');
  const [travellers, setTravellers] = useState(2);
  const [days, setDays] = useState('');
  const [openField, setOpenField] = useState(null); // 'destination' | 'travellers' | 'days'

  const barRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setOpenField(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (field) => setOpenField(prev => prev === field ? null : field);

  const handleEstimate = () => {
    if (onGetEstimate) {
      onGetEstimate({ destination, travellers, days });
    } else {
      onOpenEnquiry();
    }
  };

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

          {/* Interactive search bar */}
          <div className="hero-search-bar" ref={barRef}>

            {/* Destination */}
            <div className="hero-search-field hero-search-field--btn" onClick={() => toggle('destination')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{color:'var(--clr-primary)'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className={destination ? 'hero-field-value' : ''}>{destination || 'Destination'}</span>
              <svg className="hero-search-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              {openField === 'destination' && (
                <ul className="hero-field-dropdown">
                  {DESTINATIONS.map(d => (
                    <li key={d} className={destination === d ? 'selected' : ''} onMouseDown={(e) => { e.preventDefault(); setDestination(d); setOpenField(null); }}>
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="hero-search-divider" aria-hidden="true"/>

            {/* Travellers */}
            <div className="hero-search-field hero-search-field--btn" onClick={() => toggle('travellers')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{color:'var(--clr-primary)'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span className="hero-field-value">{travellers} {travellers === 1 ? 'Traveller' : 'Travellers'}</span>
              <svg className="hero-search-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              {openField === 'travellers' && (
                <div className="hero-field-dropdown hero-field-dropdown--travellers" onMouseDown={(e) => e.preventDefault()}>
                  <span className="hero-traveller-label">Number of Travellers</span>
                  <div className="hero-traveller-stepper">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setTravellers(n => Math.max(1, n - 1)); }}>−</button>
                    <strong>{travellers}</strong>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setTravellers(n => Math.min(30, n + 1)); }}>+</button>
                  </div>
                  <button type="button" className="hero-done-btn" onClick={(e) => { e.stopPropagation(); setOpenField(null); }}>Done</button>
                </div>
              )}
            </div>

            <div className="hero-search-divider" aria-hidden="true"/>

            {/* Days */}
            <div className="hero-search-field hero-search-field--btn" onClick={() => toggle('days')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{color:'var(--clr-primary)'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span className={days ? 'hero-field-value' : ''}>{days || 'Select Days'}</span>
              <svg className="hero-search-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              {openField === 'days' && (
                <ul className="hero-field-dropdown">
                  {DAYS_OPTIONS.map(d => (
                    <li key={d} className={days === d ? 'selected' : ''} onMouseDown={(e) => { e.preventDefault(); setDays(d); setOpenField(null); }}>
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button className="hero-search-btn" onClick={handleEstimate}>
              Get Estimate
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
