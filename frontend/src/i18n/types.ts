export type LanguageCode = 'en' | 'gu' | 'hi' | 'mr' | 'bn' | 'ta' | 'te';

export type TextDirection = 'ltr' | 'rtl';

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: string;
  dir: TextDirection;
  flagEmoji: string;
}

export interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (value: number) => string;
  formatDate: (dateString: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  currentMeta: LanguageMeta;
  availableLanguages: LanguageMeta[];
}
