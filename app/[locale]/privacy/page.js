import { getTranslations, setRequestLocale } from 'next-intl/server';
import PrivacyPage from "@/components/Privacy";
import { siteConfig } from "@/config/site";
import { getAlternates, localizedUrl, getOgLocale, getOgAlternateLocales } from "@/i18n/metadata";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata.Privacy' });

    return {
        title: t('title'),
        description: t('description', { name: siteConfig.name }),
        alternates: getAlternates('/privacy', locale),
        openGraph: {
            title: t('title'),
            description: t('description', { name: siteConfig.name }),
            url: localizedUrl('/privacy', locale),
            siteName: siteConfig.name,
            locale: getOgLocale(locale),
            alternateLocale: getOgAlternateLocales(locale),
            type: "website",
        },
    };
}

export default async function Page({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <PrivacyPage />
}
