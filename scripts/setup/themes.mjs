/**
 * Example themes for the setup assistant. Each is a complete set of values for config/theme.js
 * (both palettes, gradients, colour-mode setup, font roles) plus the fonts to load in
 * config/fonts.js. The assistant writes the chosen theme into those files; the site itself only
 * ever reads config/theme.js, so a theme is a starting point you can edit there afterwards.
 *
 * Every palette defines the same base tokens as the template (see config/theme.js for what each
 * one is used for). Light palettes pin `muted-strong` and `surface-deep`, as the template does,
 * because the derived values don't work on light backgrounds.
 */
import { deepEqual } from './source.mjs';

// The fonts bundled in app/fonts/ (variable, Latin subset, SIL OFL), by id.
export const fontFamilies = {
    inter: { name: 'Inter', file: 'InterVariable-latin.woff2', weight: '100 900', fallback: 'sans-serif', hint: 'neutral sans, the template default' },
    manrope: { name: 'Manrope', file: 'ManropeVariable-latin.woff2', weight: '200 800', fallback: 'sans-serif', hint: 'geometric sans, friendly' },
    'dm-sans': { name: 'DM Sans', file: 'DMSansVariable-latin.woff2', weight: '100 1000', fallback: 'sans-serif', hint: 'low-contrast sans, clean' },
    fraunces: { name: 'Fraunces', file: 'FrauncesVariable-latin.woff2', weight: '100 900', fallback: 'serif', hint: 'soft serif with character, for headings' },
    lora: { name: 'Lora', file: 'LoraVariable-latin.woff2', weight: '400 700', fallback: 'serif', hint: 'calm serif, for headings' },
};

// Gradients are defined by role, so they read the same in every theme; the colours come from the palette.
const gradients = {
    highlight: ['secondary', 'tertiary'],
    'highlight-alt': ['primary', 'accent'],
    'highlight-mix': ['secondary', 'accent'],
    brand: ['secondary', 'primary'],
    cta: ['primary', 'accent'],
    'cta-animated': ['primary', 'accent', 'primary'],
    'card-glow': ['accent', 'tertiary'],
};
const scrollGradient = { from: 'highlight', to: 'highlight-alt' };

