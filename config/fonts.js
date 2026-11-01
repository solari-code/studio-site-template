// Fonts for the whole site. This is the only file that loads font files.
//
// next/font is a build-time transform: every call must sit at module level and take
// literal arguments (no variables, no spreading), which is why fonts are set up here
// instead of in `config/theme.js`. `config/theme.js` then assigns the loaded families
// to roles (body, heading) via the CSS variables declared below.
//
// To use a different font: put the .woff2 into `app/fonts/` and change the `src` below.
// Variable fonts take a weight range ('100 900'); static fonts take one entry per file:
//   src: [{ path: '../app/fonts/Font-Regular.woff2', weight: '400' }, { path: '../app/fonts/Font-Bold.woff2', weight: '700' }]
// Google Fonts work too (`import { Manrope } from 'next/font/google'`), but then the
// build needs network access to Google, so self-hosting is the default.
import localFont from 'next/font/local';

// Inter is bundled locally (app/fonts, SIL OFL) so builds don't need to reach Google Fonts.
export const sans = localFont({
    src: '../app/fonts/InterVariable-latin.woff2',
    weight: '100 900',
    variable: '--font-sans',
    display: 'swap',
});

// Optional second family, e.g. for headings; then set `fonts.heading: 'var(--font-display)'` in config/theme.js.
// export const display = localFont({ src: '../app/fonts/Display.woff2', variable: '--font-display' });

// Class names that define the font CSS variables; applied to <body> in the root layout.
export const fontVariables = [sans.variable].join(' ');
