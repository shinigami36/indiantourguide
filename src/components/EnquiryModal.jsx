import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { postJsonWithRetry } from '../utils/api';
import { trackEvent } from '../utils/analytics';
import { EMPTY_FORM, detectCategoryFromTour } from '../constants/enquiryData';
import { useEnquiryForm } from '../hooks/useEnquiryForm';
import {
  NameField,
  EmailField,
  PhoneField,
  CountryField,
  TravelDatesFields,
  CategoryPills,
  TourMultiSelect,
  HotelPreference,
  TravellersStepper,
  MessageField,
  HoneypotField,
} from './enquiry/EnquiryFields';
import './EnquiryModal.css';

// Class names the shared field components should use in this form —
// EnquiryModal.css styles the unprefixed variants.
const FIELD_CLASSES = {
  pills: 'tour-category-pills',
  pill: 'category-pill',
  msTrigger: 'multiselect-trigger',
  msDropdown: 'multiselect-dropdown',
  msOption: 'multiselect-option',
  hotelOptions: 'hotel-options',
  hotelBtn: 'hotel-option-btn',
  travelersRow: 'travelers-row',
  travelerField: 'traveler-field',
  travelerLabel: 'traveler-label',
  stepper: 'stepper',
  stepperBtn: 'stepper-btn',
  stepperValue: 'stepper-value',
};

const EnquiryModal = ({ isOpen, onClose, initialTour, initialCategory, initialAdults }) => {
  const { t } = useTranslation();
  const form = useEnquiryForm({ initialTour, initialAdults });
  const {
    formData,
    setFormData,
    selectedTours, setSelectedTours,
    tourCategory, setTourCategory,
    errors, setErrors,
    isSubmitting, setIsSubmitting,
    validateForm,
  } = form;

  const [submitted, setSubmitted] = useState(false);
  const autoCloseTimerRef = useRef(null);

  // Reset all state whenever the modal opens (or initialTour changes).
  // The hook's useState only runs on mount — the modal re-uses its hook
  // instance across opens, so we reset manually here when isOpen flips true.
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...EMPTY_FORM, adults: initialAdults || 1 });
      setSelectedTours(initialTour ? [initialTour] : []);
      // Callers that know the tour's category pass it explicitly; the
      // title-matching detection only remains as a fallback (e.g. Hero's
      // free-text destination estimate).
      setTourCategory(initialCategory || detectCategoryFromTour(initialTour, t));
      setErrors({});
      setSubmitted(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialTour, initialCategory, initialAdults]);

  // Body scroll lock + Escape to close
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(autoCloseTimerRef.current);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting || submitted) return; // prevent double-submit
    setIsSubmitting(true);
    let mounted = true;
    try {
      const { res, data } = await postJsonWithRetry('/api/enquiry', {
        ...formData,
        tourPackages: selectedTours,
        tourName: selectedTours.join(', '),
        tourCategory,
      });

      if (!mounted) return; // component unmounted mid-request, bail out
      if (res.ok && data.success) {
        trackEvent('enquiry_submit', { source: 'modal' });
        setSubmitted(true);
        autoCloseTimerRef.current = setTimeout(() => { if (mounted) onClose(); }, 3000);
      } else {
        setErrors(data.errors || data.fieldErrors || { general: data.error || t('common.somethingWentWrong', { defaultValue: 'Something went wrong' }) });
      }
    } catch {
      if (mounted) setErrors({ general: t('common.serverConnectionErrorShort', { defaultValue: 'Could not connect to server. Please try again.' }) });
    } finally {
      if (mounted) setIsSubmitting(false);
      mounted = false;
    }
  };

  if (!isOpen) return null;

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
              <span className="modal-eyebrow">Plan Your Trip</span>
              <h2>{t('enquiry.title', { defaultValue: 'Enquire About a Tour' })}</h2>
              <p>{t('enquiry.subtitle', { defaultValue: "Fill in your details and we'll get back to you shortly" })}</p>
            </div>

            {errors.general && <div className="error-message general-error">{errors.general}</div>}

            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              <HoneypotField form={form} idPrefix="modal-" />
              <NameField form={form} idPrefix="modal-" />
              <EmailField form={form} idPrefix="modal-" />
              <PhoneField form={form} idPrefix="modal-" />
              <CountryField form={form} idPrefix="modal-" />

              <TravelDatesFields form={form} idPrefix="modal-" />

              <CategoryPills form={form} classes={FIELD_CLASSES} />
              <TourMultiSelect form={form} classes={FIELD_CLASSES} />

              <HotelPreference form={form} classes={FIELD_CLASSES} idPrefix="modal-" stackClass="hotel-preference-stack" />

              <TravellersStepper form={form} classes={FIELD_CLASSES} />

              <MessageField form={form} idPrefix="modal-" rows={3} />

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    {t('contact.form.sending', { defaultValue: 'Sending...' })}
                  </>
                ) : t('enquiry.send', { defaultValue: 'Send Enquiry' })}
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
