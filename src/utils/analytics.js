// Lightweight, env-driven GA4 wrapper. Everything is a silent no-op until
// VITE_GA_MEASUREMENT_ID is set (e.g. G-XXXXXXXXXX) on the build host, so
// local/dev builds ship zero analytics. SPA page views are sent manually
// from the router effect — automatic page_view is disabled because the
// document never reloads between routes.

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

let initialized = false;

export const initAnalytics = () => {
  if (!GA_ID || initialized) return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
};

export const trackPageView = (path) => {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path });
};

// Conversion funnel events:
//   enquiry_modal_open { trigger: 'exit_intent' | 'scroll_depth' | 'cta' | 'tour_card' }
//   enquiry_submit     { source: 'modal' | 'contact_form' }
//   review_submit      {}
export const trackEvent = (name, params = {}) => {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', name, params);
};
