import { setRequestLocale } from 'next-intl/server';
import { getAlternates } from '@/i18n/metadata';
import HomePage from '@/components/HomePage';

// Title, description and Open Graph come from the layout; the homepage only adds its canonical/hreflang links.
export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    alternates: getAlternates('/', locale),
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePage />;
}
