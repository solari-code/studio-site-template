import { CreditCard, RefreshCw, ClipboardList, CheckCircle } from "lucide-react"
import { useTranslations } from "next-intl"

// Icons per card; titles and texts live in messages under `Starter.Pricing.cards.<id>`.
const cards = [
    { id: "payment", icon: <CreditCard size={20} /> },
    { id: "revision", icon: <RefreshCw size={20} /> },
    { id: "form", icon: <ClipboardList size={20} /> },
]

const StarterPackagePricing = function () {
    const t = useTranslations('Starter.Pricing')

    return (
        <section className="py-20 lg:py-28 bg-brand-dark scroll-mt-16 px-6 border-t border-white/5">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    <div className="fade-in ">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 text-center sm:text-left">
                            {t.rich('title', {
                                br: () => <br />,
                                highlight: (chunks) => <span className="bg-gradient-to-r from-[#d946ef] to-cyan-400 text-transparent bg-clip-text">{chunks}</span>,
                            })}
                        </h2>
                        <p className="text-lg text-gray-400 mb-8 leading-relaxed text-center sm:text-left">
                            {t('text')}
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            {cards.map((card) => (
                                <div key={card.id} className="group flex gap-4 p-5 bg-white/[0.03] border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20">
                                    <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-cyan-500/10 transition-colors text-cyan-400 shrink-0 self-center">
                                        {card.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm mb-1">{t(`cards.${card.id}.title`)}</h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">{t(`cards.${card.id}.text`)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* The Card - Matching the Style */}
                    <div className="relative fade-in">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20" />

                        <div className="relative bg-[#0a0a0a] border border-white/10 rounded-xl p-8 md:p-12 overflow-hidden hover:border-cyan-500/50 transition-colors duration-500">
                            <div className="mb-10">
                                <span className="inline-block py-1 px-3 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">{t('badge')}</span>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-5xl font-bold text-white">{t('price')}</h3>
                                    <span className="text-gray-500 uppercase text-sm tracking-widest">{t('priceLabel')}</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-2 font-mono">
                                    {t('priceNote')}
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 border-t border-white/10 pt-8">
                                {t.raw('features').map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <CheckCircle size={16} className="text-cyan-400" /> {item}
                                    </div>
                                ))}
                            </div>
                            <a href="#contact">
                                <button className="w-full py-4 rounded-lg bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">
                                    {t('cta')}
                                </button>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default StarterPackagePricing