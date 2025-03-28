import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'pt-br'],
  defaultLocale: 'en',
  localeDetection: true,
  localePrefix: 'always',
})
