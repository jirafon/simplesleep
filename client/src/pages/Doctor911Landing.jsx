import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeroSection from '../components/doctor911/HeroSection';
import HowItWorks from '../components/doctor911/HowItWorks';
import TestimonialsSlider from '../components/doctor911/TestimonialsSlider';
import TrustBand from '../components/doctor911/TrustBand';
import FinalCta from '../components/doctor911/FinalCta';
import SiempreSaludFooter from '../components/doctor911/SaludSimpleFooter';
import Navbar from '../components/doctor911/Navbar';
import RecommendedExamsPanel from '../components/doctor911/RecommendedExamsPanel';
import { useAuth } from '../context/AuthContext';

function SiempreSaludLanding() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const whatsappPhone = '56978830533';

  const handleWhatsAppContact = () => {
    const whatsappMessage = 'Hola, quiero mas informacion sobre SaludSimple.';
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    if (isAdmin) {
      navigate('/admin/orders', { replace: true });
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    const id = location.hash.replace('#', '');
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section id="trust" className="scroll-mt-28">
          <TrustBand />
        </section>

        <section id="services" className="scroll-mt-28">
          <HeroSection />
        </section>

        {user && (
          <section id="recommended-exams" className="scroll-mt-28">
            <RecommendedExamsPanel user={user} />
          </section>
        )}

        <section id="how-it-works" className="scroll-mt-28">
          <HowItWorks />
        </section>

        <section id="testimonials" className="scroll-mt-28">
          <TestimonialsSlider />
        </section>

        <section id="cta-final" className="scroll-mt-28">
          <FinalCta />
        </section>
      </main>
      <button
        type="button"
        aria-label="Contactar por WhatsApp"
        onClick={handleWhatsAppContact}
        className="fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-xl transition"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
        </svg>
        <span className="text-sm font-semibold">WhatsApp</span>
      </button>
      {showScrollTop && (
        <button
          type="button"
          aria-label="Subir arriba"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-black text-white w-11 h-11 rounded-full shadow-xl transition"
        >
          ↑
        </button>
      )}
      <SiempreSaludFooter />
    </div>
  );
}

export default SiempreSaludLanding;
export { SiempreSaludLanding as SaludSimpleLanding };
