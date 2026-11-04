/**
 * What the assistant leaves to you: texts, images, the logo and secrets are edited by hand.
 * Steps add their own items (e.g. "translate messages/fr.json") via `step.todos()`.
 */
export const manualTodos = [
    'Logo: replace the placeholder mark in config/logo.jsx (SVG or <img>).',
    'Favicons: swap public/favicon/* and app/favicon.ico; link-preview image public/og-image-2.png (1200×630).',
    'Hero footage: public/images/hero/* (video + poster, desktop and mobile) or switch the hero background to an image, gradient or colour in config/pages.js.',
    'Images: public/images/work/* (projects) and public/images/about/* (portrait), referenced from config/pages.js.',
    'Texts: all copy, page titles/descriptions and the legal pages (Impressum, Privacy) in messages/<language>.json.',
    'Mail: copy .env.example to .env.local and set RESEND_API_KEY and NOTIFICATION_EMAIL (optional: Umami analytics).',
];
