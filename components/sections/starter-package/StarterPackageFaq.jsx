"use client"

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useTranslations } from "next-intl";

const StarterPackageFaq = function ({ id = 'starter-faq', namespace = 'Starter.Faq' }) {
    const t = useTranslations(namespace);

    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Questions and answers live in messages under `Starter.Faq.items`; add or remove entries there.
    const faqs = t.raw('items');

    return (
        <section id={id} className="py-20 lg:py-28 px-6 border-t border-contrast/5 bg-background">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-contrast mb-4">
                        {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-highlight text-transparent bg-clip-text">{chunks}</span> })}
                    </h2>
                    <p className="text-muted-alt">{t('subtitle')}</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === index ? 'bg-contrast/[0.03] border-accent-deep/30' : 'bg-transparent border-contrast/10'}`}
                        >
                            <button
                                onClick={() => toggleFaq(index)}
                                aria-expanded={openFaq === index}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className={`font-bold transition-colors ${openFaq === index ? 'text-accent' : 'text-contrast'}`}>
                                    {faq.question}
                                </span>
                                {openFaq === index ? (
                                    <Minus className="text-accent shrink-0" size={20} />
                                ) : (
                                    <Plus className="text-muted-deep shrink-0" size={20} />
                                )}
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="p-6 text-muted-alt leading-relaxed border-t border-contrast/5">
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