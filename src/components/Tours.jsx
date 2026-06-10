import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FOREIGN_TOURS } from '../data/foreignTours';
import { INDIA_TOURS } from '../data/indiaTours';
import LazyVideo from './LazyVideo';
import './Tours.css';


const Tours = ({ onOpenEnquiry, onEnquireTour }) => {
  const { t } = useTranslation();
  const [expandedDescs, setExpandedDescs] = useState(new Set());
  const [overflowingDescs, setOverflowingDescs] = useState(new Set());
  const [selectedTourId, setSelectedTourId] = useState(null);
  const descRefs = useRef({});

  // Detect overflowing descriptions; re-check on resize
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

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedTourId(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTourId]);

  const tours = INDIA_TOURS;
  const foreignTours = FOREIGN_TOURS;

  const toggleDesc = (tourId) => {
    setExpandedDescs(prev => {
      const next = new Set(prev);
      next.has(tourId) ? next.delete(tourId) : next.add(tourId);
      return next;
    });
  };

  const openDetails = (tourId) => setSelectedTourId(tourId);
  const closeDetails = () => setSelectedTourId(null);

  const renderStars = (rating) => '★'.repeat(Math.floor(rating));

  const renderItinerary = (tour) => {
    // City-by-city itinerary, driven by the tour's itineraryCities data
    if (Array.isArray(tour.itineraryCities)) {
      return (
        <>
          {tour.itineraryCities.map((city) => (
            <p key={city}>
              <strong>{city.charAt(0).toUpperCase() + city.slice(1)}:</strong>{' '}
              {t(`${tour.itineraryKey}.${city}`)}
            </p>
          ))}
        </>
      );
    }

    // Day-by-day itinerary for multi-day foreign tours
    if (tour.country) {
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
    }

    return <p>{t(`${tour.itineraryKey}.highlights`)}</p>;
  };

  const resolveTourContent = (tour) => ({
    title: t(tour.titleKey),
    duration: t(tour.durationKey),
    locations: t(tour.locationsKey),
    description: t(tour.descriptionKey),
    includes: t(tour.includesKey, { returnObjects: true }),
    excludes: t(tour.includesKey.replace('includes', 'excludes'), { returnObjects: true }),
  });

  const selectedTour = [...tours, ...foreignTours].find((tour) => tour.id === selectedTourId) || null;
  const selectedTourContent = selectedTour ? resolveTourContent(selectedTour) : null;

  return (
    <section className="section alt" id="packages">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('tours.title')}</h2>
          <p className="section-subtitle">{t('tours.subtitle')}</p>
        </div>

        <div className="tours-grid">
          {tours.map(tour => {
            const { title, duration, locations, description } = resolveTourContent(tour);
            const isDescExpanded = expandedDescs.has(tour.id);

            return (
              <article key={tour.id} className="tour-card">
                <div className="tour-image">
                  <LazyVideo src={tour.video} />
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
                    <p
                      ref={el => { descRefs.current[tour.id] = el; }}
                      className="tour-description"
                    >{description}</p>
                    {overflowingDescs.has(tour.id) && (
                      <button className="read-more-btn" onClick={() => toggleDesc(tour.id)}>
                        {isDescExpanded
                          ? t('tours.readLess', { defaultValue: 'Read less' })
                          : t('tours.readMore', { defaultValue: 'Read more' })}
                      </button>
                    )}
                  </div>

                  <div className="tour-features">
                    <span className="feature">{t('features.privateTransport')}</span>
                    <span className="feature">{t('features.expertGuide')}</span>
                    <span className="feature">{t('features.monumentTickets', { defaultValue: '✓ Monument Tickets' })}</span>
                    {tour.mealsIncluded && <span className="feature">{t('features.mealsIncluded')}</span>}
                  </div>

                  <div className="tour-card-actions">
                    <button
                      className="btn btn-primary tour-btn"
                      onClick={() => openDetails(tour.id)}
                      aria-haspopup="dialog"
                      aria-expanded={selectedTourId === tour.id}
                    >
                      {t('tours.viewDetails')}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                    <button
                      className="btn tour-book-btn"
                      onClick={() => onEnquireTour(resolveTourContent(tour).title, tour.country ? 'international' : 'india')}
                    >
                      {t('tours.bookNow', { defaultValue: 'Book Now' })}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="tours-section-divider">
          <span className="tours-section-divider-label">{t('tours.internationalTours', { defaultValue: 'International Tours' })}</span>
        </div>

        <div className="tours-grid">
          {foreignTours.map(tour => {
            const { title, duration, locations, description } = resolveTourContent(tour);
            const isDescExpanded = expandedDescs.has(tour.id);

            return (
              <article key={tour.id} className="tour-card">
                <div className="tour-image">
                  {tour.video ? (
                    <LazyVideo src={tour.video} />
                  ) : (
                    <div
                      className="tour-country-banner"
                      style={{ background: tour.bannerGradient }}
                    >
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
                    <p
                      ref={el => { descRefs.current[tour.id] = el; }}
                      className="tour-description"
                    >{description}</p>
                    {overflowingDescs.has(tour.id) && (
                      <button className="read-more-btn" onClick={() => toggleDesc(tour.id)}>
                        {isDescExpanded
                          ? t('tours.readLess', { defaultValue: 'Read less' })
                          : t('tours.readMore', { defaultValue: 'Read more' })}
                      </button>
                    )}
                  </div>

                  <div className="tour-features">
                    <span className="feature">{t('features.privateTransport')}</span>
                    <span className="feature">{t('features.expertGuide')}</span>
                    <span className="feature">{t('features.monumentTickets', { defaultValue: '✓ Monument Tickets' })}</span>
                    {tour.mealsIncluded && <span className="feature">{t('features.mealsIncluded')}</span>}
                  </div>

                  <div className="tour-card-actions">
                    <button
                      className="btn btn-primary tour-btn"
                      onClick={() => openDetails(tour.id)}
                      aria-haspopup="dialog"
                      aria-expanded={selectedTourId === tour.id}
                    >
                      {t('tours.viewDetails')}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                    <button
                      className="btn tour-book-btn"
                      onClick={() => onEnquireTour(resolveTourContent(tour).title, tour.country ? 'international' : 'india')}
                    >
                      {t('tours.bookNow', { defaultValue: 'Book Now' })}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {selectedTour && selectedTourContent && (
          <div className="tour-modal-overlay" onClick={closeDetails} role="presentation">
            <div
              className="tour-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tour-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button className="tour-modal-close" type="button" onClick={closeDetails} aria-label={t('tours.closeDetailsAria', { defaultValue: 'Close details popup' })}>
                ×
              </button>

              <div className="tour-modal-media">
                {selectedTour.video ? (
                  <LazyVideo src={selectedTour.video} />
                ) : (
                  <div
                    className="tour-country-banner"
                    style={{ background: selectedTour.bannerGradient }}
                  >
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

                <h3 className="tour-title" id="tour-modal-title">{selectedTourContent.title}</h3>
                <p className="tour-description modal-description">{selectedTourContent.description}</p>

                <div className="tour-details tour-details-modal">
                  <div className="itinerary">
                    <h4>{t('tours.highlights', { defaultValue: 'Highlights' })}</h4>
                    {renderItinerary(selectedTour)}
                  </div>

                  {Array.isArray(selectedTourContent.includes) && (
                    <div className="includes">
                      <h4>{t('tours.whatsIncluded', { defaultValue: "What's Included" })}</h4>
                      <ul>
                        {selectedTourContent.includes.map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(selectedTourContent.excludes) && (
                    <div className="excludes">
                      <h4>{t('tours.whatsExcluded', { defaultValue: "What's Excluded" })}</h4>
                      <ul>
                        {selectedTourContent.excludes.map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="tour-enquiry-section">
                    <button className="btn btn-primary enquire-now-btn" onClick={() => { closeDetails(); onEnquireTour(selectedTourContent.title, selectedTour.country ? 'international' : 'india'); }}>
                      {t('tours.bookNow', { defaultValue: 'Book Now' })}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="tours-cta">
          <p>{t('tours.cannotFind', { defaultValue: "Can't find what you're looking for?" })}</p>
          <button onClick={onOpenEnquiry} className="btn btn-outline">{t('tours.customizeTour')}</button>
        </div>
      </div>
    </section>
  );
};

export default Tours;