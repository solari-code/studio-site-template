# Studio site template

A one-page website template for a small web design & development studio, with a separate `/starter` offer page. Built with Next.js 15 (App Router), Tailwind CSS and Framer Motion. Multilingual out of the box (English and German included), powered by [next-intl](https://next-intl.dev).

The brand ("Nova Studio"), logo, images, videos, client projects and legal details are placeholders.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

- `npm run build` creates a production build.
- `npm run lint` runs ESLint.
- `npm run check:messages` compares the language files and warns about missing or extra texts (never fails; missing texts fall back to English at runtime, see below).

No environment variables are needed to run the site. To make the contact forms actually send mail through [Resend](https://resend.com), copy `.env.example` to `.env.local` and set a real `RESEND_API_KEY` and `NOTIFICATION_EMAIL`; without them, submitting a form shows an error message. Analytics (Umami) only loads when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set; when it is, the privacy policy automatically shows a paragraph about Umami.

## Make it yours

1. Set your brand name, URL, contact details and social links in `config/site.js`.
2. Replace the placeholder mark in `components/Logo.jsx` with your logo, and the icons in `public/favicon/` and `app/favicon.ico`.
3. Swap the images and videos in `public/images/` and the link-preview image `public/og-image-2.png`.
4. Edit the texts in `messages/en.json` and `messages/de.json`. This includes all page texts, the page titles and descriptions (`Metadata`), and the Impressum and privacy pages (`Impressum`, `Privacy`), where you fill in your own details.
5. Run `npm run check:messages` to make sure both language files have the same keys.

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
- Lists such as services, process steps, projects and FAQ items are keyed by an id or listed as arrays; the matching icons, images and links stay in the components.
- The legal pages (`Impressum`, `Privacy`) are a list of sections, each with a title and paragraphs. Paragraphs may use `<strong>`, `<br></br>` and `<impressum>…</impressum>` for a link to the Impressum. Add or remove sections as you need (e.g. a VAT ID section).

## Structure

- `app/[locale]/`: routes (`/`, `/starter`, `/impressum`, `/privacy`), the root layout with site-wide metadata, and the 404 page
- `app/actions.js`: the contact-form server actions; `app/sitemap.js` and `app/robots.js`
- `components/`: page sections (Hero, Services, Work, Process, About, Contact, …), `starter-package/` for the `/starter` page, `LegalPage` for the legal pages and `LanguageSwitcher`
- `config/site.js`: brand name, site URL, contact details and social links (start here to make it yours)
- `i18n/`: language list (`routing.js`), locale-aware links (`navigation.js`), message loading with fallback to the default language (`request.js`) and SEO helpers (`metadata.js`)
- `messages/`: one JSON file per language with all texts
- `middleware.js`: adds the language prefix to URLs
- `scripts/check-messages.mjs`: compares the language files
- `public/`: images, videos and favicons

## License

MIT, see [LICENSE](LICENSE). The bundled Inter font is under the SIL Open Font License.
