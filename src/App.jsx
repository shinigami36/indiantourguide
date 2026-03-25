import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Tours from './components/Tours';
import TopAttractions from './components/TopAttractions';
import Attractions from './components/Attractions';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Footer from './components/Footer';
import EnquiryModal from './components/EnquiryModal';
import { warmBackend } from './utils/api';
import './App.css';

function App() {
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [initialTour, setInitialTour] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  // Open enquiry modal on first load
  useEffect(() => {
    setShowEnquiryModal(true);
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
    document.title = currentPage === 'attractions'
      ? 'Attractions | IndiaTourGuide'
      : 'IndiaTourGuide | Private India & World Tours';
  }, [currentPage]);

  const handleEnquireTour = useCallback((tourName) => {
    setInitialTour(tourName);
    setShowEnquiryModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowEnquiryModal(false);
    setInitialTour(null);
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
        ) : (
          <>
            <Hero
              onOpenEnquiry={() => setShowEnquiryModal(true)}
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
      />
    </div>
  );
}

export default App;
