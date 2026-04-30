import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Tours from './components/Tours';
import TopAttractions from './components/TopAttractions';
import SiteReviews from './components/SiteReviews';
import Contact from './components/Contact';
import Footer from './components/Footer';
import EnquiryModal from './components/EnquiryModal';
import OfflineBanner from './components/OfflineBanner';
import { warmBackend } from './utils/api';
import './App.css';

// Secondary pages — only loaded when the user navigates to them. This
// trims the initial bundle by ~20–30KB gzipped for the ~80% of visitors
// who only ever see the home page.
const Attractions = lazy(() => import('./components/Attractions'));
const InternationalTours = lazy(() => import('./components/InternationalTours'));

const PageFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="btn-spinner" aria-label="Loading" style={{ width: 32, height: 32, borderWidth: 3, color: '#c2410c' }} />
  </div>
);

function App() {
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [initialTour, setInitialTour] = useState(null);
  const [initialAdults, setInitialAdults] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  // Track whether we've already auto-opened the enquiry modal this session.
  // Both the exit-intent and the scroll-depth triggers read this so we
  // only interrupt the user once — re-opening would feel spammy.
  const autoOpenedRef = useRef(false);

  // Auto-open the enquiry modal on the first strong engagement signal:
  //   1. Exit intent — pointer leaves the viewport via the top edge (desktop)
  //   2. Scroll depth — user has read >=75% of the page (mobile + desktop)
  // This replaces a blind 2-minute timer. Rationale: a timer fires for
  // every visitor, including bounces; engagement signals only fire for
  // users who actually consumed enough content to be interested, which
  // protects conversion rate and avoids annoying drive-by traffic.
  useEffect(() => {
    const trigger = () => {
      if (autoOpenedRef.current) return;
      autoOpenedRef.current = true;
      setShowEnquiryModal(true);
    };

    const onMouseOut = (e) => {
      // Desktop exit-intent: cursor moves above the viewport (toward tab bar)
      // and is leaving the document (relatedTarget is null).
      if (!e.relatedTarget && e.clientY <= 0) trigger();
    };

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total > 0 && scrolled / total >= 0.75) trigger();
    };

    document.addEventListener('mouseout', onMouseOut);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Warm the backend on the first user interaction rather than immediately
  // on page load. Reason: at low traffic (~2000 users/month) Render's free
  // tier spins down after idle; blindly pinging on every page view wakes
  // it unnecessarily for visitors who never submit. Waiting for a real
  // interaction (mouse move, scroll, key press, touch) means only engaged
  // users trigger the warm-up — and they're the ones most likely to submit.
  useEffect(() => {
    let warmed = false;
    const warm = () => {
      if (warmed) return;
      warmed = true;
      warmBackend();
      events.forEach((evt) => window.removeEventListener(evt, warm));
    };
    const events = ['pointerdown', 'scroll', 'keydown', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, warm, { passive: true, once: false }));
    // Safety fallback: warm after 30s even without interaction, so the form
    // is ready if a user lingers reading before clicking.
    const fallback = window.setTimeout(warm, 30 * 1000);
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, warm));
      window.clearTimeout(fallback);
    };
  }, []);

  // Scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Keep browser tab title aligned with current page context
  useEffect(() => {
    if (currentPage === 'attractions') document.title = 'Attractions | India Tours Guide';
    else if (currentPage === 'international') document.title = 'International Tours | India Tours Guide';
    else document.title = 'India Tours Guide | Private India & World Tours';
  }, [currentPage]);

  const handleEnquireTour = useCallback((tourName) => {
    setInitialTour(tourName);
    setShowEnquiryModal(true);
  }, []);

  const handleGetEstimate = useCallback(({ destination, travellers }) => {
    setInitialTour(destination || null);
    setInitialAdults(travellers || null);
    setShowEnquiryModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowEnquiryModal(false);
    setInitialTour(null);
    setInitialAdults(null);
  }, []);

  return (
    <div className="App">
      <OfflineBanner />
      <Header currentPage={currentPage} onNavigate={setCurrentPage} onOpenEnquiry={() => setShowEnquiryModal(true)} />
      <main>
        {currentPage === 'attractions' ? (
          <Suspense fallback={<PageFallback />}>
            <Attractions
              onEnquireTour={handleEnquireTour}
              onNavigateHome={() => setCurrentPage('home')}
            />
          </Suspense>
        ) : currentPage === 'international' ? (
          <Suspense fallback={<PageFallback />}>
            <InternationalTours
              onEnquireTour={handleEnquireTour}
              onNavigateHome={() => setCurrentPage('home')}
              onOpenEnquiry={() => setShowEnquiryModal(true)}
            />
          </Suspense>
        ) : (
          <>
            <Hero
              onOpenEnquiry={() => setShowEnquiryModal(true)}
              onGetEstimate={handleGetEstimate}
              onScrollToTours={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
            />
            <Tours
              onOpenEnquiry={() => setShowEnquiryModal(true)}
              onEnquireTour={handleEnquireTour}
            />
            <TopAttractions onNavigateAttractions={() => setCurrentPage('attractions')} />
            <SiteReviews />
            <Contact />
          </>
        )}
      </main>
      <Footer onNavigate={setCurrentPage} />
      <EnquiryModal
        isOpen={showEnquiryModal}
        onClose={handleCloseModal}
        initialTour={initialTour}
        initialAdults={initialAdults}
      />
    </div>
  );
}

export default App;
