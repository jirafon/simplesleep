import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Demo from '../components/Demo';
import FloatingButtons from '../components/FloatingButtons';
import WhatsAppFloat from '../components/WhatsAppFloat';
import BackToTop from '../components/BackToTop';
import MpdCoverageDashboard from '../components/MpdCoverageDashboard';

function MpdCoverageMockRoute() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="bg-gray-950 min-h-screen font-sans antialiased pt-20 md:pt-24">
      <Navbar onOpenDemo={() => setIsDemoModalOpen(true)} />
      <MpdCoverageDashboard />
      <Footer />
      <Demo isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
      <FloatingButtons onOpenDemo={() => setIsDemoModalOpen(true)} />
      <WhatsAppFloat />
      <BackToTop />
    </div>
  );
}

export default MpdCoverageMockRoute;
