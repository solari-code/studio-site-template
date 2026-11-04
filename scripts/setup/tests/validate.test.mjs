import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as v from '../validate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const ok = (validate, values) => { for (const value of values) assert.equal(validate(value), undefined, `expected "${value}" to be valid`); };
const bad = (validate, values) => { for (const value of values) assert.equal(typeof validate(value), 'string', `expected "${value}" to be rejected`); };

test('hexColor', () => {
    ok(v.hexColor, ['#fff', '#0D1117', '#abcdef', ' #FFF ']);
    bad(v.hexColor, ['fff', '#ffff', '#ggg', '#12345', 'red', '', 'rgb(0,0,0)']);
});

test('absoluteUrl and siteUrl', () => {
    ok(v.absoluteUrl, ['https://example.com', 'http://example.com/path?x=1', 'https://www.linkedin.com/in/x']);
    bad(v.absoluteUrl, ['example.com', 'ftp://x.com', 'https://', 'https://nodot', '']);
    ok(v.siteUrl, ['https://example.com', 'https://example.com/', 'https://sub.example.co.uk']);
    bad(v.siteUrl, ['https://example.com/starter', 'https://example.com/?a=1', 'https://example.com/#x', 'example.com']);
});

test('email', () => {
    ok(v.email, ['hello@example.com', 'a.b+c@sub.example.org']);
    bad(v.email, ['hello', 'hello@', '@example.com', 'hello@example', 'a b@example.com', '']);
});

test('phone and whatsappNumber', () => {
    ok(v.phone, ['+49 000 0000000', '030 123456', '+1 (555) 123-4567', '0170/1234567']);
    bad(v.phone, ['call me', '+49 12', '123', '', 'tel:12345678']);
    ok(v.whatsappNumber, ['490000000000', '1234567']);
    bad(v.whatsappNumber, ['+490000000000', '0170 1234567', '0490000000000', '123456', '1234567890123456', 'abc', '']);
    ok(v.optional(v.whatsappNumber), ['', '  ', '491701234567']);
    bad(v.optional(v.whatsappNumber), ['+49']);
});

test('localeCode', () => {
    ok(v.localeCode, ['en', 'de', 'fr', 'pt-BR', 'zh-Hant', 'ast']);
    bad(v.localeCode, ['EN', 'english', 'e', 'de_DE', '', 'en-', 'x1']);
});

test('publicPath checks the file exists under public/', () => {
    const validate = v.publicPath(root);
    ok(validate, ['/og-image-2.png', '/images/about/portrait-placeholder.jpg', '/favicon/favicon.ico']);
    bad(validate, ['og-image-2.png', '/does-not-exist.png', '/../package.json', '']);
});

test('anchor, slug, displayName, genericFontFamily', () => {
    ok(v.anchor, ['#contact', '#intro', '#section-2']);
    bad(v.anchor, ['contact', '#', '#2', '/#contact', '']);
    ok(v.slug, ['services', 'web-design', 'faq2']);
    bad(v.slug, ['Services', 'web design', '-x', '2fa', '', 'on_brand']);
    ok(v.displayName, ['Nova Studio', 'X']);
    bad(v.displayName, ['', '   ', 'x'.repeat(81)]);
    ok(v.genericFontFamily, ['sans-serif', 'serif', 'monospace', 'system-ui']);
    bad(v.genericFontFamily, ['cursive', 'Inter', '']);
});

test('numberBetween, oneOf, required, all', () => {
    ok(v.numberBetween(0, 1), ['0', '0.5', '1', ' 0.04 ']);
    bad(v.numberBetween(0, 1), ['-0.1', '1.1', 'abc', '']);
    ok(v.oneOf(['dark', 'light']), ['dark', 'light']);
    bad(v.oneOf(['dark', 'light']), ['system', '']);
    bad(v.required, ['', '   ']);
    ok(v.required, ['x']);
    const combined = v.all(v.required, v.hexColor);
    assert.equal(combined(''), v.required(''));
    assert.equal(combined('zzz'), v.hexColor('zzz'));
    assert.equal(combined('#fff'), undefined);
});
