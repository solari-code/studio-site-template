import { CreditCard, RefreshCw, ClipboardList, CheckCircle } from "lucide-react"
const StarterPackagePricing = function () {

    return (
        <section className="py-20 lg:py-28 bg-brand-dark scroll-mt-16 px-6 border-t border-white/5">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    <div className="fade-in ">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 text-center sm:text-left">
                            Clear Steps.<br />
                            <span className="bg-gradient-to-r from-[#d946ef] to-cyan-400 text-transparent bg-clip-text">No Busywork.</span>
                        </h2>
                        <p className="text-lg text-gray-400 mb-8 leading-relaxed text-center sm:text-left">
                            One short call, one onboarding form, one payment link. As soon as your content is in, I start building, and you see the first version within days.
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { icon: <CreditCard size={20} />, title: "Simple Payment", text: "Pay securely online: half to get started, the rest when your site goes live." },
                                { icon: <RefreshCw size={20} />, title: "A Round of Changes", text: "Want something adjusted after the first version? One revision round is part of the package." },
                                { icon: <ClipboardList size={20} />, title: "One Short Form", text: "Share your texts, logo and colors in a single guided form, and that's it." },
                            ].map((card) => (
                                <div key={card.title} className="group flex gap-4 p-5 bg-white/[0.03] border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20">
                                    <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-cyan-500/10 transition-colors text-cyan-400 shrink-0 self-center">
                                        {card.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm mb-1">{card.title}</h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">{card.text}</p>
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
                                <span className="inline-block py-1 px-3 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">Starter Package</span>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-5xl font-bold text-white">499€</h3>
                                    <span className="text-gray-500 uppercase text-sm tracking-widest">Fixed Price</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-2 font-mono">
                                    Hosting & Domain for Year One
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 border-t border-white/10 pt-8">
                                {[
                                    "One-Page Landing Page (Next.js)",
                                    "Fast Loading Times",
                                    "Search Engine Basics & Meta Tags",
                                    "Works on Every Screen Size",
                                    "Domain & Hosting for 12 Months",
                                    "Up to 5 Sections",
                                    "Contact Form with Email Notifications",
                                    "Optional Extras on Request"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <CheckCircle size={16} className="text-cyan-400" /> {item}
                                    </div>
                                ))}
                            </div>
                            <a href="#contact">
                                <button className="w-full py-4 rounded-lg bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">
                                    Get started
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