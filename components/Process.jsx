import { useTranslations } from 'next-intl';
import ScrollAwareGradient from "./ui/GradientText";

// Step order; titles and descriptions live in messages under `Process.steps.<id>`.
const steps = ["discover", "design", "develop", "deploy"];

const Process = () => {
    const t = useTranslations('Process');

    return (
    <section id="process" className="relative py-20 lg:py-28 bg-brand-surface scroll-mt-16 overflow-hidden">

        <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16 fade-in">
                <h2 className="text-3xl lg:text-4xl font-bold text-white">
                    {t.rich('title', { highlight: (chunks) => <ScrollAwareGradient startColor1="#D946EF" endColor1="#EC4899" startColor2="#3081F7" endColor2="#22d3ee">{chunks}</ScrollAwareGradient> })}
                </h2>
                <p className="text-lg text-brand-gray mt-2 max-w-2xl mx-auto">{t('subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((id, index) => (
                    <div key={id} className="group p-6 bg-white/[0.03] border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-1 fade-in flex flex-col items-center text-center">
                        <div className="w-14 h-14 flex items-center justify-center rounded-full border border-cyan-500/30 group-hover:border-cyan-400 text-cyan-400 text-lg font-bold mb-5 transition-colors duration-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-white/[0.03]">
                            {String(index + 1).padStart(2, "0")}
                        </div>
                        <h3 className="text-white font-bold mb-2 uppercase tracking-wider text-sm">{t(`steps.${id}.title`)}</h3>
                        <p className="text-brand-gray text-sm leading-relaxed">{t(`steps.${id}.description`)}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
    );
};

export default Process;
