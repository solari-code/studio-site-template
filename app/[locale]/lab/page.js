import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import Page from "@/components/Page";
import { pages, isEnabled } from "@/config/pages";
import { pageMetadata } from "@/i18n/metadata";

// The lab overview. Title, description, canonical/hreflang and Open Graph from config/pages.js + messages;
// the projects from config/lab.js.
export async function generateMetadata({ params }) {
    const { locale } = await params;
    return pageMetadata(locale, pages.lab);
}

export default async function LabPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);

    // `enabled: false` in config/pages.js switches the lab off (npm run setup, step "Lab", does this).
    if (!isEnabled(pages.lab)) notFound();

    return <Page page={pages.lab} />;
}
