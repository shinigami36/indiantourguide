import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { postJsonWithRetry } from '../utils/api';
import { EMPTY_FORM } from '../constants/enquiryData';
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
} from './enquiry/EnquiryFields';
import './Contact.css';

// Class names the shared field components should use in this form —
// Contact.css styles the contact-* prefixed variants.
const FIELD_CLASSES = {
  pills: 'contact-category-pills',
  pill: 'contact-category-pill',
  msTrigger: 'contact-multiselect-trigger',
  msDropdown: 'contact-multiselect-dropdown',
  msOption: 'contact-multiselect-option',
  hotelOptions: 'contact-hotel-options',
  hotelBtn: 'contact-hotel-btn',
  travelersRow: 'contact-travelers-row',
  travelerField: 'contact-traveler-field',
  travelerLabel: 'contact-traveler-label',
  stepper: 'contact-stepper',
  stepperBtn: 'contact-stepper-btn',
  stepperValue: 'contact-stepper-value',
};

const Contact = () => {
  const { t } = useTranslation();
  const form = useEnquiryForm();
  const {
    formData, setFormData,
    selectedTours, setSelectedTours,
    tourCategory, setTourCategory,
    setErrors,
    isSubmitting, setIsSubmitting,
    validateForm,
  } = form;

  const [status, setStatus] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

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
            <NameField form={form} required />
            <EmailField form={form} required />
          </div>

          <TravelDatesFields form={form} />

          <CategoryPills form={form} classes={FIELD_CLASSES} />
          <TourMultiSelect form={form} classes={FIELD_CLASSES} />

          {/* Row 2: Phone + Country */}
          <div className="form-row">
            <PhoneField form={form} required />
            <CountryField form={form} wrapClass="contact-cs" />
          </div>

          <HotelPreference form={form} classes={FIELD_CLASSES} />

          <TravellersStepper form={form} classes={FIELD_CLASSES} />

          <MessageField form={form} rows={4} />

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
