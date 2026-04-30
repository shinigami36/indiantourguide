import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CountrySelect from './CountrySelect';
import { postJsonWithRetry } from '../utils/api';
import { HOTEL_OPTIONS, CATEGORY_OPTIONS, EMPTY_FORM } from '../constants/enquiryData';
import { useEnquiryForm } from '../hooks/useEnquiryForm';
import './Contact.css';

const Contact = () => {
  const { t } = useTranslation();
  const {
    formData, setFormData,
    selectedTours, setSelectedTours,
    tourCategory, setTourCategory,
    errors, setErrors,
    isSubmitting, setIsSubmitting,
    activeTourKeys,
    handleChange, handleNoHotelToggle, toggleTour, handleCategoryChange,
    validateForm,
  } = useEnquiryForm();

  const [tourDropdownOpen, setTourDropdownOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const tourDropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (tourDropdownRef.current && !tourDropdownRef.current.contains(e.target)) {
        setTourDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const onCategoryChange = (cat) => {
    handleCategoryChange(cat);
    setTourDropdownOpen(false);
  };

  const tourTriggerLabel = selectedTours.length === 0
    ? t('enquiry.selectTourPackages', { defaultValue: 'Select tour packages...' })
    : selectedTours.length === 1
      ? selectedTours[0]
      : t('enquiry.toursSelected', { count: selectedTours.length, defaultValue: `${selectedTours.length} tours selected` });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setStatus('');
    setStatusMsg('');

    try {
      const { res, data } = await postJsonWithRetry('/api/enquiry', {
        ...formData,
        tourPackages: selectedTours,
        tourName: selectedTours.join(', '),
        tourCategory,
      });

      if (res.ok && data.success) {
        setStatus('success');
        setStatusMsg(data.message || t('contact.success', { defaultValue: 'Enquiry sent successfully.' }));
        setFormData(EMPTY_FORM);
        setSelectedTours([]);
        setTourCategory('');
      } else if (data.errors || data.fieldErrors) {
        setErrors(data.errors || data.fieldErrors);
      } else {
        setStatus('error');
        setStatusMsg(data.error || t('common.somethingWentWrong', { defaultValue: 'Something went wrong. Please try again.' }));
      }
    } catch {
      setStatus('error');
      setStatusMsg(t('common.serverConnectionError', { defaultValue: 'Could not connect to the server. Please try again or contact us directly on WhatsApp.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section" id="enquiry">
      <div className="container">
        <h2 className="section-title">{t('contact.title')}</h2>
        <p className="section-subtitle">{t('contact.subtitle')}</p>

        <form className="enquiry-form" onSubmit={handleSubmit} noValidate>

          {/* Row 1: Name + Email */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t('contact.form.name')} *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder={t('contact.form.namePlaceholder', { defaultValue: 'John Doe' })}
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('contact.form.email')} *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder={t('contact.form.emailPlaceholder', { defaultValue: 'you@example.com' })}
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-group date-group">
            <label>{t('enquiry.travelDates', { defaultValue: 'Travel Dates' })} *</label>
            <div className="date-row">
              <div className="date-field">
                <label htmlFor="startDate" className="date-label">{t('enquiry.startDate', { defaultValue: 'Start Date' })}</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? 'error' : ''}
                  required
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>
              <div className="date-field">
                <label htmlFor="endDate" className="date-label">{t('enquiry.endDate', { defaultValue: 'End Date' })}</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  min={formData.startDate || undefined}
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? 'error' : ''}
                  required
                />
                {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>
            </div>
          </div>

          {/* Tour Category + Packages */}
          <div className="form-group">
            <label>{t('enquiry.tourType', { defaultValue: 'I am interested in' })}</label>
            <div className="contact-category-pills">
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`contact-category-pill ${tourCategory === opt.value ? 'active' : ''}`}
                  onClick={() => onCategoryChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {tourCategory && (
            <div className="form-group" ref={tourDropdownRef}>
              <label>{t('enquiry.tourPackages', { defaultValue: 'Tour Package(s)' })}</label>
              <button
                type="button"
                className={`contact-multiselect-trigger ${tourDropdownOpen ? 'open' : ''}`}
                onClick={() => setTourDropdownOpen(o => !o)}
              >
                <span className={selectedTours.length === 0 ? 'placeholder' : ''}>{tourTriggerLabel}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={tourDropdownOpen ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
                </svg>
              </button>
              {tourDropdownOpen && (
                <div className="contact-multiselect-dropdown">
                  {activeTourKeys.map(tourKey => {
                    const tourLabel = t(tourKey);
                    return (
                      <label key={tourKey} className="contact-multiselect-option">
                        <input type="checkbox" checked={selectedTours.includes(tourLabel)} onChange={() => toggleTour(tourLabel)} />
                        <span>{tourLabel}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Row 2: Phone + Country */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">{t('contact.form.phone')} *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder={t('contact.form.phonePlaceholder', { defaultValue: '+91 XXXXX XXXXX' })}
                required
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="country">{t('contact.form.country', { defaultValue: 'Country' })}</label>
              <div className="contact-cs">
                <CountrySelect
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Hotel Accommodation */}
          <div className="form-group">
            <label>{t('contact.form.hotelAccommodation', { defaultValue: 'Hotel Accommodation' })}</label>
            <div className={`contact-hotel-options${formData.noHotelRequired ? ' disabled' : ''}`}>
              {HOTEL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`contact-hotel-btn ${formData.hotelCategory === opt.value ? 'active' : ''}`}
                  onClick={() => setFormData(p => ({ ...p, noHotelRequired: false, hotelCategory: p.hotelCategory === opt.value ? '' : opt.value }))}
                  disabled={formData.noHotelRequired}
                >
                  {t(opt.labelKey, { defaultValue: opt.value })}
                </button>
              ))}
            </div>
            <label className="no-hotel-check" htmlFor="noHotelRequired">
              <input
                id="noHotelRequired"
                type="checkbox"
                name="noHotelRequired"
                checked={formData.noHotelRequired}
                onChange={handleNoHotelToggle}
              />
              <span>{t('enquiry.noHotelRequired', { defaultValue: 'No Hotel Required' })}</span>
            </label>
            {errors.hotelCategory && <span className="error-message">{errors.hotelCategory}</span>}
          </div>

          {/* Number of Travelers */}
          <div className="form-group">
            <label>{t('contact.form.travelers', { defaultValue: 'Number of Travelers' })}</label>
            <div className="contact-travelers-row">
              <div className="contact-traveler-field">
                <span className="contact-traveler-label">{t('contact.form.adults', { defaultValue: 'Adults' })}</span>
                <div className="contact-stepper">
                  <button type="button" className="contact-stepper-btn" onClick={() => setFormData(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))} aria-label={t('contact.form.decreaseAdults', { defaultValue: 'Decrease adults' })}>−</button>
                  <span className="contact-stepper-value">{formData.adults}</span>
                  <button type="button" className="contact-stepper-btn" onClick={() => setFormData(p => ({ ...p, adults: p.adults + 1 }))} aria-label={t('contact.form.increaseAdults', { defaultValue: 'Increase adults' })}>+</button>
                </div>
              </div>
              <div className="contact-traveler-field">
                <span className="contact-traveler-label">{t('contact.form.children', { defaultValue: 'Children' })}</span>
                <div className="contact-stepper">
                  <button type="button" className="contact-stepper-btn" onClick={() => setFormData(p => ({ ...p, children: Math.max(0, p.children - 1) }))} aria-label={t('contact.form.decreaseChildren', { defaultValue: 'Decrease children' })}>−</button>
                  <span className="contact-stepper-value">{formData.children}</span>
                  <button type="button" className="contact-stepper-btn" onClick={() => setFormData(p => ({ ...p, children: p.children + 1 }))} aria-label={t('contact.form.increaseChildren', { defaultValue: 'Increase children' })}>+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="form-group">
            <label htmlFor="message">{t('contact.form.message')}</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder={t('contact.form.messagePlaceholder')}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                {t('contact.form.sending', { defaultValue: 'Sending...' })}
              </>
            ) : t('contact.form.submit')}
          </button>

          {status === 'success' && <div className="form-status success">{statusMsg}</div>}
          {status === 'error'   && <div className="form-status error">{statusMsg}</div>}
        </form>
      </div>
    </section>
  );
};

export default Contact;
