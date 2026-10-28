import { routing } from '@/i18n/routing';
import { localizedUrl } from '@/i18n/metadata';

// All indexable pages. Each is listed once per language, with hreflang alternates,
// so search engines learn about every language version directly from the sitemap.
const routes = ['/', '/starter', '/impressum', '/privacy'];

export default function sitemap() {
    return routes.flatMap((route) => {
        const languages = Object.fromEntries(routing.locales.map((locale) => [locale, localizedUrl(route, locale)]));
        languages['x-default'] = localizedUrl(route, routing.defaultLocale);

        return routing.locales.map((locale) => ({
            url: localizedUrl(route, locale),
            alternates: { languages },
        }));
    });
}
