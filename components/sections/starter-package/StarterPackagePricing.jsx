import { CheckCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { getIcon } from "@/config/icons"
import { requireProp } from "../requireProp"

// Cards come from config/pages.js: `cards: [{ id, icon }]`; `icon` is a name from config/icons.js.
// Titles and texts live in messages under `Starter.Pricing.cards.<id>`.
const StarterPackagePricing = function ({ id = 'starter-pricing', namespace = 'Starter.Pricing', cards = requireProp('starter-pricing', 'cards', "[{ id: 'payment', icon: 'credit-card' }, ...]"), ctaHref = '#contact' }) {
    const t = useTranslations(namespace)

    return (
        <section id={id} className="py-20 lg:py-28 bg-background scroll-mt-16 px-6 border-t border-contrast/5">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    <div className="fade-in ">
                        <h2 className="text-3xl lg:text-4xl font-bold text-contrast mb-6 text-center sm:text-left">
                            {t.rich('title', {
                                br: () => <br />,
                                highlight: (chunks) => <span className="bg-gradient-highlight-mix text-transparent bg-clip-text">{chunks}</span>,
                            })}
                        </h2>
                        <p className="text-lg text-muted-alt mb-8 leading-relaxed text-center sm:text-left">
                            {t('text')}
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            {cards.map((card) => {
                                const Icon = getIcon(card.icon);
                                return (
                                <div key={card.id} className="group flex gap-4 p-5 bg-contrast/[0.03] border border-contrast/10 rounded-2xl transition-all duration-300 hover:bg-contrast/[0.06] hover:border-contrast/20">
                                    <div className="p-2.5 bg-contrast/5 rounded-xl group-hover:bg-accent-deep/10 transition-colors text-accent shrink-0 self-center">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-contrast font-bold text-sm mb-1">{t(`cards.${card.id}.title`)}</h4>
                                        <p className="text-muted-alt text-sm leading-relaxed">{t(`cards.${card.id}.text`)}</p>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* The Card - Matching the Style */}
                    <div className="relative fade-in">
                        <div className="absolute -inset-1 bg-gradient-card-glow rounded-2xl blur opacity-20" />

                        <div className="relative bg-surface-deep border border-contrast/10 rounded-xl p-8 md:p-12 overflow-hidden hover:border-accent-deep/50 transition-colors duration-500">
                            <div className="mb-10">
                                <span className="inline-block py-1 px-3 rounded-full bg-accent-deep/10 text-accent text-xs font-bold tracking-widest uppercase mb-4">{t('badge')}</span>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-5xl font-bold text-contrast">{t('price')}</h3>
                                    <span className="text-muted-deep uppercase text-sm tracking-widest">{t('priceLabel')}</span>
                                </div>
                                <p className="text-muted-deep text-sm mt-2 font-mono">
                                    {t('priceNote')}
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 border-t border-contrast/10 pt-8">
                                {t.raw('features').map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-muted-soft">
                                        <CheckCircle size={16} className="text-accent" /> {item}
                                    </div>
                                ))}
                            </div>
                            <a href={ctaHref}>
                                <button className="w-full py-4 rounded-lg bg-contrast text-on-contrast font-bold uppercase tracking-widest text-xs hover:bg-contrast-muted transition-colors">
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