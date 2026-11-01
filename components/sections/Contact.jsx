"use client";

import { useTranslations } from 'next-intl';
import AnimatedCTAButton from "@/components/ui/AnimatedButton";
import { useContactOverlay } from '@/components/ContactOverlayProvider';

const Contact = ({ id = 'contact', namespace = 'Contact' }) => {
    const t = useTranslations(namespace);
    const overlay = useContactOverlay();

    return (
    <section id={id} className="bg-surface scroll-mt-16 ">
        <div className="container mx-auto px-6 py-20 lg:py-24 text-center fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-contrast mb-4 ">
                {t.rich('title', {
                    highlight: (chunks) => <span className="bg-gradient-highlight-alt text-transparent bg-clip-text whitespace-nowrap">{chunks}</span>,
                })}
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
                {t.rich('text', { br: () => <br /> })}
            </p>
            <AnimatedCTAButton className="font-medium text-lg" onClick={overlay.open}>{t('cta')}</AnimatedCTAButton>
        </div>
    </section>
    );
};

export default Contact;
