import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import attractionsData from '../data/attractions.json';
import './Attractions.css';

const CATEGORIES = [
  { key: 'all',      labelKey: 'attractions.category.all', defaultLabel: 'All Places' },
  { key: 'forts',    labelKey: 'attractions.category.forts', defaultLabel: 'Forts & Palaces' },
  { key: 'temples',  labelKey: 'attractions.category.temples', defaultLabel: 'Temples & Shrines' },
  { key: 'caves',    labelKey: 'attractions.category.caves', defaultLabel: 'Caves & Rock-cut' },
  { key: 'landmarks',labelKey: 'attractions.category.landmarks', defaultLabel: 'Iconic Landmarks' },
  { key: 'nature',   labelKey: 'attractions.category.nature', defaultLabel: 'Nature & Lakes' },
  { key: 'beaches',  labelKey: 'attractions.category.beaches', defaultLabel: 'Beaches & Islands' },
  { key: 'wildlife', labelKey: 'attractions.category.wildlife', defaultLabel: 'Wildlife' },
];

const PAGE_SIZE = 12;

const Attractions = ({ onEnquireTour, onNavigateHome }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage]       = useState(1);
  const [expandedId, setExpandedId]         = useState(null);

  const filtered = useMemo(() => (
    activeCategory === 'all'
      ? attractionsData
      : attractionsData.filter(a => a.category === activeCategory)
  ), [activeCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleCategoryChange = (key) => {
    setActiveCategory(key);
    setCurrentPage(1);
    setExpandedId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handlePlanTrip = (attraction) => {
    onEnquireTour(attraction.tourLink || attraction.name);
  };

  return (
    <div className="attractions-page">

      {/* ── Hero banner ──────────────────────────────────────────── */}
      <section className="attractions-hero">
        <div className="container">
          <button
            className="attractions-back-btn"
            onClick={onNavigateHome}
            aria-label={t('attractions.backHomeAria', { defaultValue: 'Back to home' })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            {t('attractions.backHome', { defaultValue: 'Back to Home' })}
          </button>
          <h1 className="attractions-title">{t('attractions.title', { defaultValue: 'Places to Visit in India' })}</h1>
          <p className="attractions-subtitle">
            {t('attractions.subtitle', { defaultValue: 'Discover 50+ iconic destinations - from ancient forts and sacred temples to Himalayan valleys and tropical beaches' })}
          </p>
          <div className="attractions-hero-stats">
            <span><strong>{attractionsData.length}</strong> {t('attractions.stats.attractions', { defaultValue: 'Attractions' })}</span>
            <span><strong>{CATEGORIES.length - 1}</strong> {t('attractions.stats.categories', { defaultValue: 'Categories' })}</span>
            <span><strong>22+</strong> {t('attractions.stats.states', { defaultValue: 'States' })}</span>
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────── */}
      <section className="attractions-content">
        <div className="container">

          {/* Category filter tabs */}
          <div className="attractions-filters" role="tablist" aria-label={t('attractions.filterByCategoryAria', { defaultValue: 'Filter by category' })}>
            {CATEGORIES.map(cat => {
              const count = cat.key === 'all'
                ? attractionsData.length
                : attractionsData.filter(a => a.category === cat.key).length;
              return (
                <button
                  key={cat.key}
                  role="tab"
                  aria-selected={activeCategory === cat.key}
                  className={`filter-btn ${activeCategory === cat.key ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.key)}
                >
                  {t(cat.labelKey, { defaultValue: cat.defaultLabel })}
                  <span className="filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Results count */}
          <p className="results-label">
            {t('attractions.showing', { defaultValue: 'Showing' })} <strong>{pageItems.length}</strong> {t('attractions.of', { defaultValue: 'of' })} <strong>{filtered.length}</strong> {t('attractions.results', { defaultValue: 'attractions' })}
            {activeCategory !== 'all' && (
              <button className="clear-filter" onClick={() => handleCategoryChange('all')}>
                {t('attractions.clearFilter', { defaultValue: 'Clear filter' })} ×
              </button>
            )}
          </p>

          {/* Grid */}
          <div className="attractions-grid">
            {pageItems.map((attraction, idx) => {
              const globalIndex = (currentPage - 1) * PAGE_SIZE + idx + 1;
              const isOpen = expandedId === attraction.id;
              return (
                <article
                  key={attraction.id}
                  className={`attraction-card ${isOpen ? 'expanded' : ''}`}
                >
                  {/* Visual header */}
                  <div
                    className="attraction-visual"
                    style={!attraction.image ? { background: attraction.gradient } : undefined}
                    aria-hidden="true"
                  >
                    <span className="attraction-number">#{globalIndex}</span>
                    {attraction.image ? (
                      <img
                        src={attraction.image}
                        alt={attraction.name}
                        className="attraction-img"
                        loading="lazy"
                      />
                    ) : (
                      <span className="attraction-icon">{attraction.icon}</span>
                    )}
                    <div className="attraction-shine" />
                  </div>

                  {/* Card body */}
                  <div className="attraction-body">
                    <div className="attraction-meta-row">
                      <span className={`cat-badge cat-${attraction.category}`}>
                        {(() => {
                          const category = CATEGORIES.find(c => c.key === attraction.category);
                          return category ? t(category.labelKey, { defaultValue: category.defaultLabel }) : attraction.category;
                        })()}
                      </span>
                      <span className="best-time-label">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                        </svg>
                        {attraction.bestTime}
                      </span>
                    </div>

                    <h2 className="attraction-name">{attraction.name}</h2>

                    <p className="attraction-location">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {attraction.city}, {attraction.state}
                    </p>

                    <p className="attraction-title-line">{attraction.title}</p>

                    <p className={`attraction-description ${isOpen ? 'expanded' : ''}`}>
                      {attraction.description}
                    </p>

                    {/* Action buttons */}
                    <div className="attraction-actions">
                      <button
                        className={`btn-explore ${isOpen ? 'active' : ''}`}
                        onClick={() => toggleExpand(attraction.id)}
                        aria-expanded={isOpen}
                      >
                        {isOpen ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.5"
                              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12h14"/>
                            </svg>
                            {t('attractions.close', { defaultValue: 'Close' })}
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.5"
                              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                            </svg>
                            {t('attractions.explore', { defaultValue: 'Explore' })}
                          </>
                        )}
                      </button>
                      <button
                        className="btn-plan-trip"
                        onClick={() => handlePlanTrip(attraction)}
                        aria-label={t('attractions.planTripAria', { attraction: attraction.name, defaultValue: `Plan a trip to ${attraction.name}` })}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                        {t('attractions.planTrip', { defaultValue: 'Plan Trip' })}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="pagination" aria-label={t('attractions.paginationAria', { defaultValue: 'Attractions pagination' })}>
              <button
                className="page-btn prev"
                onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={currentPage === 1}
                aria-label={t('attractions.previousPageAria', { defaultValue: 'Previous page' })}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                {t('attractions.prev', { defaultValue: 'Prev' })}
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    className={`page-num ${n === currentPage ? 'active' : ''}`}
                    onClick={() => { setCurrentPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    aria-label={t('attractions.pageAria', { page: n, defaultValue: `Page ${n}` })}
                    aria-current={n === currentPage ? 'page' : undefined}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                className="page-btn next"
                onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={currentPage === totalPages}
                aria-label={t('attractions.nextPageAria', { defaultValue: 'Next page' })}
              >
                {t('attractions.next', { defaultValue: 'Next' })}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
};

export default Attractions;
