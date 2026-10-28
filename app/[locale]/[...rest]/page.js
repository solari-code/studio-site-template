import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

// Catches every unknown path inside a locale (e.g. /de/unknown) and renders
// app/[locale]/not-found.js within the locale layout.
export default async function CatchAllPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);

    notFound();
}
