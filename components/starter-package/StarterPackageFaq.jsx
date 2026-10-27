"use client"

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const StarterPackageFaq = function () {

    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "What do I get for 499€?",
            answer: "A one-page landing page built with Next.js: design, development, basic search engine setup, a contact form that emails you, plus your domain and 12 months of hosting. One fixed price, no hidden extras."
        },
        {
            question: "How does the one-week timeline work?",
            answer: "After a short intro call you get an onboarding form for your texts, logo, colors and examples you like. The week starts once everything is in. You get a first version to review, one round of changes is included, and the site goes live right after. You pay half up front and the rest at launch."
        },
        {
            question: "What do I need to prepare?",
            answer: "Your logo, the texts for each section, your brand colors and a few websites you like. The more complete your input, the faster things move. Need help with texts or a logo? That's available as an extra."
        },
        {
            question: "What happens after the first year?",
            answer: "You choose: keep a small yearly care plan that covers hosting, domain renewal and small updates, or take over hosting and domain yourself and get the full project handed over."
        },
        {
            question: "Can the site be changed after launch?",
            answer: "Small text changes during the first year are included. Bigger changes, like new sections or features, are quoted separately."
        }
    ];

    return (
        <section id="faq" className="py-20 lg:py-28 px-6 border-t border-white/5 bg-brand-dark">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        Frequently Asked <span className="bg-gradient-to-r from-brand-magenta to-pink-500 text-transparent bg-clip-text">Questions</span>
                    </h2>
                    <p className="text-gray-400">Quick answers before you get in touch.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === index ? 'bg-white/[0.03] border-cyan-500/30' : 'bg-transparent border-white/10'}`}
                        >
                            <button
                                onClick={() => toggleFaq(index)}
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