import { routing } from './routing';
import { getPathname } from './navigation';
import { siteConfig } from '@/config/site';

// Absolute URL of a path in a given language, e.g. ('/starter', 'de') -> https://example.com/de/starter
export function localizedUrl(pathname, locale) {
    return new URL(getPathname({ href: pathname, locale }), siteConfig.url).toString();
}

// Canonical + hreflang links for one page. Generated from the locale list, so new
// languages are covered automatically. `x-default` points to the default language.
export function getAlternates(pathname, locale) {
    const languages = Object.fromEntries(
        routing.locales.map((code) => [code, localizedUrl(pathname, code)])
    );
    languages['x-default'] = localizedUrl(pathname, routing.defaultLocale);

    return {
        canonical: localizedUrl(pathname, locale),
        languages,
    };
}

// Open Graph locale in the `ll_CC` form (en -> en_US, de -> de_DE), derived from the language code.
export function getOgLocale(locale) {
    try {
        const { language, region } = new Intl.Locale(locale).maximize();
        return region ? `${language}_${region}` : language;
    } catch {
        return locale;
    }
}

export function getOgAlternateLocales(locale) {
    return routing.locales.filter((code) => code !== locale).map(getOgLocale);
}
