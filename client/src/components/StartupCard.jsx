import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const StartupCard = ({ startup, onClick }) => {
  const { language } = useLanguage();
  
  return (
  <div 
    className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm hover:shadow-md p-6 flex flex-col items-center hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden h-full"
  >
    {/* Gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
    
    {/* Animated border */}
    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5"></div>
    
    {/* Logo container with transparent background */}
    <div className="relative z-10 w-20 h-20 flex items-center justify-center mb-4 transition-all duration-200 group-hover:scale-105">
      {startup.logo ? (
        <img 
          src={startup.logo} 
          alt={startup.name} 
          className={`object-contain ${
            startup.name === 'Eticpro' ? 'w-full h-full max-w-[80px] max-h-[80px]' : 
            startup.name === 'Privax' ? 'w-full h-full max-w-[80px] max-h-[80px]' : 
            'w-full h-full max-w-[64px] max-h-[64px]'
          }`} 
        />
      ) : (
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25">
          <span className="text-3xl text-white font-black group-hover:rotate-12 transition-transform duration-300">
            {startup.name[0]}
          </span>
          {/* Glow effect for letter fallback */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
        </div>
      )}
    </div>
    
    {/* Content */}
    <div className="relative z-10 flex flex-col h-full w-full text-center">
      {/* Segment Chip */}
      {startup.segment && (
        <div className="mb-2 flex justify-center">
          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-blue-200 bg-white/10 border border-white/10 rounded-full">
            {t(`segments.${startup.segment === 'Cumplimiento de Ley' ? 'compliance' : startup.segment === 'Riesgos y Acción' ? 'risks' : 'data'}`, language)}
          </span>
        </div>
      )}
      
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        {startup.name}
      </h3>
      <p className="text-gray-300 mb-4 font-medium leading-relaxed text-sm">
        {startup.tagline}
      </p>

      

      
      
      {/* Enhanced buttons */}
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button 
          onClick={onClick} 
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {t('modules.viewMore', language)}
        </button>
          <a 
            href={
              startup.name === 'Vizora' ? "https://vizoraclient.onrender.com/crm" :
              startup.name === 'Eticpro' ? "https://compliax.onrender.com" :
              startup.name === 'Privax' ? "https://privax-uqom.onrender.com" :
              startup.name === 'Smartrisk' ? "https://smartrisk.onrender.com" :
              startup.name === 'Automatix' ? "https://unbiax.onrender.com" :
              startup.name === 'Fortax' ? "https://smartrisk.onrender.com" :
              startup.name === 'LMS' ? "https://lms-client-ct7h.onrender.com" :
              startup.name === 'Batonpass' ? "https://smartrisk.onrender.com" : "https://unbiax.onrender.com"
            }
            target="_blank" 
            rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
              {t('modules.enter', language)}
        </a>
        </div>
    </div>
    
    {/* Floating particles */}
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
          style={{
            left: `${20 + i * 30}%`,
            top: `${30 + i * 20}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + i}s`
          }}
        />
      ))}
    </div>
  </div>
  );
};

export default StartupCard; 