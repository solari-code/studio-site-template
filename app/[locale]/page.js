import { setRequestLocale } from 'next-intl/server';
import { getAlternates } from '@/i18n/metadata';
import Page from '@/components/Page';
import { pages } from '@/config/pages';

// Title, description and Open Graph come from the layout; the homepage only adds its canonical/hreflang links.
export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    alternates: getAlternates(pages.home.path, locale),
  };
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Page page={pages.home} />;
}
