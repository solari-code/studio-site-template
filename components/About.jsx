import Image from "next/image"
import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';

function About() {
    const t = useTranslations('About');

    return (
        <section id="about" className="py-20 lg:py-28 bg-brand-dark scroll-mt-16">
            <div className="container mx-auto px-6 fade-in">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2 flex justify-center fade-in">
                        <Image
                            src="/images/about/portrait-placeholder.jpg"
                            alt={t('portraitAlt')}
                            className="w-64 h-64 rounded-full shadow-2xl object-cover"
                            priority
                            objectFit="cover"
                            width={200}
                            height={200}
                        />
                    </div>
                    <div className="md:w-2/3 text-center md:text-left fade-in">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            {t.rich('title', {
                                highlight: (chunks) => <span className="bg-gradient-to-r from-brand-magenta to-pink-500 text-transparent bg-clip-text">{chunks}</span>,
                                highlightAlt: (chunks) => <span className="bg-gradient-to-r from-brand-blue to-cyan-400 text-transparent bg-clip-text">{chunks}</span>,
                            })}
                        </h2>
                        <p className="text-lg lg:text-xl text-brand-gray">
                            {t('text', { name: siteConfig.name })}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )

}

export default About