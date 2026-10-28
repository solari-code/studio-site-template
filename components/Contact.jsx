import { useTranslations } from 'next-intl';
import AnimatedCTAButton from "./ui/AnimatedButton";

const Contact = ({ onOpenOverlay }) => {
    const t = useTranslations('Contact');

    return (
    <section id="contact" className="bg-brand-surface scroll-mt-16 ">
        <div className="container mx-auto px-6 py-20 lg:py-24 text-center fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 ">
                {t.rich('title', {
                    highlight: (chunks) => <span className="bg-gradient-to-r from-brand-blue to-cyan-400 text-transparent bg-clip-text whitespace-nowrap">{chunks}</span>,
                })}
            </h2>
            <p className="text-lg text-brand-gray max-w-2xl mx-auto mb-8">
                {t.rich('text', { br: () => <br /> })}
            </p>
            <AnimatedCTAButton className="font-medium text-lg" onClick={onOpenOverlay}>{t('cta')}</AnimatedCTAButton>
        </div>
    </section>
    );
};

export default Contact;
