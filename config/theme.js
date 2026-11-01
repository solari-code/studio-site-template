// Design tokens for the whole site. Components only use these semantic names
// (e.g. `bg-background`, `text-accent`, `bg-gradient-highlight`), never raw colours.
//
// - `tailwind.config.mjs` turns the tokens into utility classes (with alpha support: `bg-contrast/10`).
// - `app/[locale]/layout.js` exposes them as CSS variables (`--color-background`, …) for plain CSS.
// - Components that need a colour at runtime (glows, the OG image) import `theme` directly.
//
// Fonts are loaded in `config/fonts.js` (next/font needs literal arguments there);
// `fonts` below only decides which loaded family plays which role.

export const theme = {
    colors: {
        // Surfaces
        background: '#0D1117',      // page background, header, inputs
        surface: '#161B22',         // alternating sections, cards, overlays
        'surface-deep': '#0a0a0a',  // extra-dark panels (pricing card)

        // Text
        foreground: '#E6EDF3',      // body text, navigation
        muted: '#8B949E',           // secondary text (homepage)
        'muted-alt': '#9ca3af',     // secondary text (starter page)
        'muted-deep': '#6b7280',    // small labels, inactive icons
        'muted-soft': '#d1d5db',    // lists on dark panels

        // Highest-contrast colour against the background (white on a dark theme),
        // used for headings and, with alpha, for hairline borders and card fills.
        contrast: '#ffffff',
        'contrast-muted': '#e5e7eb', // hover state of contrast-coloured buttons
        'on-contrast': '#000000',    // text on top of a contrast-coloured surface

        // Brand
        primary: '#3081F7',         // buttons, focus rings, gradient starts
        accent: '#22d3ee',          // icons, badges, tags, gradient ends
        'accent-deep': '#06b6d4',   // glows, rings, tag backgrounds
        secondary: '#D946EF',       // highlighted words, hover colour
        'secondary-alt': '#ec4899', // end colour of the highlight gradient
        tertiary: '#9333ea',        // pricing card glow

        // Status
        success: '#4ade80',
        error: '#f87171',
        whatsapp: '#25D366',
    },

    // Named gradients (left to right) referencing the colours above.
    // Available as `bg-gradient-<name>` utilities.
    gradients: {
        highlight: ['secondary', 'secondary-alt'],       // highlighted words in headings
        'highlight-alt': ['primary', 'accent'],          // alternative highlight
        'highlight-mix': ['secondary', 'accent'],        // starter page headings
        brand: ['secondary', 'primary'],                 // the studio name in the intro
        cta: ['primary', 'accent'],                      // submit buttons, CTA button glow
        'cta-animated': ['primary', 'accent', 'primary'], // animated CTA button background
        'card-glow': ['accent-deep', 'tertiary'],        // glow behind the pricing card
    },

    // Scroll-aware headings blend from one gradient into another while scrolling into view.
    scrollGradient: { from: 'highlight', to: 'highlight-alt' },

    // Font roles, referencing the CSS variables defined in `config/fonts.js`.
    fonts: {
        body: 'var(--font-sans)',
        heading: 'var(--font-sans)',
    },
};

// --- Helpers -------------------------------------------------------------

export function hexToRgb(hex) {
    const value = hex.replace('#', '');
    const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
    const int = parseInt(full, 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

// Colour token with alpha, e.g. withAlpha('accent-deep', 0.15) -> 'rgba(6, 182, 212, 0.15)'
export function withAlpha(token, alpha) {
    const { r, g, b } = hexToRgb(theme.colors[token]);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Hex colours of a named gradient, e.g. gradientColors('highlight') -> ['#D946EF', '#ec4899']
export function gradientColors(name) {
    return theme.gradients[name].map((token) => theme.colors[token]);
}

// CSS for a named gradient, e.g. 'linear-gradient(to right, #D946EF, #ec4899)'
export function gradientCss(name, direction = 'to right') {
    return `linear-gradient(${direction}, ${gradientColors(name).join(', ')})`;
}

// `--color-<token>` custom properties for the root element.
export function themeCssVariables() {
    return Object.fromEntries(Object.entries(theme.colors).map(([name, value]) => [`--color-${name}`, value]));
}
