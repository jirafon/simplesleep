import { useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from './core';

/** Hook bound to current language from LanguageProvider */
export const useT = () => {
  const { language } = useLanguage();
  return useCallback((key, vars) => t(key, language, vars), [language]);
};
