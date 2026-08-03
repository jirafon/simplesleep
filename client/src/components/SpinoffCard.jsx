import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

const SpinoffCard = ({ spinoff, onClick }) => {
  const { language } = useLanguage();
  
  return (
    <div 
      className="group relative bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 shadow-xl hover:shadow-2xl p-8 flex flex-col items-center hover:-translate-y-3 transition-all duration-500 ease-out overflow-hidden"
      data-aos="fade-up"
      data-aos-delay={spinoff.id * 100}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
      {/* Animated border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      {/* Logo container with enhanced styling */}
      <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110">
        {spinoff.logo ? (
          <img src={spinoff.logo} alt={spinoff.name} className="w-12 h-12 rounded-xl" />
        ) : (
          <span className="text-3xl text-white font-black group-hover:rotate-12 transition-transform duration-300">
            {spinoff.name[0]}
          </span>
        )}
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
      </div>
      {/* Content */}
      <div className="relative z-10 text-center">
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
          {spinoff.name}
        </h3>
        <p className="text-gray-300 mb-2 text-center font-medium leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
          {spinoff.tagline}
        </p>
        {/* Logo debajo del tagline si existe logo */}
        {spinoff.logo && (
          <div className="flex justify-center mb-4">
            <img src={spinoff.logo} alt={spinoff.name + ' logo'} className="w-16 h-16 rounded-xl shadow-lg" />
          </div>
        )}
        {/* Enhanced button */}
        <button 
          onClick={onClick} 
          className="group/btn relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            {t('modules.viewMore', language)}
            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        </button>
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

export default SpinoffCard; 