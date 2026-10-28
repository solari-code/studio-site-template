import localFont from "next/font/local";
import "../globals.css";
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { localizedUrl, getOgLocale, getOgAlternateLocales } from '@/i18n/metadata';
import { siteConfig } from '@/config/site';

// Inter is bundled locally (app/fonts, SIL OFL) so builds don't need to reach Google Fonts.
const inter = localFont({
  src: '../fonts/InterVariable-latin.woff2',
  weight: '100 900',
  variable: '--font-inter',
});

const siteUrl = siteConfig.url

// Site-wide SEO metadata, translated per language. Pages add their own title, description and alternates.
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.Home' });
  const name = siteConfig.name;

  return {
    // The base URL for your site, used for resolving open graph and other URLs
    metadataBase: new URL(siteUrl),

    // Title of the page, crucial for search results
    title: {
      default: t('title', { name }),
      template: `%s | ${name}`,
    },

    description: t('description'),
    keywords: t.raw('keywords'),
    creator: name,

    // Open Graph metadata for rich sharing on social platforms like Facebook, LinkedIn
    openGraph: {
      title: t('ogTitle', { name }),
      description: t('description'),
      url: localizedUrl('/', locale),
      siteName: name,
      images: [
        {
          url: '/og-image-2.png',
          width: 1200,
          height: 630,
          alt: t('ogImageAlt', { name }),
        },
      ],
      locale: getOgLocale(locale),
      alternateLocale: getOgAlternateLocales(locale),
      type: 'website',
    },
    // Favicons
    icons: {
      icon: [
        { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon/favicon-48x48.png', sizes: '48x48', type: 'image/png' }
      ],
      apple: '/favicon/apple-touch-icon.png'
    },

    // Twitter-specific metadata for sharing on X
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle', { name }),
      description: t('description'),
      images: ['/og-image-2.png'],
    },
  };
}

// Prerender every page once per language.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Lets next-intl know the locale without reading request headers, which keeps pages static.
  setRequestLocale(locale);

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`${inter.variable} bg-brand-dark font-sans text-brand-light antialiased`}>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script defer src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL} data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID} />
        )}
      </body>
    </html>
  );
}
