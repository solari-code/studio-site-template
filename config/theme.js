// Design tokens for the whole site. Components only use these semantic names
// (e.g. `bg-background`, `text-accent`, `bg-gradient-highlight`), never raw colours.
//
// The palette is deliberately small: a handful of base colours per colour mode in `colors`,
// and a few shades in `shades` that are derived from them by mixing (e.g. `surface` is the
// background nudged towards `contrast`). Change a base colour and its shades follow.
//
// Colour modes: `colors` holds one palette per mode (`dark`, `light`); `colorMode` decides how
// they are used. The four setups:
//   dark only / light only   one palette in `colors`; nothing else needed
//   system preference        both palettes, `default: 'system'`, `toggle: false`
//   system + toggle          both palettes, `default: 'system'`, `toggle: true` – visitors can switch
//                            in the header, mobile menu and footer; the choice is kept in localStorage
// (`default: 'dark'` or `'light'` with both palettes starts fixed; useful with `toggle: true`, or to
// keep the second palette only for pinned sections such as the hero.)
//
// - `app/[locale]/layout.js` exposes the tokens as CSS variables (`--color-background`, …) holding
//   `r g b` channels, so they work with alpha: `rgb(var(--color-contrast) / 0.1)`. One set per
//   mode, switched via `data-color-mode` on <html> (or on any element, to pin a section to one mode).
// - `tailwind.config.mjs` turns the variables into utility classes (`bg-surface`, `border-contrast/10`);
//   `dark:` / `light:` variants follow the site's current mode.
// - Components that need a colour in an inline style use `colorVar()` / `gradientVar()` (CSS variables);
//   server-rendered images (the OG image) use the static hex helpers (`colors`, `withAlpha()`, `gradientCss()`).
//
// Fonts are loaded in `config/fonts.js` (next/font needs literal arguments there);
// `fonts` below only decides which loaded family plays which role.

export const theme = {
    // default  which mode the site starts in: 'system' (the visitor's OS preference), 'dark' or 'light'.
    //          With 'system', the first palette below is used where the preference can't be read
    //          (the link-preview image, browsers without JavaScript).
    // toggle   show the dark/light switch (needs both palettes). Stores the choice in localStorage.
    colorMode: { default: 'system', toggle: true },

    // Base colours per mode. Remove a mode to build a single-mode site. Everything else is
    // derived from these; a shade can be pinned per mode by adding it here explicitly
    // (e.g. `'surface-deep': '#f3f4f6'` under `light`).
    colors: {
        dark: {
            background: '#0D1117',  // page background, header, inputs
            foreground: '#E6EDF3',  // body text, navigation
            // Highest-contrast colour against the background (white on a dark theme): headings,
            // and with alpha, hairline borders and card fills. Text on a contrast-coloured
            // surface (e.g. a white button) uses `background`.
            contrast: '#ffffff',

            primary: '#3081F7',     // buttons, focus rings, gradient starts
            accent: '#22d3ee',      // icons, badges, tags, glows, gradient ends
            secondary: '#D946EF',   // highlighted words, hover colour
            tertiary: '#ec4899',    // end colour of the highlight gradient, card glow
            'on-brand': '#ffffff',  // text on brand-coloured surfaces (CTA buttons)

            success: '#4ade80',
            error: '#f87171',
            whatsapp: '#25D366',
        },
        light: {
            background: '#ffffff',
            foreground: '#111827',
            contrast: '#0b0f17',

            // Slightly deeper brand colours than in the dark palette, so gradients and tags stay legible on white.
            primary: '#2563eb',
            accent: '#0891b2',
            secondary: '#c026d3',
            tertiary: '#db2777',
            'on-brand': '#ffffff',

            success: '#16a34a',
            error: '#dc2626',
            whatsapp: '#25D366',

            // Pinned shades. `muted-strong`: mixing towards white loses contrast faster than towards
            // black, so the derived value would be too faint for labels. `surface-deep`: the derived
            // value (background towards black) only makes sense for dark palettes.
            'muted-strong': '#80858e',
            'surface-deep': '#f3f4f6',
        },
    },

    // Derived shades, the same rule for every mode: `base` mixed by `amount` (0–1) towards `mix`
    // (a token or a CSS hex colour). Available as tokens like the base colours (`bg-surface`, `text-muted`).
    shades: {
        surface: { base: 'background', mix: 'contrast', amount: 0.04 },         // alternating sections, cards, overlays
        'surface-deep': { base: 'background', mix: '#000000', amount: 0.3 },    // emphasised dark panel (pricing card)
        muted: { base: 'foreground', mix: 'background', amount: 0.4 },          // secondary text
        'muted-strong': { base: 'foreground', mix: 'background', amount: 0.55 }, // small labels, inactive icons
    },

    // Named gradients (left to right) referencing the tokens above.
    // Available as `bg-gradient-<name>` utilities.
    gradients: {
        highlight: ['secondary', 'tertiary'],             // highlighted words in headings
        'highlight-alt': ['primary', 'accent'],           // alternative highlight
        'highlight-mix': ['secondary', 'accent'],         // starter page headings
        brand: ['secondary', 'primary'],                  // the studio name in the intro
        cta: ['primary', 'accent'],                       // submit buttons, CTA button glow
        'cta-animated': ['primary', 'accent', 'primary'], // animated CTA button background
        'card-glow': ['accent', 'tertiary'],              // glow behind the pricing card
    },

    // Scroll-aware headings blend from one gradient into another while scrolling into view.
    scrollGradient: { from: 'highlight', to: 'highlight-alt' },

    // Font roles, referencing the CSS variables defined in `config/fonts.js`.
    fonts: {
        body: 'var(--font-sans)',
        heading: 'var(--font-sans)',
    },
};

