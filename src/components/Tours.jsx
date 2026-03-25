import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Tours.css';

// Defined outside component so the array isn't recreated on every render
const TOURS = [
  { id: 'golden-triangle',         titleKey: 'tours.goldenTriangle.title',         durationKey: 'tours.goldenTriangle.duration',         locationsKey: 'tours.goldenTriangle.locations',         descriptionKey: 'tours.goldenTriangle.description',         itineraryKey: 'tours.goldenTriangle.itinerary',         includesKey: 'tours.goldenTriangle.includes',         video: '/assets/tour-videos/Golden%20Triangle%20Tour.mp4',                        rating: 4.9, mealsIncluded: true  },
  { id: 'agra-full-day',           titleKey: 'tours.agraFullDay.title',             durationKey: 'tours.agraFullDay.duration',             locationsKey: 'tours.agraFullDay.locations',             descriptionKey: 'tours.agraFullDay.description',             itineraryKey: 'tours.agraFullDay.itinerary',             includesKey: 'tours.agraFullDay.includes',             video: '/assets/tour-videos/1DayAgraTour.mp4',                                    rating: 4.9, mealsIncluded: true  },
  { id: 'jaipur-1-day',            titleKey: 'tours.jaipurDay.title',               durationKey: 'tours.jaipurDay.duration',               locationsKey: 'tours.jaipurDay.locations',               descriptionKey: 'tours.jaipurDay.description',               itineraryKey: 'tours.jaipurDay.itinerary',               includesKey: 'tours.jaipurDay.includes',               video: '/assets/tour-videos/1DayJaipurTour.mp4',                                  rating: 4.7, mealsIncluded: true  },
  { id: 'delhi-old-half-day',      titleKey: 'tours.delhiOldHalfDay.title',         durationKey: 'tours.delhiOldHalfDay.duration',         locationsKey: 'tours.delhiOldHalfDay.locations',         descriptionKey: 'tours.delhiOldHalfDay.description',         itineraryKey: 'tours.delhiOldHalfDay.itinerary',         includesKey: 'tours.delhiOldHalfDay.includes',         video: '/assets/tour-videos/old_delhi_tour.mp4',                                  rating: 4.6, mealsIncluded: false },
  { id: 'delhi-new-half-day',      titleKey: 'tours.delhiNewHalfDay.title',         durationKey: 'tours.delhiNewHalfDay.duration',         locationsKey: 'tours.delhiNewHalfDay.locations',         descriptionKey: 'tours.delhiNewHalfDay.description',         itineraryKey: 'tours.delhiNewHalfDay.itinerary',         includesKey: 'tours.delhiNewHalfDay.includes',         video: '/assets/tour-videos/Half%20day%20new%20delhi%20tour.mp4',                rating: 4.6, mealsIncluded: false },
  { id: 'delhi-full-day',          titleKey: 'tours.delhiFullDay.title',            durationKey: 'tours.delhiFullDay.duration',            locationsKey: 'tours.delhiFullDay.locations',            descriptionKey: 'tours.delhiFullDay.description',            itineraryKey: 'tours.delhiFullDay.itinerary',            includesKey: 'tours.delhiFullDay.includes',            video: '/assets/tour-videos/Delhi%20Day%20Tour.mp4',                              rating: 4.7, mealsIncluded: true  },
  { id: 'golden-triangle-mumbai',  titleKey: 'tours.goldenTriangleMumbai.title',   durationKey: 'tours.goldenTriangleMumbai.duration',   locationsKey: 'tours.goldenTriangleMumbai.locations',   descriptionKey: 'tours.goldenTriangleMumbai.description',   itineraryKey: 'tours.goldenTriangleMumbai.itinerary',   includesKey: 'tours.goldenTriangleMumbai.includes',   video: '/assets/tour-videos/Golden%20Triangle%20With%20Mumbai.mp4',               rating: 4.8, mealsIncluded: true  },
  { id: 'golden-triangle-varanasi',titleKey: 'tours.goldenTriangleVaranasi.title', durationKey: 'tours.goldenTriangleVaranasi.duration', locationsKey: 'tours.goldenTriangleVaranasi.locations', descriptionKey: 'tours.goldenTriangleVaranasi.description', itineraryKey: 'tours.goldenTriangleVaranasi.itinerary', includesKey: 'tours.goldenTriangleVaranasi.includes', video: '/assets/tour-videos/Golden%20Triangle%20Tour%20with%20Varanasi.mp4',      rating: 4.9, mealsIncluded: true  },
];

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

  const tours = TOURS;

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
    if (
      tour.id === 'golden-triangle' ||
      tour.id === 'golden-triangle-mumbai' ||
      tour.id === 'golden-triangle-varanasi'
    ) {
      return (
        <>
          <p><strong>Delhi:</strong> {t(`${tour.itineraryKey}.delhi`)}</p>
          <p><strong>Jaipur:</strong> {t(`${tour.itineraryKey}.jaipur`)}</p>
          <p><strong>Agra:</strong> {t(`${tour.itineraryKey}.agra`)}</p>
          {tour.id === 'golden-triangle-mumbai' && (
            <p><strong>Mumbai:</strong> {t(`${tour.itineraryKey}.mumbai`)}</p>
          )}
          {tour.id === 'golden-triangle-varanasi' && (
            <p><strong>Varanasi:</strong> {t(`${tour.itineraryKey}.varanasi`)}</p>
          )}
        </>
      );
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

  const selectedTour = tours.find((tour) => tour.id === selectedTourId) || null;
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
                  <video autoPlay muted loop playsInline>
                    <source src={tour.video} type="video/mp4" />
                  </video>
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
                <video autoPlay muted loop playsInline>
                  <source src={selectedTour.video} type="video/mp4" />
                </video>
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
                    <button className="btn btn-outline enquire-now-btn" onClick={() => { closeDetails(); onEnquireTour(selectedTourContent.title); }}>
                      {t('tours.enquireNow', { defaultValue: 'Enquire Now' })}
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