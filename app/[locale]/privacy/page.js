import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import LegalPage from "@/components/LegalPage";
import { pages, isEnabled } from "@/config/pages";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return pageMetadata(locale, pages.privacy);
}

export default async function PrivacyPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);

    if (!isEnabled(pages.privacy)) notFound();

    return <LegalPage page={pages.privacy} />;
}
