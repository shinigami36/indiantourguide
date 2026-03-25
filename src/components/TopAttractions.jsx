import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './TopAttractions.css';

const featured = [
  {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    city: 'Agra',
    image: '/assets/attractions/m_activities-agra-taj-mahal_l_400_640.avif',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🕌',
    tag: 'Wonder of the World',
  },
  {
    id: 'amber-fort',
    name: 'Amber Fort',
    city: 'Jaipur',
    image: '/assets/attractions/m_activities_amber_fort_2_l_436_573.avif',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    icon: '🏯',
    tag: 'Rajput Heritage',
  },
  {
    id: 'red-fort',
    name: 'Red Fort',
    city: 'Delhi',
    image: '/assets/attractions/m_activities_delhi_red_fort_l_341_817.avif',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    icon: '🏰',
    tag: 'Mughal Empire',
  },
  {
    id: 'lotus-temple',
    name: 'Lotus Temple',
    city: 'Delhi',
    image: '/assets/attractions/m_activities_delhi_lotus_temple_l_508_764.avif',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '🌸',
    tag: 'Iconic Architecture',
  },
  {
    id: 'hawa-mahal',
    name: 'Hawa Mahal',
    city: 'Jaipur',
    image: '/assets/attractions/m_activities-jaipur-hawa-mahal_l_400_640.webp',
    gradient: 'linear-gradient(135deg, #fd7b5b 0%, #e05fa7 100%)',
    icon: '🪟',
    tag: 'Pink City',
  },
  {
    id: 'qutb-minar',
    name: 'Qutb Minar',
    city: 'Delhi',
    image: '/assets/attractions/m_activities_delhi_qutab_minar_l_384_574.avif',
    gradient: 'linear-gradient(135deg, #43a047 0%, #1de9b6 100%)',
    icon: '🗼',
    tag: 'UNESCO Heritage',
  },
];

const TopAttractions = ({ onNavigateAttractions }) => {
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  const nudge = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 310, behavior: 'smooth' });
  };

  return (
  <section className="top-attractions-section" id="attractions">
    <div className="container">
      <div className="top-attractions-header">
        <div>
          <span className="section-eyebrow">{t('topAttractions.eyebrow', { defaultValue: 'Must-See Destinations' })}</span>
          <h2 className="section-title">{t('topAttractions.title', { defaultValue: 'Top Attractions in India' })}</h2>
          <p className="section-subtitle">
            {t('topAttractions.subtitle', { defaultValue: 'Iconic landmarks and cultural wonders waiting to be explored' })}
          </p>
        </div>
        <button
          className="see-all-btn"
          onClick={onNavigateAttractions}
          aria-label={t('topAttractions.viewAllAria', { defaultValue: 'View all attractions' })}
        >
          {t('topAttractions.viewAll', { defaultValue: 'View All Attractions' })}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <div className="top-attractions-wrapper">
        <button className="ta-arrow ta-arrow-left" onClick={() => nudge(-1)} aria-label={t('topAttractions.scrollLeftAria', { defaultValue: 'Scroll left' })}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div className="top-attractions-scroll" ref={scrollRef}>
          {featured.map(attraction => (
          <button
            key={attraction.id}
            className="top-attraction-card"
            onClick={onNavigateAttractions}
            aria-label={`Explore ${attraction.name}`}
          >
            <div
              className="top-attraction-visual"
              style={!attraction.image ? { background: attraction.gradient } : undefined}
            >
              {attraction.image ? (
                <img
                  src={attraction.image}
                  alt=""
                  className="top-attraction-img"
                  loading="lazy"
                />
              ) : (
                <span className="top-attraction-icon" aria-hidden="true">{attraction.icon}</span>
              )}
              <div className="top-attraction-overlay" aria-hidden="true" />
              <div className="top-attraction-info">
                <span className="top-attraction-tag">{attraction.tag}</span>
                <h3 className="top-attraction-name">{attraction.name}</h3>
                <p className="top-attraction-city">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {attraction.city}
                </p>
              </div>
            </div>
          </button>
          ))}
        </div>

        <button className="ta-arrow ta-arrow-right" onClick={() => nudge(1)} aria-label={t('topAttractions.scrollRightAria', { defaultValue: 'Scroll right' })}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div className="top-attractions-cta">
        <button className="explore-all-btn" onClick={onNavigateAttractions}>
          {t('topAttractions.exploreAll', { defaultValue: 'Explore 50+ Attractions' })}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  </section>
  );
};

export default TopAttractions;