// --- Colour modes ----------------------------------------------------------

// Configured modes in a fixed order, e.g. ['dark', 'light'] or ['light'].
export const colorModes = ['dark', 'light'].filter((mode) => theme.colors[mode]);

// 'system' when the site follows the OS preference, otherwise the fixed start mode.
export const defaultColorMode = colorModes.length > 1 ? (theme.colorMode.default ?? 'system') : colorModes[0];

// True when the site follows the OS preference (and its changes).
export const followsSystemColorMode = defaultColorMode === 'system';

// True when visitors can switch between modes (both palettes and `toggle: true`).
export const hasColorModeToggle = colorModes.length > 1 && theme.colorMode.toggle === true;

// True when the mode is decided in the browser (OS preference or a stored choice) rather than fixed.
export const hasColorModeScript = followsSystemColorMode || hasColorModeToggle;

// The mode used where the visitor's preference isn't available: server-rendered images,
// browsers without JavaScript. The explicit default, or the first configured palette.
export const staticColorMode = defaultColorMode === 'system' ? colorModes[0] : defaultColorMode;

// Name of the `data-*` attribute that carries the mode (on <html>, or on an element to pin it).
export const COLOR_MODE_ATTRIBUTE = 'data-color-mode';
// localStorage key of the visitor's explicit choice.
export const COLOR_MODE_STORAGE_KEY = 'color-mode';

// A section can be pinned to one mode (e.g. the hero stays dark over dark footage). Returns the
// mode if it is configured, otherwise undefined (the section follows the site).
export function pinnedColorMode(mode) {
    return mode !== 'auto' && theme.colors[mode] ? mode : undefined;
}

// Sections that are pinned by default: the hero, because its footage is usually dark.
export const HERO_COLOR_MODE = 'dark';

// `{ 'data-color-mode': mode }` to spread onto a pinned element, or `{}`.
export function colorModeAttribute(mode) {
    const pinned = pinnedColorMode(mode);
    return pinned ? { [COLOR_MODE_ATTRIBUTE]: pinned } : {};
}

// --- Resolved tokens -------------------------------------------------------

