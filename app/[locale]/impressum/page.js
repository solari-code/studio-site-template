import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import LegalPage from "@/components/LegalPage";
import { pages, isEnabled } from "@/config/pages";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return pageMetadata(locale, pages.impressum);
}

export default async function ImpressumPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);

    if (!isEnabled(pages.impressum)) notFound();

    return <LegalPage page={pages.impressum} />;
}
