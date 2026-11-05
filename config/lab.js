// The Lab: personal projects (open source, packages, experiments), kept apart from client work
// (the `work` section). Every project is a card on /lab; the `featured` ones are also shown in the
// homepage's `lab` section. The page itself (on/off, navigation) is `pages.lab` in config/pages.js.
// Plain data only, so scripts can import it too.
//
// Project:
//   id        URL slug (lowercase letters, digits and hyphens): a project with a page lives at /lab/<id>.
//             The card texts (title, description, tags) come from `Lab.projects.<id>` in the messages.
//   detail    what the card opens:
//               'landing'   a custom landing page: a component registered under the id in
//                           components/lab/landings/index.jsx
//               'markdown'  the project page template, filled from content/lab/<id>/<language>.md
//               omitted     nothing: the card stands on its own, with its links
//   image     optional; picture on the card and the project page (path in public/ or a remote URL),
//             and the link-preview image of the project page
//   links     optional external links, keyed by type (see `labLinkTypes` below), e.g.
//             { github: 'https://github.com/…', npm: 'https://www.npmjs.com/package/…' }
//   featured  also show the card in the homepage's lab section
//   enabled   set to false to hide a project everywhere (card, page, sitemap); default true

import { pages, isEnabled } from './pages.js';

export const labProjects = [
    {
        id: 'scroll-gradient',
        detail: 'landing',
        image: '/images/lab/scroll-gradient.png',
        links: { github: 'https://github.com/', npm: 'https://www.npmjs.com/' },
        featured: true,
    },
    {
        id: 'message-diff',
        detail: 'markdown',
        image: '/images/lab/message-diff.png',
        links: { github: 'https://github.com/', npm: 'https://www.npmjs.com/' },
        featured: true,
    },
    {
        id: 'type-specimens',
        links: { demo: 'https://example.com/' },
        featured: true,
    },
];

// Link types a project can use in `links`, in the order they are shown. `icon` is a name from
// config/icons.js; the text comes from `Lab.links.<type>` in the messages.
export const labLinkTypes = {
    github: { icon: 'github' },
    npm: { icon: 'npm' },
    demo: { icon: 'external-link' },
};

// --- Helpers -------------------------------------------------------------

export const enabledLabProjects = () => labProjects.filter(isEnabled);

export const featuredLabProjects = () => enabledLabProjects().filter((project) => project.featured);

// Whether clicking the card opens a page of its own (/lab/<id>).
export const hasProjectPage = (project) => project.detail === 'landing' || project.detail === 'markdown';

// The projects that have a page of their own (/lab/<id>): enabled, with a `detail`, and none while the
// lab page is switched off. Used by the project route and the sitemap.
export const labProjectsWithPage = () => (isEnabled(pages.lab) ? enabledLabProjects().filter(hasProjectPage) : []);

// URL of a project's page (without language prefix), e.g. /lab/scroll-gradient
export const labProjectPath = (project) => `${pages.lab.path}/${project.id}`;

// A project's links in display order: [{ type: 'github', url, icon: 'github' }, ...]
export const projectLinks = (project) =>
    Object.entries(labLinkTypes)
        .filter(([type]) => project.links?.[type])
        .map(([type, { icon }]) => ({ type, url: project.links[type], icon }));