export function hexToRgb(hex) {
    const value = hex.replace('#', '');
    const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
    const int = parseInt(full, 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function rgbToHex({ r, g, b }) {
    return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

// `from` mixed by `amount` (0–1) towards `to`, e.g. mix('#000000', '#ffffff', 0.5) -> '#808080'
export function mix(from, to, amount) {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    return rgbToHex({
        r: a.r + (b.r - a.r) * amount,
        g: a.g + (b.g - a.g) * amount,
        b: a.b + (b.b - a.b) * amount,
    });
}

// Base colours of a mode plus the derived shades as one flat `{ token: hex }` map.
export function resolveColors(mode = staticColorMode, shades = theme.shades) {
    const base = theme.colors[mode];
    if (!base) throw new Error(`config/theme.js: no colours configured for mode "${mode}" (configured: ${colorModes.join(', ')}).`);
    const resolved = { ...base };
    for (const [name, shade] of Object.entries(shades)) {
        if (resolved[name]) continue; // an explicit colour wins over the derived one
        const from = resolved[shade.base];
        const to = shade.mix.startsWith('#') ? shade.mix : resolved[shade.mix];
        if (!from || !to) throw new Error(`config/theme.js: shade "${name}" references an unknown colour token (base: "${shade.base}", mix: "${shade.mix}").`);
        resolved[name] = mix(from, to, shade.amount ?? 0);
    }
    return resolved;
}

// All colour tokens (base + shades) of the static mode as hex values, e.g. colors.surface -> '#171a20'
export const colors = resolveColors();

// --- Static helpers (hex values) ------------------------------------------
// For code that can't use CSS variables, e.g. the server-rendered OG image.

// Hex value of a colour token, e.g. color('accent') -> '#22d3ee'
export function color(token) {
    return colors[token];
}

// Colour token with alpha, e.g. withAlpha('accent', 0.15) -> 'rgba(34, 211, 238, 0.15)'
export function withAlpha(token, alpha) {
    const { r, g, b } = hexToRgb(colors[token]);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Hex colours of a named gradient, e.g. gradientColors('highlight') -> ['#D946EF', '#ec4899']
export function gradientColors(name) {
    return theme.gradients[name].map((token) => colors[token]);
}

// CSS for a named gradient, e.g. 'linear-gradient(to right, #D946EF, #ec4899)'
export function gradientCss(name, direction = 'to right') {
    return `linear-gradient(${direction}, ${gradientColors(name).join(', ')})`;
}

// --- CSS variable helpers ---------------------------------------------------
// For inline styles in components. The variables are set on <html> in the root layout.

// Colour token as a CSS variable reference, e.g. colorVar('accent', 0.15) -> 'rgb(var(--color-accent) / 0.15)'
export function colorVar(token, alpha) {
    return alpha === undefined ? `rgb(var(--color-${token}))` : `rgb(var(--color-${token}) / ${alpha})`;
}

// CSS for a named gradient built from the variables, e.g. 'linear-gradient(to right, rgb(var(--color-secondary)), rgb(var(--color-tertiary)))'
export function gradientVar(name, direction = 'to right') {
    return `linear-gradient(${direction}, ${theme.gradients[name].map((token) => colorVar(token)).join(', ')})`;
}

// `--color-<token>: r g b` custom properties of a mode.
export function themeCssVariables(mode = staticColorMode) {
    return Object.fromEntries(Object.entries(resolveColors(mode)).map(([name, value]) => {
        const { r, g, b } = hexToRgb(value);
        return [`--color-${name}`, `${r} ${g} ${b}`];
    }));
}

// Stylesheet that defines the variables for every configured mode (inlined in the root layout):
// the static mode on :root, the OS preference as a fallback while no mode is set explicitly,
// and one `[data-color-mode="…"]` block per mode, which works on <html> as well as on single
// elements that are pinned to a mode.
export function themeCss() {
    const block = (mode) => {
        const vars = Object.entries(themeCssVariables(mode)).map(([name, value]) => `${name}:${value}`);
        return `{${vars.join(';')};color-scheme:${mode}}`;
    };
    const rules = [`:root${block(staticColorMode)}`];
    if (followsSystemColorMode) {
        for (const mode of colorModes) {
            if (mode === staticColorMode) continue;
            rules.push(`@media (prefers-color-scheme: ${mode}){:root:not([${COLOR_MODE_ATTRIBUTE}])${block(mode)}}`);
        }
    }
    for (const mode of colorModes) rules.push(`[${COLOR_MODE_ATTRIBUTE}="${mode}"]${block(mode)}`);
    return rules.join('\n');
}

// Inline script that sets `data-color-mode` on <html> before the first paint, so there is
// no flash of the wrong mode: the stored choice if the toggle is enabled and there is one,
// otherwise the OS preference (or the configured default). localStorage is only read with the toggle.
export function colorModeScript() {
    const initial = followsSystemColorMode
        ? `matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'`
        : JSON.stringify(defaultColorMode);
    const stored = hasColorModeToggle
        ? `var m=localStorage.getItem('${COLOR_MODE_STORAGE_KEY}');if(${JSON.stringify(colorModes)}.indexOf(m)<0){m=${initial}}`
        : `var m=${initial};`;
    return `(function(){try{${stored}document.documentElement.setAttribute('${COLOR_MODE_ATTRIBUTE}',m)}catch(e){}})()`;
}
