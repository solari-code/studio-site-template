import localFont from "next/font/local";
import "./globals.css";
import Script from 'next/script';
import { siteConfig } from '@/config/site';

// Inter is bundled locally (app/fonts, SIL OFL) so builds don't need to reach Google Fonts.
const inter = localFont({
  src: './fonts/InterVariable-latin.woff2',
  weight: '100 900',
  variable: '--font-inter',
});

const siteUrl = siteConfig.url
// SEO Metadata Configuration
export const metadata = {
  // The base URL for your site, used for resolving open graph and other URLs
  metadataBase: new URL(siteUrl),

  // Title of the page, crucial for search results
  title: {
    default: `${siteConfig.name} | Web Design & Development Studio`,
    template: `%s | ${siteConfig.name}`,
  },

  description: "An independent web design & development studio. Websites, shops and web apps for small businesses, from a first landing page to a full product.",
  keywords: ['Web Development', 'App Development', 'SaaS', 'UI/UX Design', 'Graphic Design', 'React', 'Next.js', 'Digital Studio', 'Engineering'],
  creator: siteConfig.name,

  // Open Graph metadata for rich sharing on social platforms like Facebook, LinkedIn
  openGraph: {
    title: `${siteConfig.name} | Ideas, Built to Last`,
    description: 'An independent web design & development studio. Websites, shops and web apps for small businesses, from a first landing page to a full product.',
    url: siteUrl,
    siteName: siteConfig.name,
    images: [
      {
        url: '/og-image-2.png',
        width: 1200,
        height: 630,
        alt: `Abstract background with the ${siteConfig.name} logo`,
      },
    ],
    locale: 'en_US',
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
    title: `${siteConfig.name} | Ideas, Built to Last`,
    description: 'An independent web design & development studio. Websites, shops and web apps for small businesses, from a first landing page to a full product.',
    images: ['/og-image-2.png'],
  },

  // Defines alternate language versions of the page
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/'
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} bg-brand-dark font-sans text-brand-light antialiased`}>
        {children}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script defer src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL} data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID} />
        )}
      </body>
    </html>
  );
}
