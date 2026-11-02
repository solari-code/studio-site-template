import { useTranslations } from "next-intl";
import { getIcon } from "@/config/icons";
import { requireProp } from "../requireProp";
import { radialGlow } from "@/components/ui/glow"

// Criteria come from config/pages.js: `criteria: [{ id, icon }]`; `icon` is a name from config/icons.js.
// Titles and texts live in messages under `Starter.WhoIsThisFor.criteria.<id>`.
const StarterPackageWhoIsThisFor = function ({ id = 'starter-who-is-this-for', namespace = 'Starter.WhoIsThisFor', criteria = requireProp('starter-who-is-this-for', 'criteria', "[{ id: 'firstWebsite', icon: 'rocket' }, ...]") }) {
    const t = useTranslations(namespace);

    return (
        <section id={id} className="relative py-24 lg:py-32 px-6 overflow-hidden border-t border-contrast/5 bg-surface scroll-mt-16">
            <div className="md:hidden absolute top-1/2 left-[-172px] -translate-y-1/2 w-[600px] h-[600px] pointer-events-none" style={{ background: radialGlow('secondary', [0.045, 0.042, 0.035, 0.026, 0.017, 0.009, 0.005, 0.002]) }} />
            <div className="hidden md:block absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="md:hidden absolute bottom-[-208px] right-[-208px] w-[800px] h-[800px] pointer-events-none" style={{ background: radialGlow('accent', [0.025, 0.024, 0.02, 0.014, 0.009, 0.005, 0.003, 0.001]) }} />
            <div className="hidden md:block absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-contrast mb-6">
                        {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-highlight-alt text-transparent bg-clip-text whitespace-nowrap">{chunks}</span> })}
                    </h2>
                    <p className="text-muted max-w-2xl mx-auto leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {criteria.map((item, i) => {
                        const Icon = getIcon(item.icon);
                        return (
                        <div
                            key={item.id}
                            className="group p-6 bg-contrast/[0.03] border border-contrast/10 rounded-2xl transition-all duration-300 hover:bg-contrast/[0.06] hover:border-contrast/20 hover:-translate-y-1 fade-in"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-contrast/5 rounded-xl group-hover:bg-accent/10 transition-colors text-accent">
                                    <Icon size={20} />
                                </div>
                                <span className="text-xs font-mono text-contrast/10 group-hover:text-contrast/20 transition-colors">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                            </div>
                            <h3 className="text-contrast font-bold mb-2 uppercase tracking-wider text-sm">{t(`criteria.${item.id}.title`)}</h3>
                            <p className="text-muted text-sm leading-relaxed">{t(`criteria.${item.id}.text`)}</p>
                        </div>
                        );
                    })}
                </div>

                <div className="mt-16 flex justify-center">
                    <div className="inline-flex text-center sm:text-left items-center gap-4 px-6 py-3 rounded-full bg-contrast/[0.06] border border-contrast/10 text-xs font-mono text-muted-strong">
                        <span className="hidden sm:flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                        {t('note')}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default StarterPackageWhoIsThisFor;