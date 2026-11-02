# Studio site template

A config-driven one-page website template for a small web design & development studio, with a separate `/starter` offer page and Impressum/privacy pages. Built with Next.js 15 (App Router), Tailwind CSS and Framer Motion. Multilingual out of the box (English and German included), powered by [next-intl](https://next-intl.dev).

Everything that differs from client to client lives in `config/` and `messages/`: brand and contact details, theme, fonts, logo, which sections appear on which page and in which order, their data (images, links, icons, steps), the navigation and all texts. Components don't need to be touched to set up a new site.

The brand ("Nova Studio"), logo, images, videos, client projects and legal details are placeholders.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
|---|---|
| `npm run build` | production build |
| `npm run lint` | ESLint |
| `npm run check` | runs both checks below |
| `npm run check:config` | validates `config/` against the messages and `public/` (unknown section types or icons, missing files, ids without texts, duplicate anchors, …). Exits with 1 on errors |
| `npm run check:messages` | compares the language files and warns about missing or extra texts (never fails; missing texts fall back to English at runtime) |
| `npm run visual` / `visual:update` | visual regression screenshots, see below |

No environment variables are needed to run the site. To make the contact forms actually send mail through [Resend](https://resend.com), copy `.env.example` to `.env.local` and set a real `RESEND_API_KEY` and `NOTIFICATION_EMAIL`; without them, submitting a form shows an error message. Analytics (Umami) only loads when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set; when it is, the privacy policy automatically shows a paragraph about Umami.

## Setting up a new site

Clone the template once per client, then work through `config/` top to bottom:

1. **`config/site.js`** – name, URL, contact details, social links, favicons, link-preview image, notification-mail subjects.
2. **`config/theme.js`** – colours (dark and/or light palette), gradients, font roles. **`config/fonts.js`** – the font files (see the comments there for local, static-weight and Google fonts).
3. **`config/logo.jsx`** – replace the placeholder mark with the client's logo (SVG or `<img>`). Swap the favicons in `public/favicon/` and `app/favicon.ico`, and the preview image `public/og-image-2.png`.
4. **`config/pages.js`** – compose the pages: which sections in which order, their data, the hero background, the navigation. Disable pages you don't need (`enabled: false`).
5. **`config/icons.js`** – only if a section needs an icon that isn't registered yet.
6. **`public/images/`** – the images and videos referenced from `config/pages.js`.
7. **`messages/en.json`, `messages/de.json`** – all texts, incl. page titles/descriptions (`Metadata`) and the legal pages (`Impressum`, `Privacy`). Remove the languages you don't need in `i18n/routing.js`.
8. `npm run check` and `npm run build`.

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
        { type: 'process', nav: { label: 'process' }, steps: ['discover', 'design', 'develop', 'deploy'] },
        { type: 'about', nav: { label: 'about' }, image: '/images/about/portrait-placeholder.jpg' },
        { type: 'contact', nav: { label: 'contact', footer: false } },
    ],
},
starter:   { path: '/starter', metadata: 'Metadata.Starter', enabled: true, sections: [ … ] },
impressum: { path: '/impressum', type: 'legal', namespace: 'Impressum', nav: { label: 'impressum', header: false, footer: 'legal' } },
```

- **Sections** are rendered in the listed order. The available types are registered in `components/sections/index.jsx`: `hero`, `intro`, `services`, `work`, `process`, `lab`, `about`, `contact` for the homepage and `starter-hero`, `starter-who-is-this-for`, `starter-pricing`, `starter-roadmap`, `starter-faq`, `starter-contact`, `starter-tech-specs` for the offer page. Any type can be used on any page.
- A section's **`id`** (defaults to its type) is its anchor (`/#services`) and must be unique per page.
- **`nav`** puts a section (or a page) into the navigation: `label` is a key in the `Nav` messages; `header: false` hides it from the header, `footer: false` from the footer, `footer: 'legal'` puts it into the footer's small-print row. Header and footer are generated from this, nothing is hardcoded.
- **Data** (items, projects, steps, cards, criteria, images, links) sits on the section entry and is passed to the component as props. The texts live in the messages under the section's namespace, keyed by `id` (e.g. `Services.items.websites`). `namespace` overrides the default namespace when the same type is used twice.
- **Icons** are referenced by name (`icon: 'rocket'`) and registered in `config/icons.js`: custom SVG paths or anything from [lucide](https://lucide.dev), imported there once.
- **`enabled: false`** switches a page off: 404, not in the sitemap, not in the navigation. **`previewImage: false`** leaves the link-preview image to a route's own `opengraph-image` file (as for `/starter`).
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

## Theme

All colours live in `config/theme.js`. The palette is small on purpose: a few **base colours** per colour mode and a few **shades** derived from them by mixing, so a different palette is a change to a handful of values and everything else follows.

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

Fonts are loaded in `config/fonts.js` (`next/font` needs literal arguments there, which is why they are not in `theme.js`) and assigned to the `body` and `heading` roles in `config/theme.js`.

## Languages

All texts live in one JSON file per language in `messages/`, grouped by section (`Hero`, `Services`, `Starter.Faq`, `Impressum`, …). Components contain no text of their own.

- If a text is missing in a language file, the default language's text (`messages/en.json`) is shown instead, so an incomplete translation never shows raw keys like `Nav.services`. This also means you can translate a new language step by step. `npm run check:messages` lists what is still missing. (A text missing in `en.json` itself has nothing to fall back to and would show its key.)
- The default language (English) has no URL prefix: `/`, `/starter`, `/impressum`. Other languages are prefixed: `/de`, `/de/starter`.
- The language is determined only by the URL. No cookie is set and the browser language is not detected, so no cookie consent is needed. Visitors switch with the language switcher in the header and footer.
- Every page has a translated title and description, a canonical URL and `hreflang` links to all language versions, and the sitemap (`/sitemap.xml`) lists every page in every language, so search engines can send visitors to the right version.

### Adding a language

1. Add the language code and its display name in `i18n/routing.js`:
   ```js
   export const locales = ['en', 'de', 'fr'];
   export const localeNames = { en: 'English', de: 'Deutsch', fr: 'Français' };
   ```
2. Copy `messages/en.json` to `messages/fr.json` and translate the values (keep the keys). Untranslated texts show in English until you get to them.
3. Run `npm run check:messages` to see what is left.

That's it: routes, the language switcher, metadata, `hreflang` links and the sitemap pick up the new language automatically. With more than three languages, the switcher in the header turns into a dropdown by itself.

### Writing texts

- Placeholders like `{name}`, `{phone}` and `{email}` are filled from `config/site.js`.
- Highlighted words are marked with tags, e.g. `"Recent <highlight>Work</highlight>"`. The component decides how a tag looks, the translation decides which words get it. Line breaks are written as `<br></br>`.
- Lists such as services, process steps and projects are keyed by the ids used in `config/pages.js`; FAQ items and the pricing features are plain arrays in the messages.
- The legal pages (`Impressum`, `Privacy`) are a list of sections, each with a title and paragraphs. Paragraphs may use `<strong>`, `<br></br>` and `<impressum>…</impressum>` for a link to the Impressum. Add or remove sections as you need (e.g. a VAT ID section).

## Adding a section type

1. Create the component in `components/sections/`. It receives `id` and `namespace` plus whatever you put on its config entry; use `requireProp` for data that must come from the config (see `Services.jsx` for the pattern).
2. Register it in `components/sections/index.jsx` (statically, or with `next/dynamic` if it pulls in a heavy library).
3. Add its texts to the messages and, if you want `check:config` to validate its data, a check in `scripts/check-config.mjs`.

## Visual regression check

`npm run visual:update` records full-page screenshots of every page (both languages, every configured colour mode, desktop and mobile) into `.snapshots/`; `npm run visual` compares the current build against them with zero tolerance. Useful when refactoring or touching the theme. Needs `npx playwright install chromium` once; the snapshots are machine-specific and not committed.

## Structure

- `config/`: everything that changes per site – `site.js` (brand, contact, socials, assets, forms), `pages.js` (pages, sections, data, navigation), `theme.js` (colours, gradients, font roles), `fonts.js`, `logo.jsx`, `icons.js`
- `messages/`: one JSON file per language with all texts
- `app/[locale]/`: routes (`/`, `/starter`, `/impressum`, `/privacy`), the root layout with site-wide metadata, and the 404 page; `app/actions.js`: the contact-form server action; `app/sitemap.js`, `app/robots.js`
- `components/sections/`: the section components and the registry (`index.jsx`); `starter-package/` holds the `/starter` sections
- `components/`: `Page` (renders a page from its config), `Header`, `Footer`, `LegalPage`, `ContactOverlay` + provider, `LanguageSwitcher`, `ColorModeSwitcher` + `ColorModeProvider` (`useColorMode`), `Logo`; `ui/` for buttons, gradient text, glows
- `i18n/`: language list (`routing.js`), locale-aware links (`navigation.js`), message loading with fallback (`request.js`), SEO helpers incl. `pageMetadata` (`metadata.js`)
- `middleware.js`: adds the language prefix to URLs
- `scripts/`: `check-config.mjs`, `check-messages.mjs`
- `tests/visual.spec.js`, `playwright.config.js`: visual regression screenshots
- `public/`: images, videos and favicons

## License

MIT, see [LICENSE](LICENSE). The bundled fonts in `app/fonts/` (Inter, Manrope, DM Sans, Fraunces, Lora) are under the SIL Open Font License; each licence sits next to its font file.
