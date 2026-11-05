import { getTranslations } from 'next-intl/server';
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

/**
 * Metadata for a page from config/pages.js: title and description from its `metadata`
 * namespace (`{name}` is the site name), canonical + hreflang links, Open Graph and Twitter card.
 * The layout's title template appends " | <site name>".
 *
 * Anything shaped like a page works too (`{ path, metadata, previewImage }`), e.g. a lab project page
 * with `metadata: 'Lab.projects.<id>'`. The link-preview image is chosen by `previewImage`:
 *   undefined            the site-wide image from config/site.js
 *   false                none here: the route has its own opengraph-image file (like /starter)
 *   '/images/x.png'      this image (path in public/ or a remote URL)
 *   { src, width, height }  the same, with its size
 */
export async function pageMetadata(locale, page) {
    const t = await getTranslations({ locale, namespace: page.metadata });
    const name = siteConfig.name;
    const title = t('title', { name });
    const description = t('description', { name });
    const ogImage = previewImage(page.previewImage);

    return {
        title,
        description,
        alternates: getAlternates(page.path, locale),
        openGraph: {
            title,
            description,
            url: localizedUrl(page.path, locale),
            siteName: name,
            locale: getOgLocale(locale),
            alternateLocale: getOgAlternateLocales(locale),
            type: 'website',
            ...(ogImage && { images: [ogImage] }),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            ...(ogImage && { images: [ogImage.url] }),
        },
    };
}

// The Open Graph image for a page's `previewImage` option (see pageMetadata), or undefined for none.
function previewImage(option) {
    if (option === false) return undefined;
    const { src, width, height } = typeof option === 'string' ? { src: option } : (option ?? siteConfig.assets.ogImage);
    return { url: src, ...(width && height && { width, height }) };
}
