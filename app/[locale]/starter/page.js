import { getTranslations, setRequestLocale } from 'next-intl/server';
import StarterPackagePage from "@/components/starter-package/StarterPackagePage";
import ScrollFadeProvider from "@/components/ui/ScrollFadeProvider";
import { siteConfig } from "@/config/site";
import { getAlternates, localizedUrl, getOgLocale, getOgAlternateLocales } from "@/i18n/metadata";

// The layout's title template appends " | <site name>". The Open Graph image comes from ./opengraph-image.jsx.
export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata.Starter' });

    return {
        title: t('title'),
        description: t('description'),
        alternates: getAlternates('/starter', locale),
        openGraph: {
            title: t('title'),
            description: t('description'),
            url: localizedUrl('/starter', locale),
            siteName: siteConfig.name,
            locale: getOgLocale(locale),
            alternateLocale: getOgAlternateLocales(locale),
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: t('title'),
            description: t('description'),
        },
    };
}

export default async function Page({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <ScrollFadeProvider>
            <StarterPackagePage />
        </ScrollFadeProvider>
    )
}
