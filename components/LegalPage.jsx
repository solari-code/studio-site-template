import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LegalHeader from '@/components/LegalHeader';
import Footer from '@/components/Footer';
import { siteConfig } from '@/config/site';

/**
 * Shared layout for the Impressum and privacy pages.
 * The content comes from messages: `<namespace>.title`, an optional `note`, and `sections`,
 * an array of `{ title, paragraphs: [] }`. Paragraphs may use <strong>, <br></br>,
 * <impressum>…</impressum> (link to the Impressum) and the placeholders {name}, {phone}, {email}.
 *
 * `extraSections` lists keys of additional `{ title, paragraphs }` objects in the namespace
 * that are rendered after the regular sections, e.g. for content that depends on configuration.
 */
const LegalPage = ({ namespace, extraSections = [] }) => {
    const t = useTranslations(namespace);

    // Message paths of all sections to render, in order: sections.0, sections.1, ..., then the extras
    const sectionPaths = [
        ...t.raw('sections').map((_, i) => `sections.${i}`),
        ...extraSections,
    ];

    const richOptions = {
        name: siteConfig.name,
        phone: siteConfig.contact.phone,
        email: siteConfig.contact.email,
        strong: (chunks) => <strong>{chunks}</strong>,
        br: () => <br />,
        impressum: (chunks) => <Link href="/impressum" className="text-brand-magenta hover:underline">{chunks}</Link>,
    };

    return (
        <div className="bg-brand-dark min-h-screen text-brand-light font-sans">
            <LegalHeader />
            <main className="container mx-auto px-6 py-16 lg:py-24">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-8">{t('title')}</h1>

                    <div className="space-y-6 text-brand-gray">
                        {t('note') && (
                            <p className="text-sm italic text-brand-gray/80">{t('note')}</p>
                        )}

                        {sectionPaths.map((path, i) => (
                            <section key={path} className="space-y-6">
                                <h2 className={`text-2xl font-semibold text-white ${i > 0 || t('note') ? 'mt-8' : ''}`}>{t(`${path}.title`)}</h2>
                                {t.raw(`${path}.paragraphs`).map((_, j) => (
                                    <p key={j}>{t.rich(`${path}.paragraphs.${j}`, richOptions)}</p>
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
