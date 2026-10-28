import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

// Returns `override` merged over `base`: nested objects are merged key by key,
// everything else (strings, arrays) in `override` replaces the value in `base`.
function mergeMessages(base, override) {
    const result = { ...base };
    for (const [key, value] of Object.entries(override)) {
        const baseValue = base?.[key];
        const bothAreObjects =
            value && typeof value === 'object' && !Array.isArray(value) &&
            baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue);
        result[key] = bothAreObjects ? mergeMessages(baseValue, value) : value;
    }
    return result;
}

async function loadMessages(locale) {
    return (await import(`../messages/${locale}.json`)).default;
}

// Loads the messages for the current request's locale.
// Texts missing in a language file fall back to the default language, so an
// incomplete translation never shows raw keys. `npm run check:messages` lists such gaps.
export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    const defaultMessages = await loadMessages(routing.defaultLocale);
    const messages = locale === routing.defaultLocale
        ? defaultMessages
        : mergeMessages(defaultMessages, await loadMessages(locale));

    return { locale, messages };
});
