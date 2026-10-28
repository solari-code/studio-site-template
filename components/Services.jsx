import { useTranslations } from 'next-intl';
import ScrollAwareGradient from "./ui/GradientText";
import AnimatedCTAButton from "./ui/AnimatedButton";
import { Link } from "@/i18n/navigation";
import { Zap } from "lucide-react";

// Icons per service; titles and descriptions live in messages under `Services.items.<id>`.
const services = [
    { id: "websites", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
    { id: "webApps", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
    { id: "automation", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { id: "design", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg> },
];

const Services = () => {
    const t = useTranslations('Services');

    return (
    <section id="services" className="py-20 lg:py-28 bg-brand-surface scroll-mt-16">
        <div className="container mx-auto px-6 fade-in">
            <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-white">
                    <ScrollAwareGradient startColor1="#D946EF" endColor1="#EC4899" startColor2="#3081F7" endColor2="#22d3ee">{t('title')}</ScrollAwareGradient>
                </h2>
                <p className="text-lg text-brand-gray mt-2 max-w-2xl mx-auto">{t('subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map(service => (
                    <div key={service.id} className="fade-in group bg-white/[0.03] p-8 rounded-2xl border border-white/10 transition-all duration-300 md:hover:bg-white/[0.06] md:hover:border-white/20 md:hover:-translate-y-1 text-center md:text-left">
                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-cyan-500/10 transition-colors text-cyan-400 w-fit mb-6 mx-auto md:mx-0">{service.icon}</div>
                        <h3 className="text-xl font-bold text-white mb-2">{t(`items.${service.id}.title`)}</h3>
                        <p className="text-brand-gray">{t(`items.${service.id}.description`)}</p>
                    </div>
                ))}
            </div>

            {/* <div className="fade-in mt-12">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-center sm:text-left">
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">
                            <Zap size={12} />
                            {t('starterCta.badge')}
                        </div>
                        <h3 className="text-xl font-bold text-white">
                            {t.rich('starterCta.title', { highlight: (chunks) => <span className="bg-gradient-to-r from-[#d946ef] to-cyan-400 text-transparent bg-clip-text">{chunks}</span> })}
                        </h3>
                        <p className="text-brand-gray mt-1">{t('starterCta.subtitle')}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-white">{t('starterCta.price')}</span>
                            <p className="text-xs text-brand-gray uppercase tracking-widest mt-0.5">{t('starterCta.priceLabel')}</p>
                        </div>
                        <Link href="/starter">
                            <AnimatedCTAButton>{t('starterCta.cta')}</AnimatedCTAButton>
                        </Link>
                    </div>
                </div>
            </div> */}
        </div>
    </section>
    );
};

export default Services;
