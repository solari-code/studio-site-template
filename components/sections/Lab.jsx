import { useTranslations } from 'next-intl';
import { requireProp } from './requireProp';

// The link target comes from config/pages.js: `url: 'https://…'`.
const Lab = ({ id = 'lab', namespace = 'Lab', url = requireProp('lab', 'url', "'https://example.com'") }) => {
    const t = useTranslations(namespace);

    return (
    <section id={id} className="py-20 lg:py-28 bg-background scroll-mt-16">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-contrast leading-tight max-w-4xl mx-auto">
                {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-highlight text-transparent bg-clip-text">{chunks}</span> })}
            </h2>
            <p className="text-lg text-muted mt-6 max-w-3xl mx-auto">
                {t('text')}
            </p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block bg-primary text-contrast px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-300 shadow-lg">{t('cta')}</a>
        </div>
    </section>
    );
};

export default Lab;
