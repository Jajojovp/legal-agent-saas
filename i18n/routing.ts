import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // Only add /es/ prefix for non-default locale
});

export type Locale = (typeof routing.locales)[number];
