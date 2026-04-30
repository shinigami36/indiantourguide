import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EMPTY_FORM,
  tourKeysForCategory,
} from '../constants/enquiryData';

// Shared form state + validation for both the inline Contact form and the
// pop-up EnquiryModal. Each component still owns its own submit flow (they
// have different success UX — inline status message vs. modal success screen
// with auto-close), so this hook intentionally does NOT do the fetch call.
// It returns everything needed to render the shared form fields and to run
// validateForm() before the component's own submit logic runs.
export function useEnquiryForm({ initialTour = null, initialAdults = null } = {}) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState(() => ({
    ...EMPTY_FORM,
    adults: initialAdults || EMPTY_FORM.adults,
  }));
  const [selectedTours, setSelectedTours] = useState(() => (initialTour ? [initialTour] : []));
  const [tourCategory, setTourCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTourKeys = useMemo(() => tourKeysForCategory(tourCategory), [tourCategory]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      if (next[name]) next[name] = '';
      if ((name === 'startDate' || name === 'endDate') && next.endDate) next.endDate = '';
      return next;
    });
  }, []);

  const handleNoHotelToggle = useCallback((event) => {
    const checked = event.target.checked;
    setFormData((prev) => ({
      ...prev,
      noHotelRequired: checked,
      hotelCategory: checked ? '' : prev.hotelCategory,
    }));
    setErrors((prev) => ({ ...prev, hotelCategory: '' }));
  }, []);

  const toggleTour = useCallback((tour) => {
    setSelectedTours((prev) => (prev.includes(tour)
      ? prev.filter((x) => x !== tour)
      : [...prev, tour]));
  }, []);

  const handleCategoryChange = useCallback((cat) => {
    setTourCategory(cat);
    // When switching categories, drop any currently-selected tours that are
    // no longer valid for the new filter.
    const validTitles = tourKeysForCategory(cat).map((k) => t(k));
    setSelectedTours((prev) => prev.filter((tour) => validTitles.includes(tour)));
  }, [t]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t('contact.validation.nameRequired', { defaultValue: 'Name is required.' });
    }
    if (!formData.email.trim()) {
      newErrors.email = t('contact.validation.emailRequired', { defaultValue: 'Email is required.' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.validation.emailInvalid', { defaultValue: 'Please enter a valid email.' });
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('contact.validation.phoneRequired', { defaultValue: 'Phone is required.' });
    } else {
      const digits = formData.phone.replace(/\D/g, '').length;
      if (digits < 6 || digits > 15) {
        newErrors.phone = t('contact.validation.phoneInvalid', { defaultValue: 'Please enter a valid phone number.' });
      }
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
  }, [formData, t]);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
    setSelectedTours([]);
    setTourCategory('');
    setErrors({});
    setIsSubmitting(false);
  }, []);

  // Build the payload the backend /api/enquiry endpoint expects.
  const buildPayload = useCallback(() => ({
    ...formData,
    tourPackages: selectedTours,
    tourName: selectedTours.join(', '),
    tourCategory,
  }), [formData, selectedTours, tourCategory]);

  return {
    // state
    formData,
    setFormData,
    selectedTours,
    setSelectedTours,
    tourCategory,
    setTourCategory,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    // derived
    activeTourKeys,
    // handlers
    handleChange,
    handleNoHotelToggle,
    toggleTour,
    handleCategoryChange,
    validateForm,
    resetForm,
    buildPayload,
  };
}
