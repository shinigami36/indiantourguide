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

      {/* Questia Riga-style SVG route path overlay */}
      <svg
        className="hero-route-svg"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* Curved travel route path */}
        <path
          className="hero-route-path"
          d="M -50 600 C 150 550, 250 480, 380 420 C 480 370, 520 300, 600 260 C 680 220, 750 200, 860 180 C 940 165, 1020 155, 1150 130"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2.5"
          strokeDasharray="8 6"
        />
        {/* Start pin — bottom left */}
        <g className="hero-pin hero-pin--start" transform="translate(378,418)">
          <circle r="18" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
          <circle r="7" fill="#e87843"/>
        </g>
        {/* Mid pin */}
        <g className="hero-pin hero-pin--mid" transform="translate(600,258)">
          <circle r="14" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
          <circle r="5" fill="rgba(255,255,255,0.9)"/>
        </g>
        {/* End pin — top right */}
        <g className="hero-pin hero-pin--end" transform="translate(858,178)">
          <circle r="22" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.7)" strokeWidth="2"/>
          {/* Map pin icon */}
          <path d="M0 -9 C-4 -9,-7 -6,-7 -2 C-7 3,0 9,0 9 C0 9,7 3,7 -2 C7 -6,4 -9,0 -9 Z" fill="#e87843"/>
          <circle cx="0" cy="-2" r="2.5" fill="white"/>
        </g>

        {/* Destination label bubbles */}
        <g className="hero-route-label hero-route-label--1" transform="translate(320,395)">
          <rect x="0" y="0" width="80" height="22" rx="11" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
          <text x="40" y="15" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="sans-serif">Agra</text>
        </g>
        <g className="hero-route-label hero-route-label--2" transform="translate(540,230)">
          <rect x="0" y="0" width="80" height="22" rx="11" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
          <text x="40" y="15" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="sans-serif">Jaipur</text>
        </g>
        <g className="hero-route-label hero-route-label--3" transform="translate(870,148)">
          <rect x="0" y="0" width="90" height="22" rx="11" fill="rgba(232,120,67,0.85)" stroke="rgba(232,120,67,0.4)" strokeWidth="1"/>
          <text x="45" y="15" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="sans-serif">New Delhi</text>
        </g>
      </svg>

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
