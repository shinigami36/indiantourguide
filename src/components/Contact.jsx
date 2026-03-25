import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CountrySelect from './CountrySelect';
import './Contact.css';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

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

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('contact.validation.nameRequired');
    if (!formData.email.trim()) {
      newErrors.email = t('contact.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.validation.emailInvalid');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('contact.validation.phoneRequired');
    } else if (formData.phone.replace(/\D/g, '').length < 6) {
      newErrors.phone = t('contact.validation.phoneInvalid');
    }
    if (!formData.startDate) {
      newErrors.startDate = t('enquiry.validation.startDateRequired', { defaultValue: 'Start date is required.' });
    }
    if (!formData.endDate) {
      newErrors.endDate = t('enquiry.validation.endDateRequired', { defaultValue: 'End date is required.' });
    }
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
    setStatus('');
    setStatusMsg('');

    try {
      const res = await fetch(`${API_URL}/api/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      let data = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok && data.success) {
        setStatus('success');
        setStatusMsg(data.message || t('contact.success', { defaultValue: 'Enquiry sent successfully.' }));
        setFormData(EMPTY_FORM);
      } else if (data.errors) {
        setErrors(data.errors);
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
            {isSubmitting ? t('contact.form.sending', { defaultValue: 'Sending...' }) : t('contact.form.submit')}
          </button>

          {status === 'success' && <div className="form-status success">{statusMsg}</div>}
          {status === 'error'   && <div className="form-status error">{statusMsg}</div>}
        </form>
      </div>
    </section>
  );
};

export default Contact;
