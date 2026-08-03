import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const FloatingButtons = ({ onOpenDemo }) => {
  const { language } = useLanguage();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
      {/* Solicita Demo Button */}
      <button 
        onClick={onOpenDemo}
        className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
      >
        <span className="flex items-center gap-2">
          {t('hero.requestDemo', language)}
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </button>
      
      {/* Ver Módulos Button */}
      <button 
        onClick={() => {
          const modulosSection = document.getElementById('startups');
          if (modulosSection) {
            modulosSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="group bg-white/90 backdrop-blur-sm border-2 border-blue-400 text-blue-600 hover:bg-blue-400 hover:text-white px-6 py-3 rounded-xl font-bold text-sm shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
      >
        <span className="flex items-center gap-2">
          {t('hero.viewModules', language)}
          <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
    </div>
  );
};

export default FloatingButtons;
