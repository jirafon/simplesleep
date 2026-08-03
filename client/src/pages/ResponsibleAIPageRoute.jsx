import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ResponsibleAI from '../components/ResponsibleAI';
import Footer from '../components/Footer';
import Demo from '../components/Demo';
import FloatingButtons from '../components/FloatingButtons';
import WhatsAppFloat from '../components/WhatsAppFloat';
import BackToTop from '../components/BackToTop';

function ResponsibleAIPageRoute() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleOpenDemoModal = () => setIsDemoModalOpen(true);
  const handleCloseDemoModal = () => setIsDemoModalOpen(false);

  return (
    <div className="bg-black min-h-screen font-sans antialiased pt-20 md:pt-24">
      <Navbar onOpenDemo={handleOpenDemoModal} />
      <ResponsibleAI />
      <Footer />
      <Demo isOpen={isDemoModalOpen} onClose={handleCloseDemoModal} />
      <FloatingButtons onOpenDemo={handleOpenDemoModal} />
      <WhatsAppFloat />
      <BackToTop />
    </div>
  );
}

export default ResponsibleAIPageRoute;
