import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CountrySelect from '../CountrySelect';
import { HOTEL_OPTIONS, CATEGORY_OPTIONS } from '../../constants/enquiryData';

// Shared presentational field groups for the two enquiry forms (inline
// Contact section and pop-up EnquiryModal). Each component receives:
//   form     — the full object returned by useEnquiryForm
//   idPrefix — '' (Contact) or 'modal-' (EnquiryModal) so label/id pairs
//              stay unique when both forms are mounted at once
//   classes  — map for the class names that differ between the two forms
//              (Contact uses contact-* prefixed classes, the modal doesn't)
// Submit flow, field order and row wrappers stay in the parent components —
// the two forms intentionally lay out the same fields differently.

export const NameField = ({ form, idPrefix = '', required = false }) => {
  const { t } = useTranslation();
  const id = `${idPrefix}name`;
  return (
    <div className="form-group">
      <label htmlFor={id}>{t('contact.form.name')} *</label>
      <input
        type="text"
        id={id}
        name="name"
        value={form.formData.name}
        onChange={form.handleChange}
        className={form.errors.name ? 'error' : ''}
        placeholder={t('contact.form.namePlaceholder', { defaultValue: 'John Doe' })}
        required={required || undefined}
      />
      {form.errors.name && <span className="error-message">{form.errors.name}</span>}
    </div>
  );
};

export const EmailField = ({ form, idPrefix = '', required = false }) => {
  const { t } = useTranslation();
  const id = `${idPrefix}email`;
  return (
    <div className="form-group">
      <label htmlFor={id}>{t('contact.form.email')} *</label>
      <input
        type="email"
        id={id}
        name="email"
        value={form.formData.email}
        onChange={form.handleChange}
        className={form.errors.email ? 'error' : ''}
        placeholder={t('contact.form.emailPlaceholder', { defaultValue: 'you@example.com' })}
        required={required || undefined}
      />
      {form.errors.email && <span className="error-message">{form.errors.email}</span>}
    </div>
  );
};

export const PhoneField = ({ form, idPrefix = '', required = false }) => {
  const { t } = useTranslation();
  const id = `${idPrefix}phone`;
  return (
    <div className="form-group">
      <label htmlFor={id}>{t('contact.form.phone')} *</label>
      <input
        type="tel"
        id={id}
        name="phone"
        value={form.formData.phone}
        onChange={form.handleChange}
        className={form.errors.phone ? 'error' : ''}
        placeholder={t('contact.form.phonePlaceholder', { defaultValue: '+91 XXXXX XXXXX' })}
        required={required || undefined}
      />
      {form.errors.phone && <span className="error-message">{form.errors.phone}</span>}
    </div>
  );
};

export const CountryField = ({ form, idPrefix = '', wrapClass = '' }) => {
  const { t } = useTranslation();
  const id = `${idPrefix}country`;
  const select = (
    <CountrySelect
      id={id}
      name="country"
      value={form.formData.country}
      onChange={form.handleChange}
    />
  );
  return (
    <div className="form-group">
      <label htmlFor={id}>{t('contact.form.country', { defaultValue: 'Country' })}</label>
      {wrapClass ? <div className={wrapClass}>{select}</div> : select}
    </div>
  );
};

export const TravelDatesFields = ({ form, idPrefix = '' }) => {
  const { t } = useTranslation();
  const startId = `${idPrefix}startDate`;
  const endId = `${idPrefix}endDate`;
  return (
    <div className="form-group date-group">
      <label>{t('enquiry.travelDates', { defaultValue: 'Travel Dates' })} *</label>
      <div className="date-row">
        <div className="date-field">
          <label htmlFor={startId} className="date-label">{t('enquiry.startDate', { defaultValue: 'Start Date' })}</label>
          <input
            type="date"
            id={startId}
            name="startDate"
            value={form.formData.startDate}
            onChange={form.handleChange}
            className={form.errors.startDate ? 'error' : ''}
            required
          />
          {form.errors.startDate && <span className="error-message">{form.errors.startDate}</span>}
        </div>
        <div className="date-field">
          <label htmlFor={endId} className="date-label">{t('enquiry.endDate', { defaultValue: 'End Date' })}</label>
          <input
            type="date"
            id={endId}
            name="endDate"
            min={form.formData.startDate || undefined}
            value={form.formData.endDate}
            onChange={form.handleChange}
            className={form.errors.endDate ? 'error' : ''}
            required
          />
          {form.errors.endDate && <span className="error-message">{form.errors.endDate}</span>}
        </div>
      </div>
    </div>
  );
};

