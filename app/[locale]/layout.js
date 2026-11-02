import "../globals.css";
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { localizedUrl, getOgLocale, getOgAlternateLocales } from '@/i18n/metadata';
import { siteConfig } from '@/config/site';
import { pages } from '@/config/pages';
import { fontVariables } from '@/config/fonts';
import { themeCss, colorModeScript, resolveColors, colorModes, followsSystemColorMode, hasColorModeScript, staticColorMode, COLOR_MODE_ATTRIBUTE } from '@/config/theme';
import ColorModeProvider from '@/components/ColorModeProvider';

const siteUrl = siteConfig.url

// Site-wide SEO metadata, translated per language. Pages add their own title, description and alternates.
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: pages.home.metadata });
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
      url: localizedUrl(pages.home.path, locale),
      siteName: name,
      images: [
        {
          url: siteConfig.assets.ogImage.src,
          width: siteConfig.assets.ogImage.width,
          height: siteConfig.assets.ogImage.height,
          alt: t('ogImageAlt', { name }),
        },
      ],
      locale: getOgLocale(locale),
      alternateLocale: getOgAlternateLocales(locale),
      type: 'website',
    },
    // Favicons (config/site.js)
    icons: siteConfig.assets.favicons,

    // Twitter-specific metadata for sharing on X
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle', { name }),
      description: t('description'),
      images: [siteConfig.assets.ogImage.src],
    },
  };
}

// Browser chrome colour (address bar on mobile): one entry per colour mode, picked by the OS
// preference; ColorModeProvider updates it when the visitor toggles.
export function generateViewport() {
  const themeColor = followsSystemColorMode
    ? colorModes.map((mode) => ({ media: `(prefers-color-scheme: ${mode})`, color: resolveColors(mode).background }))
    : resolveColors(staticColorMode).background;
  return { themeColor };
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

  // Colour mode (config/theme.js): a fixed mode is set on <html> here; otherwise the inline
  // script below picks the OS-preferred or stored mode before the first paint.
  const htmlAttributes = hasColorModeScript ? { suppressHydrationWarning: true } : { [COLOR_MODE_ATTRIBUTE]: staticColorMode };

  return (
    <html lang={locale} className="scroll-smooth" {...htmlAttributes}>
      <head>
        {/* Theme colours as CSS variables (--color-<token>: r g b) per mode; Tailwind and plain CSS read them. */}
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
        {hasColorModeScript && <script dangerouslySetInnerHTML={{ __html: colorModeScript() }} />}
      </head>
      <body className={`${fontVariables} bg-background font-sans text-foreground antialiased`}>
        <NextIntlClientProvider>
          <ColorModeProvider>
            {children}
          </ColorModeProvider>
        </NextIntlClientProvider>
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script defer src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL} data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID} />
        )}
      </body>
    </html>
  );
}
