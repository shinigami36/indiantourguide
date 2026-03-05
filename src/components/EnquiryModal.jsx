import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './EnquiryModal.css';

const EnquiryModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('contact.validation.nameRequired') || 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('contact.validation.emailRequired') || 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.validation.emailInvalid') || 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t('contact.validation.phoneRequired') || 'Phone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Enquiry submitted:', formData);
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '' });
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="enquiry-modal-overlay" onClick={onClose}>
      <div className="enquiry-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="enquiry-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {submitted ? (
          <div className="modal-success">
            <div className="success-icon">✓</div>
            <h2>{t('contact.form.success') || 'Thank you!'}</h2>
            <p>We will contact you soon with tour details and special offers.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>Explore Our Tours</h2>
              <p>Get personalized tour recommendations and special offers</p>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="modal-name">
                  {t('contact.form.name') || 'Full Name'}
                </label>
                <input
                  type="text"
                  id="modal-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="John Doe"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="modal-email">
                  {t('contact.form.email') || 'Email'}
                </label>
                <input
                  type="email"
                  id="modal-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="you@example.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="modal-phone">
                  {t('contact.form.phone') || 'WhatsApp / Phone'}
                </label>
                <input
                  type="tel"
                  id="modal-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="+1 (555) 000-0000"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <button type="submit" className="submit-btn">
                {t('contact.form.submit') || 'Get Tour Details'}
              </button>
            </form>

            <div className="modal-features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Handpicked tours & experiences</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Personalized itineraries</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Expert local guidance</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnquiryModal;
