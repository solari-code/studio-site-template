import { routing } from '@/i18n/routing';
import { localizedUrl } from '@/i18n/metadata';
import { enabledPages, pages } from '@/config/pages';
import { labProjectsWithPage, labProjectPath } from '@/config/lab';

// All enabled pages from config/pages.js, and after /lab the lab's project pages (config/lab.js).
// Each is listed once per language, with hreflang alternates, so search engines learn about every
// language version directly from the sitemap. (A project page whose markdown isn't translated yet
// shows the default language's text under its own URL, just like untranslated messages.)
const routes = enabledPages().flatMap((page) => (page === pages.lab ? [page.path, ...labProjectsWithPage().map(labProjectPath)] : [page.path]));

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
