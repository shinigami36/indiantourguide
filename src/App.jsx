import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Tours from './components/Tours';
import TopAttractions from './components/TopAttractions';
import Attractions from './components/Attractions';
import InternationalTours from './components/InternationalTours';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Footer from './components/Footer';
import EnquiryModal from './components/EnquiryModal';
import { warmBackend } from './utils/api';
import './App.css';

function App() {
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [initialTour, setInitialTour] = useState(null);
  const [initialAdults, setInitialAdults] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  // Open enquiry modal after 2 minutes of browsing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEnquiryModal(true);
    }, 2 * 60 * 1000); // 2 minutes
    return () => clearTimeout(timer);
  }, []);

  // Warm backend once to reduce first-request cold-start impact.
  useEffect(() => {
    warmBackend();
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

  const handleGetEstimate = useCallback(({ destination, travellers, days }) => {
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
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>
        {currentPage === 'attractions' ? (
          <Attractions
            onEnquireTour={handleEnquireTour}
            onNavigateHome={() => setCurrentPage('home')}
          />
        ) : currentPage === 'international' ? (
          <InternationalTours
            onEnquireTour={handleEnquireTour}
            onNavigateHome={() => setCurrentPage('home')}
            onOpenEnquiry={() => setShowEnquiryModal(true)}
          />
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
            <Reviews />
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
