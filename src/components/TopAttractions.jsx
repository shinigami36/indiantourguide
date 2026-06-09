import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './TopAttractions.css';

const featured = [
  {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    state: 'Uttar Pradesh',
    image: '/assets/home-page-attraction/Taj mahal.jpg',
    gradient: 'linear-gradient(135deg, #c8a97e 0%, #a07850 100%)',
  },
  {
    id: 'red-fort',
    name: 'Red Fort',
    state: 'Delhi',
    image: '/assets/home-page-attraction/red fort.jpg',
    gradient: 'linear-gradient(135deg, #d4846a 0%, #b85c3a 100%)',
  },
  {
    id: 'lotus-temple',
    name: 'Lotus Temple',
    state: 'Delhi',
    image: '/assets/home-page-attraction/lotus temple.jpg',
    gradient: 'linear-gradient(135deg, #e8d5c4 0%, #c4a882 100%)',
  },
  {
    id: 'qutb-minar',
    name: 'Qutb Minar',
    state: 'Delhi',
    image: '/assets/home-page-attraction/kutub minar.jpg',
    gradient: 'linear-gradient(135deg, #b8c4a0 0%, #8a9e70 100%)',
  },
  {
    id: 'amber-fort',
    name: 'Amber Fort',
    state: 'Rajasthan',
    image: '/assets/home-page-attraction/amber fort.jpg',
    gradient: 'linear-gradient(135deg, #e6c97e 0%, #c8a040 100%)',
  },
];

const VISIBLE = 4; // cards visible at once on desktop

const TopAttractions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goToAttractions = () => navigate('/attractions');
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const nudge = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.offsetWidth ?? 300;
    el.scrollBy({ left: dir * (cardWidth + 16), behavior: 'smooth' });
    setTimeout(updateArrows, 350);
  };

  return (
    <section className="ta-section" id="attractions-home">

      {/* ── Refined section header ── */}
      <div className="ta-header">
        <div className="container">
          <span className="ta-eyebrow-tag">
            {t('topAttractions.eyebrow', { defaultValue: 'Must-See Destinations' })}
          </span>
          <div className="ta-header-row">
            <h2 className="ta-title">
              {t('topAttractions.title', { defaultValue: 'Iconic India' })}
            </h2>
            <button className="ta-see-all" onClick={goToAttractions}>
              {t('topAttractions.viewAll', { defaultValue: 'View all' })}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          <p className="ta-subtitle">
            {t('topAttractions.subtitle', { defaultValue: 'Iconic landmarks and cultural wonders waiting to be explored' })}
          </p>
        </div>
      </div>

      {/* ── Card strip ── */}
      <div className="ta-strip-wrapper">
        <div
          className="ta-strip"
          ref={scrollRef}
          onScroll={updateArrows}
        >
          {featured.map(item => (
            <button
              key={item.id}
              className="ta-card"
              onClick={goToAttractions}
              aria-label={`Explore ${item.name}`}
            >
              <div
                className="ta-card-photo"
                style={!item.image ? { background: item.gradient } : undefined}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="ta-card-img"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="ta-card-body">
                <p className="ta-card-state">{item.state}</p>
                <h3 className="ta-card-name">{item.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Arrow controls ── */}
      <div className="ta-controls">
        <button
          className={`ta-arrow ${!canScrollLeft ? 'disabled' : ''}`}
          onClick={() => nudge(-1)}
          disabled={!canScrollLeft}
          aria-label={t('topAttractions.scrollLeftAria', { defaultValue: 'Previous' })}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button
          className={`ta-arrow ${!canScrollRight ? 'disabled' : ''}`}
          onClick={() => nudge(1)}
          disabled={!canScrollRight}
          aria-label={t('topAttractions.scrollRightAria', { defaultValue: 'Next' })}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

    </section>
  );
};

export default TopAttractions;
