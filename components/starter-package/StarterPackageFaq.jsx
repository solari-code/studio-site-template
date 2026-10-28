"use client"

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useTranslations } from "next-intl";

const StarterPackageFaq = function () {
    const t = useTranslations('Starter.Faq');

    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Questions and answers live in messages under `Starter.Faq.items`; add or remove entries there.
    const faqs = t.raw('items');

    return (
        <section id="faq" className="py-20 lg:py-28 px-6 border-t border-white/5 bg-brand-dark">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-to-r from-brand-magenta to-pink-500 text-transparent bg-clip-text">{chunks}</span> })}
                    </h2>
                    <p className="text-gray-400">{t('subtitle')}</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === index ? 'bg-white/[0.03] border-cyan-500/30' : 'bg-transparent border-white/10'}`}
                        >
                            <button
                                onClick={() => toggleFaq(index)}
                                aria-expanded={openFaq === index}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className={`font-bold transition-colors ${openFaq === index ? 'text-cyan-400' : 'text-white'}`}>
                                    {faq.question}
                                </span>
                                {openFaq === index ? (
                                    <Minus className="text-cyan-400 shrink-0" size={20} />
                                ) : (
                                    <Plus className="text-gray-500 shrink-0" size={20} />
                                )}
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="p-6 text-gray-400 leading-relaxed border-t border-white/5">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StarterPackageFaq