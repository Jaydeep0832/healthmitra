import { LanguageCode } from './types';

const LOCALE_MAP: Record<LanguageCode, string> = {
  en: 'en-IN',
  gu: 'gu-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN'
};

/**
 * Format currency in Indian Rupees with correct commas and currency symbol.
 * Example: 500000 -> ₹5,00,000
 */
export function formatCurrencyLocale(amount: number, lang: LanguageCode): string {
  try {
    const locale = LOCALE_MAP[lang] || 'en-IN';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  } catch (e) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

/**
 * Format integer/decimal numbers per selected locale.
 */
export function formatNumberLocale(value: number, lang: LanguageCode): string {
  try {
    const locale = LOCALE_MAP[lang] || 'en-IN';
    return new Intl.NumberFormat(locale).format(value);
  } catch (e) {
    return value.toLocaleString('en-IN');
  }
}

/**
 * Format ISO dates (e.g. 2026-10-12) to friendly localized strings.
 */
export function formatDateLocale(
  dateInput: string | Date,
  lang: LanguageCode,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const locale = LOCALE_MAP[lang] || 'en-IN';
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    return new Intl.DateTimeFormat(locale, options || defaultOptions).format(date);
  } catch (e) {
    return String(dateInput);
  }
}
