// Brand basics for the whole site: change these to make the template yours.
// Plain data only (no components), so it can be imported from next.config.mjs and scripts too.
// The logo lives in config/logo.jsx, the pages in config/pages.js, the theme in config/theme.js.
export const siteConfig = {
    name: "Nova Studio",
    url: "https://example.com",

    contact: {
        email: "hello@example.com",
        // Sender address for contact-form mails; must be on a domain verified in Resend.
        formSender: "website@example.com",
        // Shown as a "Chat on WhatsApp" button in the contact overlay; leave empty to hide the button.
        whatsappNumber: "490000000000",
        phone: "+49 000 0000000",
    },

    // Social links in the footer, in this order. `icon` is a name from config/icons.js.
    social: [
        { label: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/" },
        { label: "GitHub", icon: "github", url: "https://github.com/" },
        // { label: "Instagram", icon: "instagram", url: "https://www.instagram.com/" },
    ],

    // Link-preview image and favicons (files in public/).
    assets: {
        ogImage: { src: "/og-image-2.png", width: 1200, height: 630 },
        favicons: {
            icon: [
                { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
                { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
                { url: "/favicon/favicon-48x48.png", sizes: "48x48", type: "image/png" },
            ],
            apple: "/favicon/apple-touch-icon.png",
        },
    },

    // Notification mails sent by the contact forms (to NOTIFICATION_EMAIL from .env.local).
    // `{name}` is the sender's name, `{host}` the site's host name. Keyed by the form's `form` id.
    forms: {
        contact: { subject: "New message via {host}", heading: "New Contact Message" },
        starter: { subject: "New Starter Package Request from {name}", heading: "New Starter Package Request" },
    },

    // Remote hosts that next/image may load from (for images referenced by URL in config/pages.js).
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "uploadthing.com" },
            { protocol: "https", hostname: "utfs.io" },
        ],
    },
};
