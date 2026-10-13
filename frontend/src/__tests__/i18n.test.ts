import { formatCurrencyLocale, formatNumberLocale, formatDateLocale } from '../i18n/formatters';
import en from '../locales/en.json';
import gu from '../locales/gu.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';
import bn from '../locales/bn.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';

describe('i18n Translation Dictionaries', () => {
  it('all 7 supported language dictionaries load and have basic structure', () => {
    const dictionaries = [en, gu, hi, mr, bn, ta, te];
    dictionaries.forEach((dict) => {
      expect(dict.brand).toBeDefined();
      expect(dict.nav).toBeDefined();
      expect(dict.schemes).toBeDefined();
      expect(dict.common).toBeDefined();
    });
  });

  it('verifies essential navigation keys in Gujarati and Hindi', () => {
    expect(gu.nav.schemes).toBe('સરકારી યોજનાઓ અને લાભ');
    expect(gu.nav.emergency_sos).toBe('કટોકટી SOS');
    expect(hi.nav.schemes).toBe('सरकारी योजनाएं और लाभ');
    expect(hi.nav.home).toBe('होम');
  });

  it('verifies schemes categories keys exist in all locales', () => {
    const locales = [en, gu, hi, mr, bn, ta, te];
    locales.forEach((loc) => {
      expect(loc.schemes.categories.all).toBeDefined();
      expect(loc.schemes.categories.operations_surgery).toBeDefined();
      expect(loc.schemes.categories.critical_illness).toBeDefined();
      expect(loc.schemes.categories.hospitalization).toBeDefined();
      expect(loc.schemes.categories.medicines_diagnostics).toBeDefined();
      expect(loc.schemes.categories.maternity_child).toBeDefined();
    });
  });
});

describe('Locale Formatters', () => {
  it('formats currency in Indian Rupees format', () => {
    const formatted = formatCurrencyLocale(500000, 'en');
    // Expect ₹5,00,000 (Indian number grouping: 5,00,000)
    expect(formatted).toContain('5,00,000');
    expect(formatted).toContain('₹');
  });

  it('formats large scheme sums correctly', () => {
    const formattedTenLakh = formatCurrencyLocale(1000000, 'en');
    expect(formattedTenLakh).toContain('10,00,000');
  });

  it('formats numbers correctly', () => {
    const formatted = formatNumberLocale(12345, 'en');
    expect(formatted).toBe('12,345');
  });

  it('formats ISO dates without crashing', () => {
    const formatted = formatDateLocale('2026-10-12', 'en');
    expect(formatted).toBeDefined();
    expect(formatted.length).toBeGreaterThan(0);
  });
});
