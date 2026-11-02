import { useTranslations } from "next-intl"
import { radialGlow } from "@/components/ui/glow"
import { requireProp } from "../requireProp"

// Step order comes from config/pages.js: `steps: ['request', ...]`;
// titles and texts live in messages under `Starter.Roadmap.steps.<id>`.
const StarterPackageRoadmap = function ({ id = 'starter-roadmap', namespace = 'Starter.Roadmap', steps = requireProp('starter-roadmap', 'steps', "['request', 'discovery', ...]") }) {
    const t = useTranslations(namespace)

    return (
        <section id={id} className="relative py-20 lg:py-28 bg-surface border-t border-contrast/5 px-6 overflow-hidden">
            <div className="md:hidden absolute top-1/2 right-[-172px] -translate-y-1/2 w-[600px] h-[600px] pointer-events-none" style={{ background: radialGlow('secondary', [0.045, 0.042, 0.035, 0.026, 0.017, 0.009, 0.005, 0.002]) }} />
            <div className="hidden md:block absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="md:hidden absolute bottom-[-208px] left-[-208px] w-[800px] h-[800px] pointer-events-none" style={{ background: radialGlow('accent', [0.025, 0.024, 0.02, 0.014, 0.009, 0.005, 0.003, 0.001]) }} />
            <div className="hidden md:block absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-contrast">
                        {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-highlight-alt text-transparent bg-clip-text">{chunks}</span> })}
                    </h2>
                    <p className="text-lg text-muted mt-2 max-w-2xl mx-auto">{t('subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {steps.map((id, i) => (
                        <div key={id} className="group p-6 bg-contrast/[0.03] border border-contrast/10 rounded-2xl transition-all duration-300 hover:bg-contrast/[0.06] hover:border-contrast/20 hover:-translate-y-1 fade-in flex flex-col items-center text-center">
                            <div className="w-14 h-14 flex items-center justify-center rounded-full border border-accent/30 group-hover:border-accent text-accent text-lg font-bold mb-5 transition-colors duration-300 shadow-glow bg-contrast/[0.03]">
                                {String(i + 1).padStart(2, "0")}
                            </div>
                            <h3 className="text-contrast font-bold mb-2 uppercase tracking-wider text-sm">{t(`steps.${id}.title`)}</h3>
                            <p className="text-muted text-sm leading-relaxed">{t(`steps.${id}.text`)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StarterPackageRoadmap
