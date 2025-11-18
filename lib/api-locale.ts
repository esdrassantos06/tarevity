import { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';

/**
 * Extracts the locale from the request Accept-Language header.
 * Returns the default locale if no valid locale is found.
 * Follows the next-intl documentation pattern for Route Handlers.
 */
export function getLocaleFromRequest(req: NextRequest): string {
  const acceptLanguage = req.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,pt;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const [locale, q = 'q=1'] = lang.trim().split(';');
        const quality = parseFloat(q.replace('q=', ''));
        return { locale: locale.toLowerCase().split('-')[0], quality };
      })
      .sort((a, b) => b.quality - a.quality);

    // Find the first supported locale
    for (const { locale } of languages) {
      if (hasLocale(routing.locales, locale)) {
        return locale;
      }
    }
  }

  // Fall back to default locale
  return routing.defaultLocale;
}
