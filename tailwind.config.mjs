import { theme, gradientColors, withAlpha } from './config/theme.js';

// Tailwind reads all colours, gradients and font roles from config/theme.js.
// Change the theme there, not here.

const gradientUtilities = Object.fromEntries(
  Object.keys(theme.gradients).map((name) => [
    `gradient-${name}`,
    `linear-gradient(to right, ${gradientColors(name).join(', ')})`,
  ])
);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [theme.fonts.body, 'sans-serif'],
        heading: [theme.fonts.heading, 'sans-serif'],
      },
      colors: theme.colors,
      backgroundImage: gradientUtilities,
      boxShadow: {
        // Soft glow around circular step numbers
        glow: `0 0 20px ${withAlpha('accent-deep', 0.15)}`,
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
  plugins: [],
};
