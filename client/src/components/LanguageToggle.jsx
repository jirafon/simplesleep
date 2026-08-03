import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/core';

/**
 * Language selector — English default, Spanish available.
 * variant: light | dark | navbar | sleep
 */
const LanguageToggle = ({ className = '', variant = 'sleep' }) => {
  const { language, setLanguage } = useLanguage();

  const variants = {
    dark: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white',
    light: 'bg-gray-100 border border-gray-300 text-gray-800',
    navbar: 'bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-white',
    sleep: 'bg-white border border-slate-300 text-slate-800'
  };

  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      <span className="sr-only">Language</span>
      <select
        value={language === 'es' ? 'es' : 'en'}
        onChange={(e) => setLanguage(e.target.value)}
        className={`text-sm font-medium rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 ${variants[variant] || variants.sleep}`}
        aria-label="Language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.short} · {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageToggle;
