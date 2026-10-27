# Studio site template

A one-page website template for a small web design & development studio, with a separate `/starter` offer page. Built with Next.js 15 (App Router), Tailwind CSS and Framer Motion.

The brand ("Nova Studio"), logo, images, videos, client projects and legal details are placeholders.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

- `npm run build` creates a production build.
- `npm run lint` runs ESLint.

No environment variables are needed to run the site. To make the contact forms actually send mail through [Resend](https://resend.com), copy `.env.example` to `.env.local` and set a real `RESEND_API_KEY` and `NOTIFICATION_EMAIL`; without them, submitting a form shows an error message. Analytics (Umami) only loads when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set.

## Make it yours

1. Set your brand name, URL, contact details and social links in `config/site.js`.
2. Replace the placeholder mark in `components/Logo.jsx` with your logo, and the icons in `public/favicon/` and `app/favicon.ico`.
3. Swap the images and videos in `public/images/` and the link-preview image `public/og-image-2.png`.
4. Edit the texts in the section components and fill in your details on the Impressum and privacy pages.

## Structure

- `app/`: routes (`/`, `/starter`, `/impressum`, `/privacy`), root layout and the contact server action
- `components/`: page sections (Hero, Services, Work, Process, About, Contact, …) and `starter-package/` for the `/starter` page
- `config/site.js`: brand name, site URL, contact details and social links (start here to make it yours)
- `public/`: images, videos and favicons

## License

MIT, see [LICENSE](LICENSE). The bundled Inter font is under the SIL Open Font License.
