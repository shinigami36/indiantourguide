import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CountrySelect from './CountrySelect';
import './EnquiryModal.css';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const TOUR_OPTIONS = [
  'tours.goldenTriangle.title',
  'tours.agraFullDay.title',
  'tours.jaipurDay.title',
  'tours.delhiOldHalfDay.title',
  'tours.delhiNewHalfDay.title',
  'tours.delhiFullDay.title',
  'tours.goldenTriangleMumbai.title',
  'tours.goldenTriangleVaranasi.title',
];

const HOTEL_OPTIONS = [
  { value: '3 Star', labelKey: 'contact.hotel.3star' },
  { value: '4 Star', labelKey: 'contact.hotel.4star' },
  { value: '5 Star', labelKey: 'contact.hotel.5star' },
];


const EMPTY_FORM = {
  name: '', email: '', phone: '', country: '',
  startDate: '', endDate: '', noHotelRequired: false,
  hotelCategory: '', adults: 1, children: 0, message: '',
};

const EnquiryModal = ({ isOpen, onClose, initialTour }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedTours, setSelectedTours] = useState(initialTour ? [initialTour] : []);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef(null);

  // Reset all state whenever the modal opens (or initialTour changes)
  useEffect(() => {
    if (isOpen) {
      setFormData(EMPTY_FORM);
      setSelectedTours(initialTour ? [initialTour] : []);
      setErrors({});
      setSubmitted(false);
      setDropdownOpen(false);
    }
  }, [isOpen, initialTour]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if ((name === 'startDate' || name === 'endDate') && errors.endDate) {
      setErrors(prev => ({ ...prev, endDate: '' }));
    }
  };

  const handleNoHotelToggle = (event) => {
    const checked = event.target.checked;
    setFormData(prev => ({
      ...prev,
      noHotelRequired: checked,
      hotelCategory: checked ? '' : prev.hotelCategory,
    }));
    setErrors(prev => ({ ...prev, hotelCategory: '' }));
  };

  const toggleTour = (tour) => {
    setSelectedTours(prev =>
      prev.includes(tour) ? prev.filter(t => t !== tour) : [...prev, tour]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('contact.validation.nameRequired') || 'Name is required';
    if (!formData.email.trim()) newErrors.email = t('contact.validation.emailRequired') || 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('contact.validation.emailInvalid') || 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = t('contact.validation.phoneRequired') || 'Phone is required';
    if (!formData.startDate) newErrors.startDate = t('enquiry.validation.startDateRequired', { defaultValue: 'Start date is required.' });
    if (!formData.endDate) newErrors.endDate = t('enquiry.validation.endDateRequired', { defaultValue: 'End date is required.' });
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = t('enquiry.validation.endDateBeforeStart', { defaultValue: 'End date cannot be earlier than start date.' });
    }
    if (!formData.noHotelRequired && !formData.hotelCategory) {
      newErrors.hotelCategory = t('enquiry.validation.hotelPreferenceRequired', { defaultValue: 'Select a hotel option or choose No Hotel Required.' });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tourPackages: selectedTours,
          tourName: selectedTours.join(', '),
        }),
      });

      let data = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok && data.success) {
        setSubmitted(true);
        setTimeout(() => { onClose(); }, 3000);
      } else {
        setErrors(data.errors || { general: data.error || t('common.somethingWentWrong', { defaultValue: 'Something went wrong' }) });
      }
    } catch {
      setErrors({ general: t('common.serverConnectionErrorShort', { defaultValue: 'Could not connect to server. Please try again.' }) });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const triggerLabel = selectedTours.length === 0
    ? t('enquiry.selectTourPackages', { defaultValue: 'Select tour packages...' })
    : selectedTours.length === 1
      ? selectedTours[0]
      : t('enquiry.toursSelected', { count: selectedTours.length, defaultValue: `${selectedTours.length} tours selected` });

  return (
    <div className="enquiry-modal-overlay" onClick={onClose}>
      <div className="enquiry-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="enquiry-modal-close" onClick={onClose} aria-label={t('common.close', { defaultValue: 'Close' })}>✕</button>

        {submitted ? (
          <div className="modal-success">
            <div className="success-icon">✓</div>
            <h2>{t('enquiry.successTitle', { defaultValue: 'Thank you for your enquiry!' })}</h2>
            <p>{t('enquiry.successBodyNoWhatsapp', { defaultValue: 'Our travel expert will contact you shortly.' })}</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>{t('enquiry.title', { defaultValue: 'Enquire About a Tour' })}</h2>
              <p>{t('enquiry.subtitle', { defaultValue: "Fill in your details and we'll get back to you shortly" })}</p>
            </div>

            {errors.general && <div className="error-message general-error">{errors.general}</div>}

            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              <div className="form-group">
                <label htmlFor="modal-name">{t('contact.form.name') || 'Full Name'} *</label>
                <input type="text" id="modal-name" name="name" value={formData.name} onChange={handleChange} className={errors.name ? 'error' : ''} placeholder={t('contact.form.namePlaceholder', { defaultValue: 'John Doe' })} />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="modal-email">{t('contact.form.email') || 'Email'} *</label>
                <input type="email" id="modal-email" name="email" value={formData.email} onChange={handleChange} className={errors.email ? 'error' : ''} placeholder={t('contact.form.emailPlaceholder', { defaultValue: 'you@example.com' })} />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="modal-phone">{t('contact.form.phone') || 'WhatsApp / Phone'} *</label>
                <input type="tel" id="modal-phone" name="phone" value={formData.phone} onChange={handleChange} className={errors.phone ? 'error' : ''} placeholder={t('contact.form.phonePlaceholder', { defaultValue: '+91 XXXXX XXXXX' })} />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="modal-country">{t('contact.form.country', { defaultValue: 'Country' })}</label>
                <CountrySelect
                  id="modal-country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group date-group">
                <label>{t('enquiry.travelDates', { defaultValue: 'Travel Dates' })} *</label>
                <div className="date-row">
                  <div className="date-field">
                    <label htmlFor="modal-startDate" className="date-label">{t('enquiry.startDate', { defaultValue: 'Start Date' })}</label>
                    <input
                      type="date"
                      id="modal-startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={errors.startDate ? 'error' : ''}
                      required
                    />
                    {errors.startDate && <span className="error-message">{errors.startDate}</span>}
                  </div>
                  <div className="date-field">
                    <label htmlFor="modal-endDate" className="date-label">{t('enquiry.endDate', { defaultValue: 'End Date' })}</label>
                    <input
                      type="date"
                      id="modal-endDate"
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

              <div className="form-group" ref={dropdownRef}>
                <label>{t('enquiry.tourPackages', { defaultValue: 'Tour Package(s)' })}</label>
                <button type="button" className={`multiselect-trigger ${dropdownOpen ? 'open' : ''}`} onClick={() => setDropdownOpen(o => !o)}>
                  <span className={selectedTours.length === 0 ? 'placeholder' : ''}>{triggerLabel}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={dropdownOpen ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="multiselect-dropdown">
                    {TOUR_OPTIONS.map(tourKey => {
                      const tourLabel = t(tourKey);
                      return (
                      <label key={tourKey} className="multiselect-option">
                        <input type="checkbox" checked={selectedTours.includes(tourLabel)} onChange={() => toggleTour(tourLabel)} />
                        <span>{tourLabel}</span>
                      </label>
                    );})}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>{t('contact.form.hotelAccommodation', { defaultValue: 'Hotel Accommodation' })}</label>
                <div className="hotel-preference-stack">
                  <div className={`hotel-options${formData.noHotelRequired ? ' disabled' : ''}`}>
                    {HOTEL_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`hotel-option-btn ${formData.hotelCategory === opt.value ? 'active' : ''}`}
                        onClick={() => setFormData(p => ({ ...p, noHotelRequired: false, hotelCategory: p.hotelCategory === opt.value ? '' : opt.value }))}
                        disabled={formData.noHotelRequired}
                      >
                        {t(opt.labelKey, { defaultValue: opt.value })}
                      </button>
                    ))}
                  </div>
                  <label className="no-hotel-check" htmlFor="modal-noHotelRequired">
                    <input
                      id="modal-noHotelRequired"
                      type="checkbox"
                      name="noHotelRequired"
                      checked={formData.noHotelRequired}
                      onChange={handleNoHotelToggle}
                    />
                    <span>{t('enquiry.noHotelRequired', { defaultValue: 'No Hotel Required' })}</span>
                  </label>
                </div>
                {errors.hotelCategory && <span className="error-message">{errors.hotelCategory}</span>}
              </div>

              <div className="form-group">
                <label>{t('contact.form.travelers', { defaultValue: 'Number of Travelers' })}</label>
                <div className="travelers-row">
                  <div className="traveler-field">
                    <span className="traveler-label">{t('contact.form.adults', { defaultValue: 'Adults' })}</span>
                    <div className="stepper">
                      <button type="button" className="stepper-btn" onClick={() => setFormData(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))} aria-label={t('contact.form.decreaseAdults', { defaultValue: 'Decrease adults' })}>−</button>
                      <span className="stepper-value">{formData.adults}</span>
                      <button type="button" className="stepper-btn" onClick={() => setFormData(p => ({ ...p, adults: p.adults + 1 }))} aria-label={t('contact.form.increaseAdults', { defaultValue: 'Increase adults' })}>+</button>
                    </div>
                  </div>
                  <div className="traveler-field">
                    <span className="traveler-label">{t('contact.form.children', { defaultValue: 'Children' })}</span>
                    <div className="stepper">
                      <button type="button" className="stepper-btn" onClick={() => setFormData(p => ({ ...p, children: Math.max(0, p.children - 1) }))} aria-label={t('contact.form.decreaseChildren', { defaultValue: 'Decrease children' })}>−</button>
                      <span className="stepper-value">{formData.children}</span>
                      <button type="button" className="stepper-btn" onClick={() => setFormData(p => ({ ...p, children: p.children + 1 }))} aria-label={t('contact.form.increaseChildren', { defaultValue: 'Increase children' })}>+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="modal-message">{t('contact.form.message') || 'Message'}</label>
                <textarea id="modal-message" name="message" rows="3" value={formData.message} onChange={handleChange} placeholder={t('contact.form.messagePlaceholder') || 'Tell us about your travel preferences...'} />
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? t('contact.form.sending', { defaultValue: 'Sending...' }) : t('enquiry.send', { defaultValue: 'Send Enquiry' })}
              </button>
            </form>

            <div className="modal-features">
              <div className="feature-item"><span className="feature-icon">✓</span><span>{t('enquiry.feature.handpicked', { defaultValue: 'Handpicked tours & experiences' })}</span></div>
              <div className="feature-item"><span className="feature-icon">✓</span><span>{t('enquiry.feature.personalized', { defaultValue: 'Personalized itineraries' })}</span></div>
              <div className="feature-item"><span className="feature-icon">✓</span><span>{t('enquiry.feature.guidance', { defaultValue: 'Expert local guidance' })}</span></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnquiryModal;
