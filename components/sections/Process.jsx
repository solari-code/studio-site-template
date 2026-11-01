import { useTranslations } from 'next-intl';
import ScrollAwareGradient from "@/components/ui/GradientText";
import { requireProp } from "./requireProp";

// Step order comes from config/pages.js: `steps: ['discover', ...]`;
// titles and descriptions live in messages under `Process.steps.<id>`.
const Process = ({ id = 'process', namespace = 'Process', steps = requireProp('process', 'steps', "['discover', 'design', ...]") }) => {
    const t = useTranslations(namespace);

    return (
    <section id={id} className="relative py-20 lg:py-28 bg-surface scroll-mt-16 overflow-hidden">

        <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16 fade-in">
                <h2 className="text-3xl lg:text-4xl font-bold text-contrast">
                    {t.rich('title', { highlight: (chunks) => <ScrollAwareGradient>{chunks}</ScrollAwareGradient> })}
                </h2>
                <p className="text-lg text-muted mt-2 max-w-2xl mx-auto">{t('subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((id, index) => (
                    <div key={id} className="group p-6 bg-contrast/[0.03] border border-contrast/10 rounded-2xl transition-all duration-300 hover:bg-contrast/[0.06] hover:border-contrast/20 hover:-translate-y-1 fade-in flex flex-col items-center text-center">
                        <div className="w-14 h-14 flex items-center justify-center rounded-full border border-accent-deep/30 group-hover:border-accent text-accent text-lg font-bold mb-5 transition-colors duration-300 shadow-glow bg-contrast/[0.03]">
                            {String(index + 1).padStart(2, "0")}
                        </div>
                        <h3 className="text-contrast font-bold mb-2 uppercase tracking-wider text-sm">{t(`steps.${id}.title`)}</h3>
                        <p className="text-muted text-sm leading-relaxed">{t(`steps.${id}.description`)}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
    );
};

export default Process;
