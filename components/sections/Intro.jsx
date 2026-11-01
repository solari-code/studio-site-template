import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';

const Intro = ({ id = 'intro', namespace = 'Intro' }) => {
    const t = useTranslations(namespace);

    return (
        <section id={id} className="py-20 lg:py-24 bg-background scroll-mt-16">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-contrast leading-tight max-w-4xl mx-auto fade-in">
                    {t.rich('title', {
                        name: siteConfig.name,
                        brand: (chunks) => <span className="bg-gradient-brand text-transparent bg-clip-text">{chunks}</span>,
                        br: () => <br />,
                    })}
                </h2>
                <p className="text-2xl text-muted mt-4 fade-in">
                    {t.rich('subtitle', { br: () => <br /> })}
                </p>
            </div>
        </section>
    );
};

export default Intro;
