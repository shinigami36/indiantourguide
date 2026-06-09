import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FOREIGN_TOURS, COMING_SOON_COUNTRIES } from '../data/foreignTours';
import './InternationalTours.css';

const InternationalTours = ({ onEnquireTour }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expandedDescs, setExpandedDescs] = useState(new Set());
  const [overflowingDescs, setOverflowingDescs] = useState(new Set());
  const [selectedTourId, setSelectedTourId] = useState(null);
  const descRefs = useRef({});

  useEffect(() => {
    const checkOverflow = () => {
      const overflowing = new Set();
      Object.entries(descRefs.current).forEach(([id, el]) => {
        if (el && el.scrollHeight > el.clientHeight) overflowing.add(id);
      });
      setOverflowingDescs(overflowing);
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  useEffect(() => {
    if (!selectedTourId) return undefined;
    const handleKeyDown = (e) => { if (e.key === 'Escape') setSelectedTourId(null); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', handleKeyDown); };
  }, [selectedTourId]);

  const toggleDesc = (id) => setExpandedDescs(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const renderStars = (rating) => '★'.repeat(Math.floor(rating));

  const resolveTourContent = (tour) => ({
    title: t(tour.titleKey),
    duration: t(tour.durationKey),
    locations: t(tour.locationsKey),
    description: t(tour.descriptionKey),
    includes: t(tour.includesKey, { returnObjects: true }),
    excludes: t(tour.includesKey.replace('includes', 'excludes'), { returnObjects: true }),
  });

  const renderItinerary = (tour) => {
    const itineraryObj = t(tour.itineraryKey, { returnObjects: true });
    if (typeof itineraryObj === 'object' && itineraryObj !== null) {
      return (
        <>
          {Object.entries(itineraryObj).map(([key, value], i) => (
            <p key={key}><strong>Day {i + 1}:</strong> {value}</p>
          ))}
        </>
      );
    }
    return null;
  };

  const selectedTour = FOREIGN_TOURS.find(t => t.id === selectedTourId) || null;
  const selectedTourContent = selectedTour ? resolveTourContent(selectedTour) : null;

  return (
    <div className="intl-page">
      <div className="intl-page-header">
        <div className="container">
          <button className="intl-back-btn" onClick={() => navigate('/')} aria-label="Back to home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            {t('common.backHome', { defaultValue: 'Back to Home' })}
          </button>
          <h1 className="intl-page-title">{t('internationalTours.title', { defaultValue: 'International Tours' })}</h1>
          <p className="intl-page-subtitle">{t('internationalTours.subtitle', { defaultValue: 'Hand-crafted journeys across the world\'s most captivating destinations' })}</p>
        </div>
      </div>

      <div className="container intl-container">

        {/* ── Active Tours ── */}
        <div className="intl-section-label">
          <span>{t('internationalTours.availableNow', { defaultValue: 'Available Now' })}</span>
        </div>

        <div className="tours-grid">
          {FOREIGN_TOURS.map(tour => {
            const { title, duration, locations, description } = resolveTourContent(tour);
            const isDescExpanded = expandedDescs.has(tour.id);
            return (
              <article key={tour.id} className="tour-card">
                <div className="tour-image">
                  {tour.video ? (
                    <video autoPlay muted loop playsInline className="tour-video">
                      <source src={tour.video} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="tour-country-banner" style={{ background: tour.bannerGradient }}>
                      <span className="tour-country-flag">{tour.flag}</span>
                      <span className="tour-country-name">{tour.country}</span>
                    </div>
                  )}
                  <div className="tour-rating">
                    <span className="stars">{renderStars(tour.rating)}</span>
                    <span className="rating-text">{tour.rating}</span>
                  </div>
                </div>

                <div className="tour-content">
                  <div className="tour-meta">
                    <span className="badge duration">{duration}</span>
                    <span className="badge location">{locations}</span>
                  </div>
                  <h3 className="tour-title">{title}</h3>

                  <div className={`tour-desc-wrapper${isDescExpanded ? '' : ' collapsed'}`}>
                    <p ref={el => { descRefs.current[tour.id] = el; }} className="tour-description">{description}</p>
                    {overflowingDescs.has(tour.id) && (
                      <button className="read-more-btn" onClick={() => toggleDesc(tour.id)}>
                        {isDescExpanded ? t('tours.readLess', { defaultValue: 'Read less' }) : t('tours.readMore', { defaultValue: 'Read more' })}
                      </button>
                    )}
                  </div>

                  <div className="tour-features">
                    <span className="feature">{t('features.privateTransport')}</span>
                    <span className="feature">{t('features.expertGuide')}</span>
                    <span className="feature">{t('features.monumentTickets', { defaultValue: '✓ Monument Tickets' })}</span>
                    {tour.mealsIncluded && <span className="feature">{t('features.mealsIncluded')}</span>}
                  </div>

                  <button className="btn btn-primary tour-btn" onClick={() => setSelectedTourId(tour.id)} aria-haspopup="dialog">
                    {t('tours.viewDetails')}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* ── Coming Soon ── */}
        <div className="intl-section-label intl-section-label--soon">
          <span>{t('internationalTours.comingSoon', { defaultValue: 'Coming Soon' })}</span>
        </div>
        <p className="intl-soon-note">{t('internationalTours.comingSoonNote', { defaultValue: 'We\'re crafting unforgettable experiences to these destinations. Register your interest and be the first to know.' })}</p>

        <div className="intl-soon-grid">
          {COMING_SOON_COUNTRIES.map(({ country, flag, bannerGradient }) => (
            <div key={country} className="intl-soon-card">
              <div className="intl-soon-banner" style={{ background: bannerGradient }}>
                <span className="intl-soon-flag">{flag}</span>
              </div>
              <div className="intl-soon-content">
                <h3 className="intl-soon-country">{country}</h3>
                <span className="intl-soon-badge">{t('internationalTours.comingSoon', { defaultValue: 'Coming Soon' })}</span>
                <button
                  className="btn btn-outline intl-notify-btn"
                  onClick={() => onEnquireTour(`${country} Tour (Coming Soon)`)}
                >
                  {t('internationalTours.notifyMe', { defaultValue: 'Register Interest' })}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── Tour Detail Modal ── */}
      {selectedTour && selectedTourContent && (
        <div className="tour-modal-overlay" onClick={() => setSelectedTourId(null)} role="presentation">
          <div className="tour-modal" role="dialog" aria-modal="true" aria-labelledby="intl-modal-title" onClick={e => e.stopPropagation()}>
            <button className="tour-modal-close" type="button" onClick={() => setSelectedTourId(null)} aria-label={t('tours.closeDetailsAria', { defaultValue: 'Close details popup' })}>×</button>

            <div className="tour-modal-media">
              {selectedTour.video ? (
                <video autoPlay muted loop playsInline className="tour-video">
                  <source src={selectedTour.video} type="video/mp4" />
                </video>
              ) : (
                <div className="tour-country-banner" style={{ background: selectedTour.bannerGradient }}>
                  <span className="tour-country-flag">{selectedTour.flag}</span>
                  <span className="tour-country-name">{selectedTour.country}</span>
                </div>
              )}
              <div className="tour-rating">
                <span className="stars">{renderStars(selectedTour.rating)}</span>
                <span className="rating-text">{selectedTour.rating}</span>
              </div>
            </div>

            <div className="tour-modal-content">
              <div className="tour-meta">
                <span className="badge duration">{selectedTourContent.duration}</span>
                <span className="badge location">{selectedTourContent.locations}</span>
              </div>
              <h3 className="tour-title" id="intl-modal-title">{selectedTourContent.title}</h3>
              <p className="tour-description modal-description">{selectedTourContent.description}</p>

              <div className="tour-details tour-details-modal">
                <div className="itinerary">
                  <h4>{t('tours.highlights', { defaultValue: 'Day-by-Day Itinerary' })}</h4>
                  {renderItinerary(selectedTour)}
                </div>

                {Array.isArray(selectedTourContent.includes) && (
                  <div className="includes">
                    <h4>{t('tours.whatsIncluded', { defaultValue: "What's Included" })}</h4>
                    <ul>{selectedTourContent.includes.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                )}

                {Array.isArray(selectedTourContent.excludes) && (
                  <div className="excludes">
                    <h4>{t('tours.whatsExcluded', { defaultValue: "What's Excluded" })}</h4>
                    <ul>{selectedTourContent.excludes.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                )}

                <div className="tour-enquiry-section">
                  <button className="btn btn-outline enquire-now-btn" onClick={() => { setSelectedTourId(null); onEnquireTour(selectedTourContent.title); }}>
                    {t('tours.enquireNow', { defaultValue: 'Enquire Now' })}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternationalTours;
