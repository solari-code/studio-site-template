/**
 * Input validators for the setup assistant. Each returns `undefined` when the value is fine and an
 * error message otherwise (the convention @clack/prompts uses for `validate`), so a wrong value is
 * reported right away and the question is asked again.
 *
 *   text({ message: 'Primary colour', validate: hexColor })
 *   text({ message: 'WhatsApp number', validate: optional(whatsappNumber) })
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

const trimmed = (value) => (value ?? '').trim();

// Combines validators: the first message wins.
export const all = (...validators) => (value) => {
    for (const validate of validators) {
        const message = validate(value);
        if (message) return message;
    }
    return undefined;
};

// Lets an empty answer through (e.g. "leave empty to hide the button").
export const optional = (validate) => (value) => (trimmed(value) === '' ? undefined : validate(value));

export const required = (value) => (trimmed(value) === '' ? 'Please enter a value.' : undefined);

// '#rgb' or '#rrggbb'
export const hexColor = (value) => (
    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed(value)) ? undefined : 'Enter a hex colour like #0D1117 or #fff.'
);

// Absolute http(s) URL, e.g. the site URL or a social profile.
export const absoluteUrl = (value) => {
    const v = trimmed(value);
    if (!/^https?:\/\//i.test(v)) return 'Enter an absolute URL starting with https:// (or http://).';
    try {
        const url = new URL(v);
        if (!url.hostname.includes('.') && url.hostname !== 'localhost') return 'The URL needs a host name like example.com.';
        return undefined;
    } catch {
        return 'That is not a valid URL.';
    }
};

// The site's own URL: absolute, without path, query or hash (it is the base for every canonical URL).
export const siteUrl = all(absoluteUrl, (value) => {
    const url = new URL(trimmed(value));
    if (url.pathname !== '/' || url.search || url.hash) return 'Enter only the origin, e.g. https://example.com (no path).';
    return undefined;
});

export const email = (value) => (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed(value)) ? undefined : 'Enter an email address like hello@example.com.'
);

// Display form of a phone number: digits, optionally with +, spaces, dashes, dots, slashes and parentheses.
export const phone = (value) => {
    const v = trimmed(value);
    if (!/^\+?[\d\s().\-/]+$/.test(v)) return 'Use digits, spaces and + only, e.g. +49 30 1234567.';
    if (v.replace(/\D/g, '').length < 5) return 'That looks too short for a phone number.';
    return undefined;
};

// WhatsApp link number: country code and digits only (no +, spaces or leading zeros), e.g. 491701234567.
export const whatsappNumber = (value) => {
    const v = trimmed(value);
    if (!/^\d+$/.test(v)) return 'Digits only, with the country code and no + or spaces, e.g. 491701234567.';
    if (v.startsWith('0')) return 'Start with the country code (no leading 0), e.g. 491701234567.';
    if (v.length < 7 || v.length > 15) return 'A WhatsApp number has 7 to 15 digits including the country code.';
    return undefined;
};

// Language code as used in i18n/routing.js and the URL: 'en', 'de', 'pt-BR', …
export const localeCode = (value) => {
    const v = trimmed(value);
    if (!/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(v)) return 'Enter a language code like en, de or pt-BR.';
    try {
        new Intl.Locale(v);
        return undefined;
    } catch {
        return `"${v}" is not a valid language code.`;
    }
};

// Path of a file under public/, written as it is used in the config: '/images/hero/poster.jpg'.
export const publicPath = (root) => (value) => {
    const v = trimmed(value);
    if (!v.startsWith('/')) return 'Enter a path starting with /, relative to public/ (e.g. /images/about/me.jpg).';
    if (v.includes('..')) return 'The path must stay inside public/.';
    if (!existsSync(path.join(root, 'public', v))) return `public${v} does not exist. Add the file first, or keep the placeholder for now.`;
    return undefined;
};

// Same-page anchor for CTA buttons: '#contact'
export const anchor = (value) => (
    /^#[a-z][a-z0-9-]*$/i.test(trimmed(value)) ? undefined : 'Enter an anchor like #contact.'
);

// Identifiers used as section ids, message keys and icon names: lowercase, digits and dashes.
export const slug = (value) => (
    /^[a-z][a-z0-9-]*$/.test(trimmed(value)) ? undefined : 'Use lowercase letters, digits and dashes, starting with a letter (e.g. web-design).'
);

// Human-readable names: site name, social labels, language names.
export const displayName = all(required, (value) => (
    trimmed(value).length > 80 ? 'Please keep it under 80 characters.' : undefined
));

export const genericFontFamily = (value) => (
    ['sans-serif', 'serif', 'monospace', 'system-ui'].includes(trimmed(value)) ? undefined : 'Use sans-serif, serif, monospace or system-ui.'
);

// A number between min and max (inclusive), e.g. the overlay opacity or a shade amount.
export const numberBetween = (min, max) => (value) => {
    const n = Number(trimmed(value));
    if (trimmed(value) === '' || Number.isNaN(n)) return 'Enter a number.';
    if (n < min || n > max) return `Enter a number between ${min} and ${max}.`;
    return undefined;
};

// One of a fixed set of values, for free-text prompts that expect a token or a mode.
export const oneOf = (values, label = 'value') => (value) => (
    values.includes(trimmed(value)) ? undefined : `Enter a ${label}: ${values.join(', ')}.`
);
