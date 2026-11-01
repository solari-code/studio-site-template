import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import Page from "@/components/Page";
import { pages, isEnabled } from "@/config/pages";
import { pageMetadata } from "@/i18n/metadata";

// Title, description, canonical/hreflang and Open Graph from config/pages.js + messages.
// The Open Graph image comes from ./opengraph-image.jsx.
export async function generateMetadata({ params }) {
    const { locale } = await params;
    return pageMetadata(locale, pages.starter);
}

export default async function StarterPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);

    // `enabled: false` in config/pages.js switches the page off.
    if (!isEnabled(pages.starter)) notFound();

    return <Page page={pages.starter} />;
}
