import { useTranslations } from 'next-intl';
import ScrollAwareGradient from "@/components/ui/GradientText";
import AnimatedCTAButton from "@/components/ui/AnimatedButton";
import { Link } from "@/i18n/navigation";
import { Zap } from "lucide-react";
import { getIcon } from "@/config/icons";
import { requireProp } from "./requireProp";

// Items come from config/pages.js: `items: [{ id, icon }]`; `icon` is a name from config/icons.js.
// Titles and descriptions live in messages under `Services.items.<id>`.
const Services = ({ id = 'services', namespace = 'Services', items = requireProp('services', 'items', "[{ id: 'websites', icon: 'code' }, ...]") }) => {
    const t = useTranslations(namespace);

    return (
    <section id={id} className="py-20 lg:py-28 bg-surface scroll-mt-16">
        <div className="container mx-auto px-6 fade-in">
            <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-contrast">
                    <ScrollAwareGradient>{t('title')}</ScrollAwareGradient>
                </h2>
                <p className="text-lg text-muted mt-2 max-w-2xl mx-auto">{t('subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map((service) => {
                    const Icon = getIcon(service.icon);
                    return (
                        <div key={service.id} className="fade-in group bg-contrast/[0.03] p-8 rounded-2xl border border-contrast/10 transition-all duration-300 md:hover:bg-contrast/[0.06] md:hover:border-contrast/20 md:hover:-translate-y-1 text-center md:text-left">
                            <div className="p-3 bg-contrast/5 rounded-xl group-hover:bg-accent/10 transition-colors text-accent w-fit mb-6 mx-auto md:mx-0"><Icon className="h-8 w-8" /></div>
                            <h3 className="text-xl font-bold text-contrast mb-2">{t(`items.${service.id}.title`)}</h3>
                            <p className="text-muted">{t(`items.${service.id}.description`)}</p>
                        </div>
                    );
                })}
            </div>

            {/* <div className="fade-in mt-12">
                <div className="bg-contrast/[0.03] border border-contrast/10 rounded-2xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-center sm:text-left">
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-accent text-xs font-bold uppercase tracking-widest mb-2">
                            <Zap size={12} />
                            {t('starterCta.badge')}
                        </div>
                        <h3 className="text-xl font-bold text-contrast">
                            {t.rich('starterCta.title', { highlight: (chunks) => <span className="bg-gradient-highlight-mix text-transparent bg-clip-text">{chunks}</span> })}
                        </h3>
                        <p className="text-muted mt-1">{t('starterCta.subtitle')}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-contrast">{t('starterCta.price')}</span>
                            <p className="text-xs text-muted uppercase tracking-widest mt-0.5">{t('starterCta.priceLabel')}</p>
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
