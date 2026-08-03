import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import LanguageToggle from './LanguageToggle';

const Navbar = ({ onOpenDemo }) => {
  const [nav, setNav] = useState(false);
  const { language } = useLanguage();

  const handleNav = () => setNav(!nav);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setNav(false);
  };

  const handleDemoClick = () => {
    if (onOpenDemo) {
      onOpenDemo();
    }
    setNav(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-transparent">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link to="/" className="flex items-center cursor-pointer group" data-aos="fade-right" data-aos-delay="100">
          <img src="/unbiax16.ico" alt="Unbiax Solutions" className="w-[117px] h-[83px] group-hover:scale-110 transition-transform duration-300" />
          </Link>

        <ul className="hidden md:flex space-x-8 font-semibold transition-colors duration-300 text-white">
          <li data-aos="fade-down" data-aos-delay="200">
            <Link 
              to="/"
              className="cursor-pointer hover:text-blue-400 transition-all duration-300 relative group inline-block"
            >
              {t('nav.home', language)}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></div>
            </Link>
          </li>

          {/* Soluciones dropdown */}
          <li className="relative group" data-aos="fade-down" data-aos-delay="300">
            <span className="cursor-pointer hover:text-blue-400 transition-all duration-300 inline-block">
              {t('nav.startups', language)}
            </span>
            <div className="absolute left-0 mt-2 hidden group-hover:block">
              <div className="bg-black/80 backdrop-blur-md text-white rounded-xl shadow-lg border border-white/20 py-2 min-w-[200px]">
                <Link to="/smartrisk" className="block px-4 py-2 hover:bg-white/10 transition-colors">Smartrisk</Link>
                <Link to="/privax" className="block px-4 py-2 hover:bg-white/10 transition-colors">Privax</Link>
                <Link to="/automatix" className="block px-4 py-2 hover:bg-white/10 transition-colors">Automatix</Link>
                <Link to="/enterprise-process-intelligence" className="block px-4 py-2 hover:bg-white/10 transition-colors">{t('nav.epiService', language)}</Link>
              </div>
            </div>
          </li>

          {/* Industrias dropdown */}
          <li className="relative group" data-aos="fade-down" data-aos-delay="400">
            <span className="cursor-pointer hover:text-blue-400 transition-all duration-300 inline-block">
              {t('nav.industrias', language)}
            </span>
            <div className="absolute left-0 mt-2 hidden group-hover:block">
              <div className="bg-black/80 backdrop-blur-md text-white rounded-xl shadow-lg border border-white/20 py-2 min-w-[200px]">
                <Link to="/mining-industry" className="block px-4 py-2 hover:bg-white/10 transition-colors">{t('nav.mineria', language)}</Link>
                <Link to="/mineria" className="block px-4 py-2 hover:bg-white/10 transition-colors">{t('nav.construccionMineria', language)}</Link>
                <Link to="/logistics-distribution" className="block px-4 py-2 hover:bg-white/10 transition-colors">{t('nav.logisticsDistribution', language)}</Link>
                <Link to="/healthcare" className="block px-4 py-2 hover:bg-white/10 transition-colors">{t('nav.healthcare', language)}</Link>
              </div>
            </div>
          </li>

          <li data-aos="fade-down" data-aos-delay="500">
                <Link 
              to="/ai-peer"
                  className="cursor-pointer hover:text-blue-400 transition-all duration-300 relative group inline-block"
                >
              {t('nav.aiPeer', language)}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></div>
                </Link>
              </li>
          <li data-aos="fade-down" data-aos-delay="600">
            <Link 
              to="/ia-responsable"
              className="cursor-pointer hover:text-blue-400 transition-all duration-300 relative group inline-block"
            >
              {t('nav.responsibleAI', language)}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></div>
            </Link>
              </li>
        </ul>
        
        <div className="flex items-center gap-4">
          <LanguageToggle 
            className="hidden md:flex" 
            variant="navbar" 
          />
          <button 
            className={`hidden md:block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group`}
            onClick={handleDemoClick}
            data-aos="fade-left"
            data-aos-delay="600"
          >
            <span className="flex items-center gap-2">
              {t('nav.requestDemo', language)}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          
          <div className="md:hidden flex items-center">
            <button 
              onClick={handleNav} 
              className="text-2xl focus:outline-none transition-colors duration-300 text-white"
            >
              {nav ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      {nav && (
        <div className="md:hidden bg-black/80 backdrop-blur-md shadow-lg border-t border-white/20">
          <ul className="px-6 py-6 space-y-4 text-white font-semibold">
            {[
              { name: t('nav.home', language), route: '/', isRoute: true },
              { name: t('nav.aiPeer', language), route: '/ai-peer', isRoute: true },
              { name: t('nav.responsibleAI', language), route: '/ia-responsable', isRoute: true }
            ].map((item) => (
              item.isRoute ? (
                <li key={item.name}>
                  <Link 
                    to={item.route}
                    className="block cursor-pointer hover:text-blue-400 transition-colors duration-300 py-2 border-b border-white/30"
                    onClick={() => setNav(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ) : (
                <li 
                  key={item.name}
                  className="cursor-pointer hover:text-blue-400 transition-colors duration-300 py-2 border-b border-white/30 last:border-b-0"
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.name}
                </li>
              )
            ))}
            {/* Mobile Soluciones list */}
            <li className="pt-2 border-t border-white/30">
              <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">{t('nav.startups', language)}</div>
              <Link to="/smartrisk" className="block py-2 hover:text-blue-400 transition-colors" onClick={() => setNav(false)}>Smartrisk</Link>
              <Link to="/privax" className="block py-2 hover:text-blue-400 transition-colors" onClick={() => setNav(false)}>Privax</Link>
              <Link to="/automatix" className="block py-2 hover:text-blue-400 transition-colors" onClick={() => setNav(false)}>Automatix</Link>
              <Link to="/enterprise-process-intelligence" className="block py-2 hover:text-blue-400 transition-colors" onClick={() => setNav(false)}>{t('nav.epiService', language)}</Link>
            </li>
            {/* Mobile Industrias list */}
            <li className="pt-2 border-t border-white/30">
              <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">{t('nav.industrias', language)}</div>
              <Link to="/mining-industry" className="block py-2 hover:text-blue-400 transition-colors" onClick={() => setNav(false)}>{t('nav.mineria', language)}</Link>
              <Link to="/mineria" className="block py-2 hover:text-blue-400 transition-colors" onClick={() => setNav(false)}>{t('nav.construccionMineria', language)}</Link>
              <Link to="/logistics-distribution" className="block py-2 hover:text-blue-400 transition-colors" onClick={() => setNav(false)}>{t('nav.logisticsDistribution', language)}</Link>
              <Link to="/healthcare" className="block py-2 hover:text-blue-400 transition-colors" onClick={() => setNav(false)}>{t('nav.healthcare', language)}</Link>
            </li>
            <li className="pt-4 flex justify-center">
              <LanguageToggle variant="navbar" />
            </li>
            <li className="pt-4">
              <button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={handleDemoClick}
              >
                {t('nav.requestDemo', language)}
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
