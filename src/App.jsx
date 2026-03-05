import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Tours from './components/Tours';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import EnquiryModal from './components/EnquiryModal';
import './App.css';

function App() {
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  useEffect(() => {
    // Show modal when page loads
    setShowEnquiryModal(true);
  }, []);

  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <Tours onOpenEnquiry={() => setShowEnquiryModal(true)} />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <EnquiryModal 
        isOpen={showEnquiryModal} 
        onClose={() => setShowEnquiryModal(false)} 
      />
    </div>
  );
}

export default App;
