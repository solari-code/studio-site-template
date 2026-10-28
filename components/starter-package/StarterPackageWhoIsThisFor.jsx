import { Rocket, Target, Zap, User, Sparkles, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";

// Icons per criterion; titles and texts live in messages under `Starter.WhoIsThisFor.criteria.<id>`.
const criteria = [
    { id: "firstWebsite", icon: <Rocket size={20} /> },
    { id: "oneOffer", icon: <Target size={20} /> },
    { id: "shortTimeline", icon: <Zap size={20} /> },
    { id: "directContact", icon: <User size={20} /> },
    { id: "detail", icon: <Sparkles size={20} /> },
    { id: "contentReady", icon: <Lightbulb size={20} /> },
];

const StarterPackageWhoIsThisFor = function () {
    const t = useTranslations('Starter.WhoIsThisFor');

    return (
        <section className="relative py-24 lg:py-32 px-6 overflow-hidden border-t border-white/5 bg-brand-surface scroll-mt-16">
            <div className="md:hidden absolute top-1/2 left-[-172px] -translate-y-1/2 w-[600px] h-[600px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(217,70,239,0.045) 0%, rgba(217,70,239,0.042) 10%, rgba(217,70,239,0.035) 20%, rgba(217,70,239,0.026) 30%, rgba(217,70,239,0.017) 40%, rgba(217,70,239,0.009) 50%, rgba(217,70,239,0.005) 60%, rgba(217,70,239,0.002) 70%, transparent 100%)' }} />
            <div className="hidden md:block absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-[#d946ef]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="md:hidden absolute bottom-[-208px] right-[-208px] w-[800px] h-[800px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(6,182,212,0.025) 0%, rgba(6,182,212,0.024) 10%, rgba(6,182,212,0.020) 20%, rgba(6,182,212,0.014) 30%, rgba(6,182,212,0.009) 40%, rgba(6,182,212,0.005) 50%, rgba(6,182,212,0.003) 60%, rgba(6,182,212,0.001) 70%, transparent 100%)' }} />
            <div className="hidden md:block absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-to-r from-brand-blue to-cyan-400 text-transparent bg-clip-text whitespace-nowrap">{chunks}</span> })}
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {criteria.map((item, i) => (
                        <div
                            key={item.id}
                            className="group p-6 bg-white/[0.03] border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-1 fade-in"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-cyan-500/10 transition-colors text-cyan-400">
                                    {item.icon}
                                </div>
                                <span className="text-xs font-mono text-white/10 group-hover:text-white/20 transition-colors">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                            </div>
                            <h3 className="text-white font-bold mb-2 uppercase tracking-wider text-sm">{t(`criteria.${item.id}.title`)}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{t(`criteria.${item.id}.text`)}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex justify-center">
                    <div className="inline-flex text-center sm:text-left items-center gap-4 px-6 py-3 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-gray-500">
                        <span className="hidden sm:flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                        {t('note')}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default StarterPackageWhoIsThisFor;