import { defineRouting } from 'next-intl/routing';

// Language setup for the whole site.
// To add a language: add its code to `locales`, its display name to `localeNames`,
// and create `messages/<code>.json`. No component changes needed.
export const locales = ['en', 'de'];
export const defaultLocale = 'en';

// Shown in the language switcher.
export const localeNames = {
    en: 'English',
    de: 'Deutsch',
};

export const routing = defineRouting({
    locales,
    defaultLocale,

    // The default language has no prefix in the URL (/, /starter),
    // all other languages do (/de, /de/starter).
    localePrefix: 'as-needed',

    // The language is determined by the URL only: no cookie is set and the
    // browser's Accept-Language header is ignored, so no cookie consent is needed.
    localeCookie: false,
    localeDetection: false,

    // hreflang links are emitted via page metadata instead of a response header,
    // so there is a single source of truth that uses `siteConfig.url`.
    alternateLinks: false,
});