export const CategoryPills = ({ form, classes }) => {
  const { t } = useTranslation();
  return (
    <div className="form-group">
      <label>{t('enquiry.tourType', { defaultValue: 'I am interested in' })}</label>
      <div className={classes.pills}>
        {CATEGORY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`${classes.pill} ${form.tourCategory === opt.value ? 'active' : ''}`}
            onClick={() => form.handleCategoryChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const TourMultiSelect = ({ form, classes }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [prevCategory, setPrevCategory] = useState(form.tourCategory);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Switching category swaps the option list — close so the user re-opens
  // onto the new list rather than seeing it mutate underneath them.
  // (render-time state adjustment, per react.dev/learn/you-might-not-need-an-effect)
  if (prevCategory !== form.tourCategory) {
    setPrevCategory(form.tourCategory);
    setOpen(false);
  }

  if (!form.tourCategory) return null;

  const triggerLabel = form.selectedTours.length === 0
    ? t('enquiry.selectTourPackages', { defaultValue: 'Select tour packages...' })
    : form.selectedTours.length === 1
      ? form.selectedTours[0]
      : t('enquiry.toursSelected', { count: form.selectedTours.length, defaultValue: `${form.selectedTours.length} tours selected` });

  return (
    <div className="form-group" ref={ref}>
      <label>{t('enquiry.tourPackages', { defaultValue: 'Tour Package(s)' })}</label>
      <button
        type="button"
        className={`${classes.msTrigger} ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={form.selectedTours.length === 0 ? 'placeholder' : ''}>{triggerLabel}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
        </svg>
      </button>
      {open && (
        <div className={classes.msDropdown}>
          {form.activeTourKeys.map(tourKey => {
            const tourLabel = t(tourKey);
            return (
              <label key={tourKey} className={classes.msOption}>
                <input type="checkbox" checked={form.selectedTours.includes(tourLabel)} onChange={() => form.toggleTour(tourLabel)} />
                <span>{tourLabel}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const HotelPreference = ({ form, classes, idPrefix = '', stackClass = '' }) => {
  const { t } = useTranslation();
  const checkId = `${idPrefix}noHotelRequired`;
  const body = (
    <>
      <div className={`${classes.hotelOptions}${form.formData.noHotelRequired ? ' disabled' : ''}`}>
        {HOTEL_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`${classes.hotelBtn} ${form.formData.hotelCategory === opt.value ? 'active' : ''}`}
            onClick={() => form.setFormData(p => ({ ...p, noHotelRequired: false, hotelCategory: p.hotelCategory === opt.value ? '' : opt.value }))}
            disabled={form.formData.noHotelRequired}
          >
            {t(opt.labelKey, { defaultValue: opt.value })}
          </button>
        ))}
      </div>
      <label className="no-hotel-check" htmlFor={checkId}>
        <input
          id={checkId}
          type="checkbox"
          name="noHotelRequired"
          checked={form.formData.noHotelRequired}
          onChange={form.handleNoHotelToggle}
        />
        <span>{t('enquiry.noHotelRequired', { defaultValue: 'No Hotel Required' })}</span>
      </label>
    </>
  );
  return (
    <div className="form-group">
      <label>{t('contact.form.hotelAccommodation', { defaultValue: 'Hotel Accommodation' })}</label>
      {stackClass ? <div className={stackClass}>{body}</div> : body}
      {form.errors.hotelCategory && <span className="error-message">{form.errors.hotelCategory}</span>}
    </div>
  );
};

export const TravellersStepper = ({ form, classes }) => {
  const { t } = useTranslation();
  return (
    <div className="form-group">
      <label>{t('contact.form.travelers', { defaultValue: 'Number of Travelers' })}</label>
      <div className={classes.travelersRow}>
        <div className={classes.travelerField}>
          <span className={classes.travelerLabel}>{t('contact.form.adults', { defaultValue: 'Adults' })}</span>
          <div className={classes.stepper}>
            <button type="button" className={classes.stepperBtn} onClick={() => form.setFormData(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))} aria-label={t('contact.form.decreaseAdults', { defaultValue: 'Decrease adults' })}>−</button>
            <span className={classes.stepperValue}>{form.formData.adults}</span>
            <button type="button" className={classes.stepperBtn} onClick={() => form.setFormData(p => ({ ...p, adults: p.adults + 1 }))} aria-label={t('contact.form.increaseAdults', { defaultValue: 'Increase adults' })}>+</button>
          </div>
        </div>
        <div className={classes.travelerField}>
          <span className={classes.travelerLabel}>{t('contact.form.children', { defaultValue: 'Children' })}</span>
          <div className={classes.stepper}>
            <button type="button" className={classes.stepperBtn} onClick={() => form.setFormData(p => ({ ...p, children: Math.max(0, p.children - 1) }))} aria-label={t('contact.form.decreaseChildren', { defaultValue: 'Decrease children' })}>−</button>
            <span className={classes.stepperValue}>{form.formData.children}</span>
            <button type="button" className={classes.stepperBtn} onClick={() => form.setFormData(p => ({ ...p, children: p.children + 1 }))} aria-label={t('contact.form.increaseChildren', { defaultValue: 'Increase children' })}>+</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MessageField = ({ form, idPrefix = '', rows = 4 }) => {
  const { t } = useTranslation();
  const id = `${idPrefix}message`;
  return (
    <div className="form-group">
      <label htmlFor={id}>{t('contact.form.message')}</label>
      <textarea
        id={id}
        name="message"
        rows={rows}
        value={form.formData.message}
        onChange={form.handleChange}
        placeholder={t('contact.form.messagePlaceholder')}
      />
    </div>
  );
};
