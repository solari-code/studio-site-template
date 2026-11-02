import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LegalHeader from '@/components/LegalHeader';
import Footer from '@/components/Footer';
import { siteConfig } from '@/config/site';
import { pages } from '@/config/pages';

/**
 * Shared layout for the legal pages (`type: 'legal'` in config/pages.js).
 * The content comes from messages: `<namespace>.title`, an optional `note`, and `sections`,
 * an array of `{ title, paragraphs: [] }`. Paragraphs may use <strong>, <br></br>,
 * <impressum>…</impressum> (link to the Impressum) and the placeholders {name}, {phone}, {email}.
 *
 * Content that depends on configuration lives in separate keys of the namespace:
 * `page.extraSections` lists keys of additional `{ title, paragraphs }` objects rendered after the
 * regular sections; `page.extraParagraphs` maps a section index to keys of `{ paragraphs }` objects
 * whose paragraphs are appended to that section (e.g. `{ 2: ['colorMode'] }`).
 */
const LegalPage = ({ page }) => {
    const { namespace, extraSections = [], extraParagraphs = {} } = page;
    const t = useTranslations(namespace);

    // Message paths of all sections to render, in order: sections.0, sections.1, ..., then the extras
    const sectionPaths = [
        ...t.raw('sections').map((_, i) => `sections.${i}`),
        ...extraSections,
    ];

    // Message paths of a section's paragraphs, followed by the extra paragraphs configured for it
    const paragraphPaths = (path, index) => [
        ...t.raw(`${path}.paragraphs`).map((_, j) => `${path}.paragraphs.${j}`),
        ...(extraParagraphs[index] ?? []).flatMap((key) => t.raw(`${key}.paragraphs`).map((_, j) => `${key}.paragraphs.${j}`)),
    ];

    const richOptions = {
        name: siteConfig.name,
        phone: siteConfig.contact.phone,
        email: siteConfig.contact.email,
        strong: (chunks) => <strong>{chunks}</strong>,
        br: () => <br />,
        impressum: (chunks) => <Link href={pages.impressum?.path ?? '/impressum'} className="text-secondary hover:underline">{chunks}</Link>,
    };

    return (
        <div className="bg-background min-h-screen text-foreground font-sans">
            <LegalHeader />
            <main className="container mx-auto px-6 py-16 lg:py-24">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold text-contrast mb-8">{t('title')}</h1>

                    <div className="space-y-6 text-muted">
                        {t('note') && (
                            <p className="text-sm italic text-muted/80">{t('note')}</p>
                        )}

                        {sectionPaths.map((path, i) => (
                            <section key={path} className="space-y-6">
                                <h2 className={`text-2xl font-semibold text-contrast ${i > 0 || t('note') ? 'mt-8' : ''}`}>{t(`${path}.title`)}</h2>
                                {paragraphPaths(path, i).map((paragraph) => (
                                    <p key={paragraph}>{t.rich(paragraph, richOptions)}</p>
                                ))}
                            </section>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default LegalPage;
