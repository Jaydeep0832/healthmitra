import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { LanguageCode, LanguageMeta, I18nContextType } from './types';
import { formatCurrencyLocale, formatNumberLocale, formatDateLocale } from './formatters';

import en from '../locales/en.json';
import gu from '../locales/gu.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';
import bn from '../locales/bn.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';

export const AVAILABLE_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', dir: 'ltr', flagEmoji: '🇬🇧' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', dir: 'ltr', flagEmoji: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', dir: 'ltr', flagEmoji: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', dir: 'ltr', flagEmoji: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', dir: 'ltr', flagEmoji: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', dir: 'ltr', flagEmoji: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', dir: 'ltr', flagEmoji: '🇮🇳' }
];

const TRANSLATION_MAP: Record<LanguageCode, any> = {
  en,
  gu,
  hi,
  mr,
  bn,
  ta,
  te
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'healthmitra_language';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (saved && AVAILABLE_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      // ignore
    }
  };

  const currentMeta = useMemo(() => {
    return AVAILABLE_LANGUAGES.find(l => l.code === language) || AVAILABLE_LANGUAGES[0];
  }, [language]);

  // Sync document lang and dir attributes for global CSS and typography
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentMeta.code;
      document.documentElement.dir = currentMeta.dir;
    }
  }, [currentMeta]);

  /**
   * Helper to look up nested translation key (e.g. 'nav.schemes')
   * with English fallback and variable interpolation.
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    const currentDict = TRANSLATION_MAP[language] || en;
    const fallbackDict = en;

    let value: any = currentDict;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    // Fallback to English if missing
    if (value === undefined || typeof value !== 'string') {
      let fbVal: any = fallbackDict;
      for (const k of keys) {
        if (fbVal && typeof fbVal === 'object' && k in fbVal) {
          fbVal = fbVal[k];
        } else {
          fbVal = undefined;
          break;
        }
      }
      value = typeof fbVal === 'string' ? fbVal : key;
    }

    // Interpolate params e.g. {name}
    if (params && typeof value === 'string') {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        value = value.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramVal));
      });
    }

    return typeof value === 'string' ? value : key;
  };

  const formatCurrency = (amount: number) => formatCurrencyLocale(amount, language);
  const formatNumber = (val: number) => formatNumberLocale(val, language);
  const formatDate = (d: string | Date, opts?: Intl.DateTimeFormatOptions) => formatDateLocale(d, language, opts);

  const contextValue: I18nContextType = {
    language,
    setLanguage,
    t,
    formatCurrency,
    formatNumber,
    formatDate,
    currentMeta,
    availableLanguages: AVAILABLE_LANGUAGES
  };

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
