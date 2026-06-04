import React, { createContext, useState, useEffect, useContext } from 'react';
import { translations } from '../locales/translations.js';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('eng');

  useEffect(() => {
    const cachedLocale = localStorage.getItem('caretrack_locale');
    if (cachedLocale && (cachedLocale === 'eng' || cachedLocale === 'rus' || cachedLocale === 'uzb')) {
      setLocale(cachedLocale);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (lang === 'eng' || lang === 'rus' || lang === 'uzb') {
      setLocale(lang);
      localStorage.setItem('caretrack_locale', lang);
    }
  };

  const t = (key) => {
    return translations[locale]?.[key] || translations['eng']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
