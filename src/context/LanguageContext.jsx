import React, { createContext, useContext, useState, useEffect } from 'react';
import thTranslations from '../i18n/th.json';
import enTranslations from '../i18n/en.json';
import zhTranslations from '../i18n/zh.json';
import provincesData from '../data/provinces.json';
import categoriesData from '../data/categories.json';

const LanguageContext = createContext(null);

const translations = {
  th: thTranslations,
  en: enTranslations,
  zh: zhTranslations,
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('thai_trip_lang') || 'th';
  });

  const setLang = (newLang) => {
    if (['th', 'en', 'zh'].includes(newLang)) {
      setLangState(newLang);
      localStorage.setItem('thai_trip_lang', newLang);
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Translate nested keys: t("nav.home") or t("discover.foundResults", { count: 5 })
  const t = (keyPath, params = {}) => {
    const keys = keyPath.split('.');
    let current = translations[lang] || translations.en;

    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        // Fallback to English
        let fallback = translations.en;
        for (const fbKey of keys) {
          if (fallback && fallback[fbKey] !== undefined) {
            fallback = fallback[fbKey];
          } else {
            fallback = keyPath;
            break;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current === 'string') {
      let text = current;
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), params[paramKey]);
      });
      return text;
    }

    return current || keyPath;
  };

  // Helper to extract localized string from { th: "...", en: "...", zh: "..." }
  const getLocalized = (fieldObj) => {
    if (!fieldObj) return '';
    if (typeof fieldObj === 'string') return fieldObj;
    return fieldObj[lang] || fieldObj.en || fieldObj.th || Object.values(fieldObj)[0] || '';
  };

  // Helper to get localized province name
  const getProvinceName = (provinceId) => {
    const prov = provincesData.find((p) => p.id === provinceId);
    if (!prov) return provinceId;
    return getLocalized(prov.name);
  };

  // Helper to get localized category name
  const getCategoryName = (categoryId) => {
    const cat = categoriesData.find((c) => c.id === categoryId);
    if (!cat) return categoryId;
    return getLocalized(cat.name);
  };

  // Helper to get localized region name
  const getRegionName = (regionId) => {
    return t(`regions.${regionId}`) || regionId;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        getLocalized,
        getProvinceName,
        getCategoryName,
        getRegionName,
        provincesData,
        categoriesData,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
