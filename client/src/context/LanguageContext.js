import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  defaultLanguage,
  getLanguageCookieName,
  getLegacyLanguageCookieName
} from '../i18n/core';
import { getCookie, setCookie } from '../utils/cookies';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const readInitialLanguage = () => {
  const saved = getCookie(getLanguageCookieName()) || getCookie(getLegacyLanguageCookieName());
  if (saved === 'es' || saved === 'en') return saved;
  return defaultLanguage;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(readInitialLanguage);

  useEffect(() => {
    setCookie(getLanguageCookieName(), language, 365);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
