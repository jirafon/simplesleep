import React, { useEffect, useState } from 'react';
import anim3Gif from '../assets/anim3.gif';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const HeroHolding = ({ onOpenDemo }) => {
  const [scrollY, setScrollY] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // chips removidos del hero para simplificar la primera vista

  return (
    <section 
      id="hero" 
      className="w-full min-h-[120vh] flex flex-col justify-center items-center py-28 px-4 text-center relative overflow-hidden scroll-mt-24 md:scroll-mt-28"
      style={{
        backgroundImage: `url(${anim3Gif})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        
      }}
    >
      {/* Overlay con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
      
      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div data-aos="fade-up" data-aos-delay="200">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300 mb-8 leading-tight tracking-tight">
            {t('hero.title', language)} <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('hero.titleHighlight', language)}
            </span> <br className="hidden md:inline" />
            {t('hero.titleEnd', language)}
          </h1>
        </div>
        
        <div data-aos="fade-up" data-aos-delay="400">
          <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto mb-12 font-light leading-relaxed">
            {t('hero.description', language)}
            <br className="my-4" />
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('hero.descriptionHighlight', language)}
            </span>
          </p>
        </div>

        {/* CTA y chips removidos para una primera vista más limpia */}
      </div>

      {/* Indicador de scroll removido */}
    </section>
  );
};

export default HeroHolding; 