export const themes = {
    nova: {
        name: 'Nova',
        description: 'The template default: near-black and white, electric blue, cyan and magenta. Inter.',
        colorMode: { default: 'system', toggle: true },
        fonts: { body: 'inter', heading: 'inter' },
        gradients,
        scrollGradient,
        colors: {
            dark: {
                background: '#0D1117', foreground: '#E6EDF3', contrast: '#ffffff',
                primary: '#3081F7', accent: '#22d3ee', secondary: '#D946EF', tertiary: '#ec4899', 'on-brand': '#ffffff',
                success: '#4ade80', error: '#f87171', whatsapp: '#25D366',
            },
            light: {
                background: '#ffffff', foreground: '#111827', contrast: '#0b0f17',
                primary: '#2563eb', accent: '#0891b2', secondary: '#c026d3', tertiary: '#db2777', 'on-brand': '#ffffff',
                success: '#16a34a', error: '#dc2626', whatsapp: '#25D366',
                'muted-strong': '#80858e', 'surface-deep': '#f3f4f6',
            },
        },
    },

    editorial: {
        name: 'Editorial',
        description: 'Warm paper and ink, terracotta, amber and a touch of rose. Fraunces headings, Inter body. Light first.',
        colorMode: { default: 'light', toggle: true },
        fonts: { body: 'inter', heading: 'fraunces' },
        gradients,
        scrollGradient,
        colors: {
            dark: {
                background: '#1c1917', foreground: '#e7e5e4', contrast: '#ffffff',
                primary: '#fb923c', accent: '#fbbf24', secondary: '#fb7185', tertiary: '#fdba74', 'on-brand': '#1c1917',
                success: '#4ade80', error: '#f87171', whatsapp: '#25D366',
            },
            light: {
                background: '#faf7f2', foreground: '#1f1c1a', contrast: '#12100f',
                primary: '#c2410c', accent: '#a16207', secondary: '#9f1239', tertiary: '#ea580c', 'on-brand': '#ffffff',
                success: '#15803d', error: '#b91c1c', whatsapp: '#25D366',
                muted: '#6b645e', 'muted-strong': '#857f78', 'surface-deep': '#f0ebe3',
            },
        },
    },

    atelier: {
        name: 'Atelier',
        description: 'Near-monochrome with a single emerald accent, lots of white space. Lora headings, DM Sans body. Light first.',
        colorMode: { default: 'light', toggle: true },
        fonts: { body: 'dm-sans', heading: 'lora' },
        gradients,
        scrollGradient,
        colors: {
            dark: {
                background: '#09090b', foreground: '#e4e4e7', contrast: '#ffffff',
                primary: '#34d399', accent: '#6ee7b7', secondary: '#34d399', tertiary: '#5eead4', 'on-brand': '#09090b',
                success: '#4ade80', error: '#f87171', whatsapp: '#25D366',
            },
            light: {
                background: '#ffffff', foreground: '#18181b', contrast: '#09090b',
                primary: '#047857', accent: '#059669', secondary: '#065f46', tertiary: '#0d9488', 'on-brand': '#ffffff',
                success: '#16a34a', error: '#dc2626', whatsapp: '#25D366',
                'muted-strong': '#84848c', 'surface-deep': '#f4f4f5',
            },
        },
    },

    dusk: {
        name: 'Dusk',
        description: 'Deep violet night, indigo, coral and pink. Manrope. Dark first.',
        colorMode: { default: 'dark', toggle: true },
        fonts: { body: 'manrope', heading: 'manrope' },
        gradients,
        scrollGradient,
        colors: {
            dark: {
                background: '#0f0a1e', foreground: '#e9e4f5', contrast: '#ffffff',
                primary: '#818cf8', accent: '#fb7185', secondary: '#c084fc', tertiary: '#f9a8d4', 'on-brand': '#0f0a1e',
                success: '#4ade80', error: '#f87171', whatsapp: '#25D366',
            },
            light: {
                background: '#fbfaff', foreground: '#171428', contrast: '#0f0a1e',
                primary: '#4f46e5', accent: '#e11d48', secondary: '#7c3aed', tertiary: '#db2777', 'on-brand': '#ffffff',
                success: '#16a34a', error: '#dc2626', whatsapp: '#25D366',
                'muted-strong': '#7f7a94', 'surface-deep': '#f1eefb',
            },
        },
    },
};

// Comments written next to the tokens when the assistant adds a palette that doesn't exist in
// config/theme.js yet (an existing palette keeps its own comments).
export const paletteComments = {
    background: { trailing: '// page background, header, inputs' },
    foreground: { trailing: '// body text, navigation' },
    contrast: { leading: [
        '// Highest-contrast colour against the background (white on a dark theme): headings,',
        '// and with alpha, hairline borders and card fills. Text on a contrast-coloured',
        '// surface (e.g. a white button) uses `background`.',
    ] },
    primary: { blankBefore: true, trailing: '// buttons, focus rings, gradient starts' },
    accent: { trailing: '// icons, badges, tags, glows, gradient ends' },
    secondary: { trailing: '// highlighted words, hover colour' },
    tertiary: { trailing: '// end colour of the highlight gradient, card glow' },
    'on-brand': { trailing: '// text on brand-coloured surfaces (CTA buttons)' },
    success: { blankBefore: true },
};

// Comment above the first pinned shade of a palette (`muted`, `muted-strong`, `surface-deep`, …).
export const pinnedShadesComment = { blankBefore: true, leading: ['// Pinned shades: the derived values would be too faint here (see `shades` below).'] };

// The theme whose palettes, colour mode and fonts equal `theme` (config/theme.js) and the fonts
// in use, or undefined when the current theme was customised.
export function matchTheme(theme, fonts) {
    const same = deepEqual;
    return Object.entries(themes).find(([, preset]) =>
        same(preset.colors, theme.colors)
        && same(preset.colorMode, theme.colorMode)
        && same(preset.gradients, theme.gradients)
        && same(preset.scrollGradient, theme.scrollGradient)
        && (!fonts || same(preset.fonts, fonts)),
    )?.[0];
}
