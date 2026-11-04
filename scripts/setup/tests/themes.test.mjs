import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { themes, fontFamilies, matchTheme, paletteComments } from '../themes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const { theme, hexToRgb, mix } = await import(pathToFileURL(path.join(root, 'config/theme.js')).href);

const HEX = /^#[0-9a-f]{6}$/i;
const BASE_TOKENS = ['background', 'foreground', 'contrast', 'primary', 'accent', 'secondary', 'tertiary', 'on-brand', 'success', 'error', 'whatsapp'];

// WCAG contrast ratio between two hex colours.
function contrast(a, b) {
    const luminance = (hex) => {
        const { r, g, b: bl } = hexToRgb(hex);
        const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
    };
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

// Base colours plus the derived shades, with the template's shade rules (config/theme.js).
function resolve(palette) {
    const resolved = { ...palette };
    for (const [name, shade] of Object.entries(theme.shades)) {
        if (resolved[name]) continue;
        resolved[name] = mix(resolved[shade.base], shade.mix.startsWith('#') ? shade.mix : resolved[shade.mix], shade.amount);
    }
    return resolved;
}

describe('theme presets', () => {
    test('"nova" is the current template theme, so "keep the current look" is a real choice', () => {
        assert.deepEqual(themes.nova.colors, theme.colors);
        assert.deepEqual(themes.nova.colorMode, theme.colorMode);
        assert.deepEqual(themes.nova.gradients, theme.gradients);
        assert.deepEqual(themes.nova.scrollGradient, theme.scrollGradient);
        assert.equal(matchTheme(theme), 'nova');
        assert.equal(matchTheme(theme, { body: 'inter', heading: 'inter' }), 'nova');
        assert.equal(matchTheme(theme, { body: 'inter', heading: 'lora' }), undefined);
        assert.equal(matchTheme({ ...theme, colorMode: { default: 'dark', toggle: false } }), undefined);
    });

    test('every theme is complete and consistent', () => {
        for (const [id, preset] of Object.entries(themes)) {
            assert.ok(preset.name && preset.description, `${id}: name and description`);
            assert.deepEqual(Object.keys(preset.colors), ['dark', 'light'], `${id}: both palettes`);
            for (const mode of ['dark', 'light']) {
                const palette = preset.colors[mode];
                for (const token of BASE_TOKENS) assert.ok(palette[token], `${id}.${mode}: base token "${token}"`);
                for (const [token, value] of Object.entries(palette)) {
                    assert.match(value, HEX, `${id}.${mode}.${token}: six-digit hex`);
                    assert.ok(BASE_TOKENS.includes(token) || theme.shades[token], `${id}.${mode}.${token}: a base token or a pinned shade`);
                }
            }
            for (const token of ['muted-strong', 'surface-deep']) assert.ok(preset.colors.light[token], `${id}: light palette pins "${token}"`);
            for (const [name, stops] of Object.entries(preset.gradients)) {
                assert.ok(stops.length >= 2, `${id}: gradient "${name}" has two stops`);
                for (const stop of stops) assert.ok(BASE_TOKENS.includes(stop), `${id}: gradient "${name}" uses base tokens`);
            }
            for (const role of ['from', 'to']) assert.ok(preset.gradients[preset.scrollGradient[role]], `${id}: scrollGradient.${role}`);
            assert.ok(['system', 'dark', 'light'].includes(preset.colorMode.default), `${id}: colorMode.default`);
            assert.equal(typeof preset.colorMode.toggle, 'boolean', `${id}: colorMode.toggle`);
            for (const role of ['body', 'heading']) assert.ok(fontFamilies[preset.fonts[role]], `${id}: font "${preset.fonts[role]}" for ${role}`);
        }
    });

    test('every theme is readable: text, brand colours and button labels have enough contrast', () => {
        for (const [id, preset] of Object.entries(themes)) {
            for (const mode of ['dark', 'light']) {
                const c = resolve(preset.colors[mode]);
                const atLeast = (a, b, min, what) => assert.ok(contrast(c[a], c[b]) >= min, `${id}.${mode}: ${what} (${a} on ${b}) is ${contrast(c[a], c[b]).toFixed(1)}, needs ${min}`);
                atLeast('foreground', 'background', 7, 'body text');
                atLeast('contrast', 'background', 7, 'headings');
                atLeast('foreground', 'surface', 7, 'text on cards');
                atLeast('muted', 'background', 4.5, 'secondary text');
                atLeast('muted-strong', 'background', 3, 'labels');
                atLeast('contrast', 'surface-deep', 7, 'text on the pricing card');
                for (const token of ['primary', 'accent', 'secondary', 'tertiary', 'error', 'success']) atLeast(token, 'background', 3, `${token} elements`);
                atLeast('on-brand', 'primary', 3, 'button labels');
                if (id !== 'nova') atLeast('on-brand', 'accent', 3, 'button labels at the gradient end'); // the template default is what it is
            }
        }
    });

    test('the bundled font files exist and carry a weight range and fallback', async () => {
        for (const [id, font] of Object.entries(fontFamilies)) {
            await assert.doesNotReject(access(path.join(root, 'app/fonts', font.file)), `${id}: app/fonts/${font.file}`);
            assert.match(font.weight, /^\d+ \d+$/, `${id}: weight range`);
            assert.ok(['sans-serif', 'serif'].includes(font.fallback), `${id}: fallback`);
        }
    });

    test('palette comments only name base tokens', () => {
        for (const token of Object.keys(paletteComments)) assert.ok(BASE_TOKENS.includes(token), token);
    });
});
