# Studio site template

A config-driven one-page website template for a small web design & development studio, with a separate `/starter` offer page, a `/lab` for personal projects and Impressum/privacy pages. Built with Next.js 15 (App Router), Tailwind CSS and Framer Motion. Multilingual out of the box (English and German included), powered by [next-intl](https://next-intl.dev).

Everything that differs from client to client lives in `config/` and `messages/`: brand and contact details, theme, fonts, logo, which sections appear on which page and in which order, their data (images, links, icons, steps), the navigation and all texts. Components don't need to be touched to set up a new site. (The one folder of long-form content is `content/lab/`: the markdown of lab project pages.)

The brand ("Nova Studio"), logo, images, videos, client projects, lab projects and legal details are placeholders.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
|---|---|
| `npm run setup` | interactive setup assistant: brand, theme, languages, lab, pages (see below) |
| `npm run build` | production build |
| `npm run lint` | ESLint |
| `npm run check` | runs both checks below |
| `npm run check:config` | validates `config/` against the messages and `public/` (unknown section types or icons, missing files, ids without texts, duplicate anchors, lab projects, …). Exits with 1 on errors |
| `npm run check:messages` | compares the language files, incl. the lab's markdown, and warns about missing or extra texts (never fails; missing texts fall back to English at runtime) |
| `npm run visual` / `visual:update` | visual regression screenshots, see below |
| `npm run test:setup` | unit tests of the setup assistant (`node --test`) |

No environment variables are needed to run the site. To make the contact forms actually send mail through [Resend](https://resend.com), copy `.env.example` to `.env.local` and set a real `RESEND_API_KEY` and `NOTIFICATION_EMAIL`; without them, submitting a form shows an error message. Analytics (Umami) only loads when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set; when it is, the privacy policy automatically shows a paragraph about Umami.

## Setting up a new site

Clone the template once per client, commit, then:

1. **`npm run setup`** – the assistant asks for the brand basics, theme and fonts, languages, whether the lab is shown, and pages/sections and writes them into the config (details below). Everything it does can also be done by hand in `config/` and `i18n/routing.js`.
2. **`config/logo.jsx`** – replace the placeholder mark with the client's logo (SVG or `<img>`). Swap the favicons in `public/favicon/` and `app/favicon.ico`, and the preview image `public/og-image-2.png`.
3. **`public/images/`** – the images and videos referenced from `config/pages.js` (hero footage, project images, portrait) and `config/lab.js` (lab project images).
4. **`messages/<language>.json`** – all texts, incl. page titles/descriptions (`Metadata`) and the legal pages (`Impressum`, `Privacy`). A language added by the assistant starts as a copy of the default language's file.
5. **The lab** – replace the three example projects with the studio's own (see [The Lab](#the-lab)), or switch the lab off in `npm run setup`.
6. **`.env.local`** – copy `.env.example` and set `RESEND_API_KEY` and `NOTIFICATION_EMAIL` for the contact forms.
7. Only if needed: **`config/icons.js`** (an icon that isn't registered yet), **`config/site.js`** (favicons, preview image, mail subjects, remote image hosts), **`config/fonts.js`** (a font that isn't bundled).
8. `npm run check` and `npm run build`.

### Setup assistant

`npm run setup` walks through five steps; each can be skipped, and every question shows the current value from the config as its default, so running it again later continues from what is there instead of starting over.

- **Brand & contact** → `config/site.js`: site name and URL, contact email, form sender, phone, WhatsApp number, social links.
- **Theme & fonts** → `config/theme.js`, `config/fonts.js`: keep the current theme or start from an example theme (Nova – the template default, Editorial, Atelier, Dusk; defined in `scripts/setup/themes.mjs`), choose the colour-mode setup (dark only, light only, system preference with or without a switch, …), optionally adjust the main colours per palette, and pick body and heading fonts from the bundled families.
- **Languages** → `i18n/routing.js`, `messages/`: default language and additional languages. A new language gets `messages/<code>.json` as a copy of the default language's file, to be translated (`npm run check:messages` lists what is left). A removed language keeps its messages file and its lab page texts (`content/lab/*/<code>.md`) unless you say otherwise; both questions default to no.
- **Lab** → `config/pages.js`: one question, whether the lab is shown: the `/lab` page, its project pages and the homepage's lab section, switched together. Only their `enabled` flags change; the projects, texts, markdown and landing pages stay, so switching it on again brings everything back. The projects themselves are managed in `config/lab.js` (see [The Lab](#the-lab)).
- **Pages & sections** → `config/pages.js`: pages on/off, sections on/off (`enabled: false`, the entry stays) and their order, header/footer navigation, and the section options that are data rather than text (hero background and colour mode, CTA target, about image, pricing-card mode). The lab page and the lab section's on/off state are left to the Lab step (the section can still be moved). A section that goes into the navigation without a `Nav.<id>` text gets one: you are asked for it, and it is written to the default language's messages file (the one exception to "texts stay manual"); the other languages show it in the default language until translated.

Wrong values (a hex colour, URL, email, language code, a file that isn't in `public/`) are rejected right away and asked again. At the end the assistant shows a summary of every change per file; **nothing is written before you confirm**. It then runs `npm run check` and lists what is still to be done by hand (logo, favicons, images, texts, `.env.local`, …). It warns at the start if the working tree has uncommitted changes, because git is the way to undo its edits.

The config files are edited in place, not regenerated: only the values you change are touched, and every comment, blank line and the formatting around them stay. Texts, images and the logo are never touched (apart from the navigation text above, and the files of a removed language if you choose to delete them).

To add an example theme, add an entry to `themes` in `scripts/setup/themes.mjs` (both palettes, colour-mode setup, fonts); `npm run test:setup` checks that it is complete and that text and brand colours have enough contrast in both modes.

## Pages and sections

`config/pages.js` lists every page:

```js
home: {
    path: '/',
    metadata: 'Metadata.Home',          // messages namespace with title + description
    sections: [
        { type: 'hero', background: { … }, overlay: { … }, ctaHref: '#intro' },
        { type: 'intro' },
        { type: 'services', nav: { label: 'services' }, items: [{ id: 'websites', icon: 'code' }, …] },
        { type: 'work', nav: { label: 'work' }, projects: [{ id: 'widgets', image: '/images/work/project-1.png', githubUrl: '…' }, …] },
        { type: 'lab' },                    // teaser for /lab, projects from config/lab.js
        { type: 'process', nav: { label: 'process' }, steps: ['discover', 'design', 'develop', 'deploy'] },
        { type: 'about', nav: { label: 'about' }, image: '/images/about/portrait-placeholder.jpg' },
        { type: 'contact', nav: { label: 'contact', footer: false, order: 1 } },
    ],
},
starter:   { path: '/starter', metadata: 'Metadata.Starter', enabled: true, sections: [ … ] },
lab:       { path: '/lab', metadata: 'Metadata.Lab', nav: { label: 'lab' }, sections: [{ type: 'lab-projects' }] },
impressum: { path: '/impressum', type: 'legal', namespace: 'Impressum', nav: { label: 'impressum', header: false, footer: 'legal' } },
```

- **Sections** are rendered in the listed order. The available types are registered in `components/sections/index.jsx`: `hero`, `intro`, `services`, `work`, `process`, `lab`, `about`, `contact` for the homepage and `starter-hero`, `starter-who-is-this-for`, `starter-pricing`, `starter-roadmap`, `starter-faq`, `starter-contact`, `starter-tech-specs` for the offer page, and `lab-projects` for `/lab`. Any type can be used on any page.
- A section's **`id`** (defaults to its type) is its anchor (`/#services`) and must be unique per page.
- **`nav`** puts a section (or a page) into the navigation: `label` is a key in the `Nav` messages; `header: false` hides it from the header, `footer: false` from the footer, `footer: 'legal'` puts it into the footer's small-print row. Header and footer are generated from this, nothing is hardcoded. Entries appear in config order (each page's own link after its sections, pages in the order of `config/pages.js`); `order` moves an entry: entries are sorted by it (default 0, equal values keep the config order), so `order: 1` on Contact keeps it last, after page links like Lab.
- **Data** (items, projects, steps, cards, criteria, images, links) sits on the section entry and is passed to the component as props. The texts live in the messages under the section's namespace, keyed by `id` (e.g. `Services.items.websites`). `namespace` overrides the default namespace when the same type is used twice.
- **Icons** are referenced by name (`icon: 'rocket'`) and registered in `config/icons.js`: custom SVG paths or anything from [lucide](https://lucide.dev), imported there once.
- **`enabled: false`** switches a page off (404, not in the sitemap, not in the navigation) or a section off (not rendered, not in the navigation) while keeping its entry for later; the template ships `starter-tech-specs` switched off this way. **`previewImage`** sets a page's link-preview image: the site-wide one from `config/site.js` unless set, `false` leaves it to the route's own `opengraph-image` file (as for `/starter`), an image path uses that image.
- **Legal pages** use `type: 'legal'` with a messages `namespace` instead of sections; `extraSections` lists additional keys rendered after the regular sections (used for the Umami section), `extraParagraphs` maps a section index to keys whose paragraphs are appended to that section (used for the colour-mode note).

A forgotten data prop, an unknown type or icon fails the build with a message that says what to add where; `npm run check:config` finds the same things (plus missing files and ids without texts) without building.

### Hero background

```js
background: { type: 'video', src: '/images/hero/loop.mp4', poster: '/images/hero/poster.jpg', mobile: { src: '…', poster: '…' } }
background: { type: 'image', src: '/images/hero/hero.jpg', mobile: { src: '…' } }
background: { type: 'gradient', gradient: 'brand', direction: '135deg' }   // a named gradient from the theme
background: { type: 'gradient', css: 'radial-gradient(circle at top, #1e293b, #0D1117)' }
background: { type: 'color', color: 'surface' }                             // a colour token or CSS colour
```

`mobile` overrides the sources below 768px; omit `background` for none. `overlay: { color: 'background', opacity: 0.5 }` tints the background (`false` to disable), `logo: false` hides the logo mark, `ctaHref` is the button's target, `colorMode` pins the hero to a colour mode (`'dark'` by default, see [Colour modes](#colour-modes)).

## The Lab

The lab shows the studio's personal projects – open source, packages, experiments – apart from the client work in the `work` section:

- **`/lab`** lists every project as a card: image (optional), title, short description, tags and external links (GitHub, npm, demo).
- **The homepage's `lab` section** is a teaser with the projects marked `featured` (at most 3, `limit` on the section entry changes that) and a button to `/lab`. Phones show the first card, tablets two, desktops all. While the lab page is off, the section renders nothing.
- **A project page**, `/lab/<id>`, is optional. Each project is one of three kinds:

| `detail` | Clicking the card opens | Content lives in |
|---|---|---|
| `'landing'` | a landing page of its own, freely designed | a component in `components/lab/landings/` + its texts in the messages |
| `'markdown'` | the project page template: title, description, tags, links, image, then the text | `content/lab/<id>/<language>.md` |
| omitted | nothing: the card stands on its own, with its links | – |

The template ships one example of each: `scroll-gradient` (landing page, with a live demo of the site's own scroll gradient), `message-diff` (markdown) and `type-specimens` (card only, without an image). They are placeholders, like the client projects.

### Configuration

The page itself is `pages.lab` in `config/pages.js` (on/off, navigation). The projects are in `config/lab.js`:

```js
export const labProjects = [
    {
        id: 'scroll-gradient',              // URL /lab/scroll-gradient; texts from Lab.projects.scroll-gradient
        detail: 'landing',                  // 'landing' | 'markdown' | omitted (card only)
        image: '/images/lab/scroll-gradient.png', // optional: card, project page, link preview
        links: { github: 'https://github.com/…', npm: 'https://www.npmjs.com/package/…' },
        featured: true,                     // also in the homepage teaser
        // enabled: false,                  // hides the project everywhere (card, page, sitemap)
    },
    …
];

// Link types a project can use, in display order: icon from config/icons.js, text from Lab.links.<type>.
export const labLinkTypes = {
    github: { icon: 'github' },
    npm: { icon: 'npm' },
    demo: { icon: 'external-link' },
};
```

Projects appear in the order of the list. Another kind of link (say `docs`) is one more entry in `labLinkTypes` plus a `Lab.links.docs` text.

### Texts and languages

- **Card texts** are messages, like everything else: `Lab.projects.<id>` with `title`, `description` and `tags`. A project page uses them too: they are its heading, and its title and description for search engines.
- **Markdown** of a project page lives next to the messages, one file per language: `content/lab/<id>/en.md`, `content/lab/<id>/de.md`, … Like the messages, a missing translation falls back to the default language: the page shows the English text, marked with `lang="en"`, and a short note that the page isn't translated yet. `npm run check:messages` lists missing and stray files.
- **Landing page texts** are messages as well, in a namespace of the landing's own (the example uses `LabLandings.scroll-gradient`).
- The texts of the `/lab` heading are `Lab.Overview`, those of the homepage teaser `Lab` (`title`, `text`, `cta`), the link texts `Lab.links`, and the project pages' back link and fallback note `Lab.Detail`.

### Markdown pages

The markdown is rendered on the server while the site is built; no markdown or highlighting code reaches the browser.

- GitHub-flavoured markdown: headings, lists, tables, task lists, blockquotes, links, images, code.
- Code blocks with a language (```` ```js ````) are highlighted at build time; the token colours are theme colours (see "Code highlighting" in `app/globals.css`), so they follow the palette and the colour mode.
- Start headings at `##`: the project's title is the page's only `h1` (a `#` in the markdown is shown as an `h2`).
- Links starting with `/` get the language prefix (`/lab/scroll-gradient` becomes `/de/lab/scroll-gradient` on the German page); external links open in a new tab.
- Raw HTML in the markdown is ignored, so a content file can't inject markup or scripts.

### Landing pages

A landing page is a React component in `components/lab/landings/`, registered under the project's id in `components/lab/landings/index.jsx`. It receives `project` (its entry in `config/lab.js`) and renders the page's content; the site's header and footer are around it. `ScrollGradient.jsx` is the example. Building blocks it uses that other landings can use too:

- `BackLink` (components/lab/BackLink.jsx) – "All projects", back to `/lab`
- `ProjectLinkButtons` (components/lab/ProjectLinkButtons.jsx) – the project's links from `config/lab.js` as buttons
- `CodeBlock` (from components/lab/Markdown.jsx) – a code example, highlighted at build time like in markdown

All project pages share one route (`app/[locale]/lab/[slug]`), so client code that a landing imports directly is loaded on every project page. For the usual landing (texts, images, small interactive parts that other pages use anyway) that doesn't matter. A landing with a **heavy interactive part** – a 3D scene, a chart library, a big animation library – should load that part with `next/dynamic` from a small client component (`'use client'`): it then gets its own chunk, loaded only on the page that shows it, and is still rendered on the server.

```jsx
// components/lab/landings/MyDemoLoader.jsx
'use client';
import dynamic from 'next/dynamic';

const MyDemo = dynamic(() => import('./MyDemo')); // heavy library only in this chunk
export default function MyDemoLoader(props) {
    return <MyDemo {...props} />;
}
```

### Search engines

`/lab` and every project page have a translated title and description (for project pages: the card's texts), a canonical URL and `hreflang` links to all languages. A project page's link-preview image is the project's `image` (the site-wide one otherwise). The sitemap lists `/lab` and all project pages in every language, only while the lab is on. Unknown ids, card-only projects and switched-off projects are 404s.

### Switching the lab on and off

`npm run setup`, step "Lab", switches the page and the homepage section together. By hand: `enabled: false` on `pages.lab` and on the `lab` section in `config/pages.js` (remove both to switch it on again). Nothing else needs to change: the projects and their files stay for later. `npm run check:config` reports a lab section that is on while the page is off.

### Adding a project

1. **Pick an id** – lowercase letters, digits and hyphens; it becomes the URL `/lab/<id>`.
2. **Add the project to `config/lab.js`** (`labProjects`): the id, its `links`, optionally an `image` (put the file into `public/images/lab/`, 16:10 works best) and `featured: true` to show it on the homepage.
3. **Add its card texts** to `messages/en.json` under `Lab.projects.<id>`, and to the other languages:
   ```json
   "my-project": {
       "title": "My Project",
       "description": "One or two sentences: what it is and why it exists.",
       "tags": ["Open Source", "TypeScript"]
   }
   ```
4. **Choose its kind** (`detail`):
   - **Card only:** leave `detail` out. Done.
   - **Markdown page:** set `detail: 'markdown'` and write `content/lab/<id>/en.md` (plus `de.md`, … for the other languages; until then they show the English text). Start headings at `##`; title, description, tags, links and image are added by the template.
   - **Landing page:** set `detail: 'landing'`, create the component in `components/lab/landings/` (start from a copy of `ScrollGradient.jsx`), register it under the id in `components/lab/landings/index.jsx`, and put its texts into the messages, e.g. under `LabLandings.<id>`.
5. **Check it:** `npm run check` (reports missing texts, files, images, an unregistered landing page, …), then `npm run dev` and open `/lab` and `/lab/<id>`.

To remove a project, delete its entry from `config/lab.js` (and its texts and files), or set `enabled: false` to hide it for now.

## Theme

All colours live in `config/theme.js`. The palette is small on purpose: a few **base colours** per colour mode and a few **shades** derived from them by mixing, so a different palette is a change to a handful of values and everything else follows. `npm run setup` can write one of four example themes (Nova, Editorial, Atelier, Dusk – `scripts/setup/themes.mjs`) into this file as a starting point.

Base colours (`theme.colors.dark`, `theme.colors.light`):

| Token | Used for |
|---|---|
| `background`, `foreground`, `contrast` | page background; body text; the highest-contrast colour (white on a dark theme) for headings and, with alpha, hairline borders and card fills (`border-contrast/10`). Text on a contrast-coloured surface uses `background`. |
| `primary`, `accent`, `secondary`, `tertiary`, `on-brand` | brand colours: buttons and focus rings; icons, badges, tags and glows; highlighted words and hover colour; end colour of the highlight gradient; text on brand-coloured surfaces (CTA buttons) |
| `success`, `error`, `whatsapp` | status colours |

Derived shades (`theme.shades`), each defined as a base colour mixed towards another colour, e.g. `surface: { base: 'background', mix: 'contrast', amount: 0.04 }`:

| Token | Used for |
|---|---|
| `surface`, `surface-deep` | alternating sections and cards; the emphasised dark panel (pricing card) |
| `muted`, `muted-strong` | secondary text; small labels and inactive icons |

Shades are used exactly like base colours (`bg-surface`, `text-muted`) and follow the same rule in every mode. To pin a shade to a specific value in one mode, add it to that mode's palette – an explicit colour wins over the derived one.

### Colour modes

`theme.colors` holds one palette per mode, `dark` and/or `light`; `theme.colorMode` decides how they are used:

| Setup | `colors` | `colorMode` |
|---|---|---|
| dark only / light only | one palette | – |
| system preference | both | `{ default: 'system', toggle: false }` – follows the operating system, incl. live changes |
| system preference + toggle | both | `{ default: 'system', toggle: true }` – plus a dark/light switch in the header, mobile menu and footer |

`default: 'dark'` or `'light'` with both palettes starts fixed (combine with `toggle: true`, or keep the second palette just for pinned sections, see below). The toggle stores the visitor's choice in `localStorage` (key `color-mode`, no cookie). The privacy policy covers this automatically: the `Privacy.colorMode` paragraph in the messages is appended to the "Data collection" section only when the toggle is enabled (`extraParagraphs` on the privacy page in `config/pages.js`). Without the toggle nothing is stored and nothing is shown.

Under the hood the root layout inlines one set of CSS variables per mode, switched by `data-color-mode` on `<html>`, which an inline script sets before the first paint (no flash of the wrong mode). Components don't need to know about modes: every token simply resolves to the current palette. Where a component must differ per mode, Tailwind's `dark:` and `light:` variants are available; they follow the site's mode.

A section can be **pinned to one mode**: the homepage hero is pinned dark by default (`colorMode: 'dark'` on its entry in `config/pages.js`), because its footage is dark and a light overlay would wash it out; the floating header over it takes the same mode. Set `colorMode: 'auto'` to let the hero follow the site, or `'light'` to pin it light. The price card on `/starter` can be pinned the same way (`cardColorMode` on the `starter-pricing` entry; it follows the site by default). A pin is ignored when that palette isn't configured. To pin anything else, spread `colorModeAttribute(mode)` from `config/theme.js` onto the element.

`npm run check:config` validates the modes: every palette defines the same base colours, shades and gradients resolve in every mode, and `colorMode.default` / `toggle` match the configured palettes.

Named gradients (`highlight`, `highlight-alt`, `highlight-mix`, `brand`, `cta`, `cta-animated`, `card-glow`) are lists of tokens.

The root layout exposes every token as a CSS variable holding its colour channels (`--color-background: 13 17 23`), Tailwind generates its utilities from those variables (`bg-surface`, `text-accent`, `border-contrast/10`, `bg-gradient-highlight`), and components never use raw colour values. In plain CSS use `rgb(var(--color-background))` or, with alpha, `rgb(var(--color-contrast) / 0.1)`. For inline styles `config/theme.js` exports `colorVar(token, alpha?)` and `gradientVar(name, direction?)`, which build the same references; the server-rendered OG image, which can't use CSS variables, uses the static hex helpers (`colors`, `withAlpha()`, `gradientCss()`) with the palette of the default mode (the first one with `'system'`).

Fonts are loaded in `config/fonts.js` (`next/font` needs literal arguments there, which is why they are not in `theme.js`) and assigned to the `body` and `heading` roles in `config/theme.js`, each as `{ family: 'var(--font-…)', fallback: 'sans-serif' | 'serif' | … }`; the fallback is the generic family used until the font has loaded, so a serif heading font gets `serif`.

## Languages

All texts live in one JSON file per language in `messages/`, grouped by section (`Hero`, `Services`, `Starter.Faq`, `Impressum`, …). Components contain no text of their own. The one exception are the lab's markdown project pages: one file per language in `content/lab/<id>/` (see [Texts and languages](#texts-and-languages)), with the same fallback to the default language.

- If a text is missing in a language file, the default language's text (`messages/en.json`) is shown instead, so an incomplete translation never shows raw keys like `Nav.services`. This also means you can translate a new language step by step. `npm run check:messages` lists what is still missing. (A text missing in `en.json` itself has nothing to fall back to and would show its key.)
- The default language (English) has no URL prefix: `/`, `/starter`, `/impressum`. Other languages are prefixed: `/de`, `/de/starter`.
- The language is determined only by the URL. No cookie is set and the browser language is not detected, so no cookie consent is needed. Visitors switch with the language switcher in the header and footer.
- Every page has a translated title and description, a canonical URL and `hreflang` links to all language versions, and the sitemap (`/sitemap.xml`) lists every page in every language, so search engines can send visitors to the right version.

### Adding a language

`npm run setup` (step "Languages") does the following for you; by hand:

1. Add the language code and its display name in `i18n/routing.js`:
   ```js
   export const locales = ['en', 'de', 'fr'];
   export const localeNames = { en: 'English', de: 'Deutsch', fr: 'Français' };
   ```
2. Copy `messages/en.json` to `messages/fr.json` and translate the values (keep the keys). Untranslated texts show in English until you get to them.
3. Optionally translate the lab's markdown pages: `content/lab/<id>/en.md` to `content/lab/<id>/fr.md`. Until then they show the English text.
4. Run `npm run check:messages` to see what is left.

That's it: routes, the language switcher, metadata, `hreflang` links and the sitemap pick up the new language automatically. With more than three languages, the switcher in the header turns into a dropdown by itself.

### Writing texts

- Placeholders like `{name}`, `{phone}` and `{email}` are filled from `config/site.js`.
- Highlighted words are marked with tags, e.g. `"Recent <highlight>Work</highlight>"`. The component decides how a tag looks, the translation decides which words get it. Line breaks are written as `<br></br>`.
- Lists such as services, process steps and projects are keyed by the ids used in `config/pages.js` (lab projects: `config/lab.js`); FAQ items and the pricing features are plain arrays in the messages.
- The legal pages (`Impressum`, `Privacy`) are a list of sections, each with a title and paragraphs. Paragraphs may use `<strong>`, `<br></br>` and `<impressum>…</impressum>` for a link to the Impressum. Add or remove sections as you need (e.g. a VAT ID section).

## Adding a section type

1. Create the component in `components/sections/`. It receives `id` and `namespace` plus whatever you put on its config entry; use `requireProp` for data that must come from the config (see `Services.jsx` for the pattern).
2. Register it in `components/sections/index.jsx` (statically, or with `next/dynamic` if it pulls in a heavy library).
3. Add its texts to the messages and, if you want `check:config` to validate its data, a check in `scripts/check-config.mjs`.

## Visual regression check

`npm run visual:update` records full-page screenshots of every page (incl. `/lab` and the two example project pages; both languages, every configured colour mode, desktop and mobile) into `.snapshots/`; `npm run visual` compares the current build against them with zero tolerance. Useful when refactoring or touching the theme. Needs `npx playwright install chromium` once; the snapshots are machine-specific and not committed.

## Structure

- `config/`: everything that changes per site – `site.js` (brand, contact, socials, assets, forms), `pages.js` (pages, sections, data, navigation), `lab.js` (lab projects and link types), `theme.js` (colours, gradients, font roles), `fonts.js`, `logo.jsx`, `icons.js`
- `messages/`: one JSON file per language with all texts
- `content/lab/`: the markdown of the lab's project pages, `<id>/<language>.md`
- `app/[locale]/`: routes (`/`, `/starter`, `/lab`, `/lab/[slug]` for the project pages, `/impressum`, `/privacy`), the root layout with site-wide metadata, and the 404 page; `app/actions.js`: the contact-form server action; `app/sitemap.js`, `app/robots.js`
- `components/sections/`: the section components and the registry (`index.jsx`); `starter-package/` holds the `/starter` sections
- `components/lab/`: the lab's project card, the project page template, the markdown renderer (`Markdown.jsx`, `CodeBlock`), the markdown loader with language fallback (`content.js`), shared pieces (`BackLink`, `ProjectLinkButtons`) and the landing pages with their registry (`landings/`)
- `components/`: `Page` (renders a page from its config), `SiteShell` (header, main, footer and providers around a page's content), `Header`, `Footer`, `LegalPage`, `ContactOverlay` + provider, `LanguageSwitcher`, `ColorModeSwitcher` + `ColorModeProvider` (`useColorMode`), `Logo`; `ui/` for buttons, gradient text, glows
- `i18n/`: language list (`routing.js`), locale-aware links (`navigation.js`), message loading with fallback (`request.js`), SEO helpers incl. `pageMetadata` (`metadata.js`)
- `middleware.js`: adds the language prefix to URLs
- `scripts/`: `check-config.mjs`, `check-messages.mjs`; `setup/`: the setup assistant (`index.mjs`, one module per step in `steps/`, the example themes in `themes.mjs`, the comment-preserving config editor in `source.mjs`, tests in `tests/`)
- `tests/visual.spec.js`, `playwright.config.js`: visual regression screenshots
- `public/`: images, videos and favicons

## License

MIT, see [LICENSE](LICENSE). The bundled fonts in `app/fonts/` (Inter, Manrope, DM Sans, Fraunces, Lora) are under the SIL Open Font License; each licence sits next to its font file.
