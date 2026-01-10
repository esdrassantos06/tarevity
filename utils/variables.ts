import { Locale } from 'next-intl';

export const isDevelopment = process.env.NODE_ENV !== 'production';

export function getOpenGraphLocale(locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    en: 'en_US',
    pt: 'pt_PT',
    es: 'es_ES',
  };
  return localeMap[locale] || 'en_US';
}
