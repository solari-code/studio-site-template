import { theme, colors, colorVar, gradientVar, COLOR_MODE_ATTRIBUTE } from './config/theme.js';

// Tailwind reads all colours, gradients and font roles from config/theme.js.
// Change the theme there, not here.
//
// Colours are referenced through the CSS variables the root layout sets on <html>
// (`--color-<token>: r g b`), so the generated utilities follow whatever the variables
// currently hold. `<alpha-value>` keeps the opacity modifiers working (`bg-contrast/10`).

const colorUtilities = Object.fromEntries(
  Object.keys(colors).map((name) => [name, `rgb(var(--color-${name}) / <alpha-value>)`])
);

const gradientUtilities = Object.fromEntries(
  Object.keys(theme.gradients).map((name) => [`gradient-${name}`, gradientVar(name)])
);

// `dark:` and `light:` variants follow the site's mode (`data-color-mode` on <html>), not the
// mode of a pinned section, so e.g. the toggle always reflects the site.
const siteMode = (mode) => `html[${COLOR_MODE_ATTRIBUTE}="${mode}"]`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', siteMode('dark')],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Font roles from config/theme.js: `font-sans` is the body role, `font-heading` the heading role.
      fontFamily: {
        sans: [theme.fonts.body.family, theme.fonts.body.fallback],
        heading: [theme.fonts.heading.family, theme.fonts.heading.fallback],
      },
      colors: colorUtilities,
      backgroundImage: gradientUtilities,
      boxShadow: {
        // Soft glow around circular step numbers
        glow: `0 0 20px ${colorVar('accent', 0.15)}`,
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
      },
    },
  },
  plugins: [
    ({ addVariant }) => addVariant('light', `:where(${siteMode('light')}, ${siteMode('light')} *) &`),
  ],
};
