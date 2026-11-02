// Pages and their sections. Reorder, remove or add sections here; no component changes needed.
//
// Page:
//   path       URL of the page (without language prefix)
//   metadata   messages namespace with the page's `title` and `description` (SEO, link previews)
//   previewImage  set to false when the route has its own opengraph-image file; otherwise the
//              site-wide image from config/site.js is used for link previews
//   enabled    set to false to switch a page off (404, not in the sitemap or navigation); default true
//   sections   ordered list of sections (see below); legal pages use `type: 'legal'` + `namespace` instead
//   nav        link to the page itself in the navigation (same options as for sections)
//
// Section:
//   type       which component renders it; see components/sections/index.js for the available types
//   id         anchor (`/#services`) and React key; defaults to the type. Must be unique per page.
//   namespace  messages namespace with the section's texts; defaults to the type's own namespace.
//              Set it when the same type is used twice (e.g. two FAQ sections).
//   nav        adds the section to the navigation:
//                label   key in the `Nav` namespace of the messages
//                header  show in the header (default true)
//                footer  show in the footer: true (default, main link row), false, or 'legal' (small print row)
//   ...        any other keys are passed to the section component as props

import { hasColorModeToggle } from './theme.js';

export const pages = {
    home: {
        path: '/',
        metadata: 'Metadata.Home',
        sections: [
            {
                type: 'hero',
                // Background: video (with poster), image, gradient or colour; see components/sections/HeroBackground.jsx.
                background: {
                    type: 'video',
                    src: '/images/hero/hero_loop_silent_2.mp4',
                    poster: '/images/hero/hero_poster.jpg',
                    mobile: { src: '/images/hero/hero_mobile_2.mp4', poster: '/images/hero/hero_poster_mobile_2.jpg' },
                },
                // Alternatives:
                // background: { type: 'image', src: '/images/hero/hero_poster.jpg', mobile: { src: '/images/hero/hero_poster_mobile_2.jpg' } },
                // background: { type: 'gradient', gradient: 'brand', direction: '135deg' },
                // background: { type: 'gradient', css: 'radial-gradient(circle at top, #1e293b, #0D1117)' },
                // background: { type: 'color', color: 'surface' },
                overlay: { color: 'background', opacity: 0.5 }, // tint over the background; `false` to disable
                colorMode: 'dark',                              // keep the dark palette in both colour modes (dark footage); 'auto' follows the site
                ctaHref: '#intro',                              // where the button scrolls to
            },
            { type: 'intro' },
            {
                type: 'services',
                nav: { label: 'services' },
                // Icon names come from config/icons.js; texts from `Services.items.<id>` in the messages.
                items: [
                    { id: 'websites', icon: 'code' },
                    { id: 'webApps', icon: 'devices' },
                    { id: 'automation', icon: 'bolt' },
                    { id: 'design', icon: 'pencil' },
                ],
            },
            {
                type: 'work',
                nav: { label: 'work' },
                // Texts (title, description, tags, optional quote/client) from `Work.projects.<id>`.
                projects: [
                    { id: 'widgets', image: '/images/work/project-1.png', githubUrl: 'https://github.com/' },
                    { id: 'ceramics', image: '/images/work/project-2.png', liveUrl: 'https://example.com/' },
                    { id: 'roastery', image: '/images/work/project-3.png' },
                    { id: 'yoga', image: '/images/work/project-4.png', liveUrl: 'https://example.com/' },
                ],
            },
            // { type: 'lab', url: 'https://example.com' },
            {
                type: 'process',
                nav: { label: 'process' },
                // Texts from `Process.steps.<id>`.
                steps: ['discover', 'design', 'develop', 'deploy'],
            },
            {
                type: 'about',
                nav: { label: 'about' },
                image: '/images/about/portrait-placeholder.jpg',
            },
            { type: 'contact', nav: { label: 'contact', footer: false } },
        ],
    },

    starter: {
        path: '/starter',
        metadata: 'Metadata.Starter',
        previewImage: false, // generated per language by app/[locale]/starter/opengraph-image.jsx
        enabled: true,
        sections: [
            // The hero and pricing CTAs scroll to `ctaHref` ('#contact' by default).
            { type: 'starter-hero' },
            {
                type: 'starter-who-is-this-for',
                // Icon names come from config/icons.js; texts from `Starter.WhoIsThisFor.criteria.<id>`.
                criteria: [
                    { id: 'firstWebsite', icon: 'rocket' },
                    { id: 'oneOffer', icon: 'target' },
                    { id: 'shortTimeline', icon: 'zap' },
                    { id: 'directContact', icon: 'user' },
                    { id: 'detail', icon: 'sparkles' },
                    { id: 'contentReady', icon: 'lightbulb' },
                ],
            },
            {
                type: 'starter-pricing',
                // Texts from `Starter.Pricing.cards.<id>`.
                cards: [
                    { id: 'payment', icon: 'credit-card' },
                    { id: 'revision', icon: 'refresh-cw' },
                    { id: 'form', icon: 'clipboard-list' },
                ],
            },
            {
                type: 'starter-roadmap',
                // Texts from `Starter.Roadmap.steps.<id>`.
                steps: ['request', 'discovery', 'kickoff', 'launch'],
            },
            // { type: 'starter-tech-specs', specs: ['tech', 'speed', 'delivery', 'deployment'] },
            { type: 'starter-faq', id: 'faq' },
            { type: 'starter-contact', id: 'contact' },
        ],
    },

    impressum: {
        path: '/impressum',
        metadata: 'Metadata.Impressum',
        type: 'legal',
        namespace: 'Impressum',
        nav: { label: 'impressum', header: false, footer: 'legal' },
    },

    privacy: {
        path: '/privacy',
        metadata: 'Metadata.Privacy',
        type: 'legal',
        namespace: 'Privacy',
        // The Umami section is only rendered when analytics is enabled (same condition as the script in the layout).
        extraSections: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ? ['umami'] : [],
        // The note on the colour-mode setting (localStorage) joins section 3, "Data collection", only
        // when the dark/light toggle is enabled in config/theme.js; without it nothing is stored.
        extraParagraphs: hasColorModeToggle ? { 2: ['colorMode'] } : {},
        nav: { label: 'privacy', header: false, footer: 'legal' },
    },
};

// --- Helpers -------------------------------------------------------------

export const isEnabled = (page) => page.enabled !== false;

export const enabledPages = () => Object.values(pages).filter(isEnabled);

// Section id (defaults to the type)
export const sectionId = (section) => section.id ?? section.type;

/**
 * All navigation entries in page order: pages with `nav`, then their sections with `nav`.
 *   [{ href: '/#services', label: 'services', header: true, footer: true }, ...]
 */
export function navItems() {
    const items = [];
    const add = (href, nav) => items.push({ href, label: nav.label, header: nav.header !== false, footer: nav.footer ?? true });

    for (const page of enabledPages()) {
        if (page.nav) add(page.path, page.nav);
        for (const section of page.sections ?? []) {
            if (section.nav) add(`${page.path}#${sectionId(section)}`, section.nav);
        }
    }
    return items;
}

export const headerNav = () => navItems().filter((item) => item.header);
export const footerNav = () => navItems().filter((item) => item.footer === true);
export const legalNav = () => navItems().filter((item) => item.footer === 'legal');
