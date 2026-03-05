import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Tours.css';

const Tours = ({ onOpenEnquiry }) => {
  const { t } = useTranslation();
  const [expandedTour, setExpandedTour] = useState(null);

  const tours = [
    {
      id: 'golden-triangle',
      titleKey: 'tours.goldenTriangle.title',
      durationKey: 'tours.goldenTriangle.duration',
      locationsKey: 'tours.goldenTriangle.locations',
      descriptionKey: 'tours.goldenTriangle.description',
      itineraryKey: 'tours.goldenTriangle.itinerary',
      includesKey: 'tours.goldenTriangle.includes',
      video: '/assets/images/Golden%20Triangle%20Tour.mp4',
      rating: 4.8
    },
    {
      id: 'delhi-1-day',
      titleKey: 'tours.delhiDay.title',
      durationKey: 'tours.delhiDay.duration',
      locationsKey: 'tours.delhiDay.locations',
      descriptionKey: 'tours.delhiDay.description',
      itineraryKey: 'tours.delhiDay.itinerary',
      includesKey: 'tours.delhiDay.includes',
      video: '/assets/images/Delhi%20Day%20Tour.mp4',
      rating: 4.6
    },
    {
      id: 'jaipur-1-day',
      titleKey: 'tours.jaipurDay.title',
      durationKey: 'tours.jaipurDay.duration',
      locationsKey: 'tours.jaipurDay.locations',
      descriptionKey: 'tours.jaipurDay.description',
      itineraryKey: 'tours.jaipurDay.itinerary',
      includesKey: 'tours.jaipurDay.includes',
      video: '/assets/images/1DayJaipurTour.mp4',
      rating: 4.7
    },
    {
      id: 'agra-1-day',
      titleKey: 'tours.agraDay.title',
      durationKey: 'tours.agraDay.duration',
      locationsKey: 'tours.agraDay.locations',
      descriptionKey: 'tours.agraDay.description',
      itineraryKey: 'tours.agraDay.itinerary',
      includesKey: 'tours.agraDay.includes',
      video: '/assets/images/1DayAgraTour.mp4',
      rating: 4.9
    }
  ];

  const toggleDetails = (tourId) => {
    setExpandedTour(expandedTour === tourId ? null : tourId);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }

    return stars.join('');
  };

  return (
    <section className="section alt" id="packages">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('tours.title')}</h2>
          <p className="section-subtitle">{t('tours.subtitle')}</p>
        </div>

        <div className="tours-grid">
          {tours.map(tour => (
            <article key={tour.id} className={`tour-card ${expandedTour === tour.id ? 'expanded' : ''}`}>
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
                  <span className="badge duration">{t(tour.durationKey)}</span>
                  <span className="badge location">{t(tour.locationsKey)}</span>
                </div>

                <h3 className="tour-title">{t(tour.titleKey)}</h3>
                <p className="tour-description">{t(tour.descriptionKey)}</p>

                <div className="tour-features">
                  <span className="feature">{t('features.privateTransport')}</span>
                  <span className="feature">{t('features.expertGuide')}</span>
                  <span className="feature">{t('features.mealsIncluded')}</span>
                </div>

                <button 
                  className="btn btn-primary tour-btn" 
                  onClick={() => toggleDetails(tour.id)}
                  aria-expanded={expandedTour === tour.id}
                >
                  {expandedTour === tour.id ? 'Hide Details' : t('tours.viewDetails')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={expandedTour === tour.id ? "M5 12h14" : "M5 12h14M12 5l7 7-7 7"}/>
                  </svg>
                </button>

                {expandedTour === tour.id && (
                  <div className="tour-details">
                    <div className="itinerary">
                      <h4>Itinerary</h4>
                      {tour.id === 'golden-triangle' ? (
                        <div>
                          <p><strong>Day 1:</strong> {t(`${tour.itineraryKey}.day1`)}</p>
                          <p><strong>Day 2:</strong> {t(`${tour.itineraryKey}.day2`)}</p>
                          <p><strong>Day 3:</strong> {t(`${tour.itineraryKey}.day3`)}</p>
                          <p><strong>Day 4:</strong> {t(`${tour.itineraryKey}.day4`)}</p>
                        </div>
                      ) : (
                        <p><strong>Highlights:</strong> {t(`${tour.itineraryKey}.highlights`)}</p>
                      )}
                    </div>
                    <div className="includes">
                      <h4>What's Included</h4>
                      <ul>
                        {t(tour.includesKey, { returnObjects: true }).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="tours-cta">
          <p>Can't find what you're looking for?</p>
          <button onClick={onOpenEnquiry} className="btn btn-outline">{t('tours.customizeTour')}</button>
        </div>
      </div>
    </section>
  );
};

export default Tours;