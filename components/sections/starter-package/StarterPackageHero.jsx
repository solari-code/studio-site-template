
import { Zap } from "lucide-react"
import { useTranslations } from "next-intl"
import AnimatedCTAButton from "@/components/ui/AnimatedButton"
import { radialGlow } from "@/components/ui/glow"

const StarterPackageHero = function ({ id = 'starter-hero', namespace = 'Starter.Hero', ctaHref = '#contact' }) {
    const t = useTranslations(namespace)

    return (

        <section id={id} className="relative h-screen w-full pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden flex flex-col items-center text-center">
            {/* Background Effects */}
            <div className="md:hidden absolute top-[calc(-10%-200px)] left-1/2 -translate-x-1/2 w-[1300px] h-[900px] pointer-events-none" style={{ background: radialGlow('accent-deep', [0.08, 0.075, 0.062, 0.046, 0.03, 0.017, 0.008, 0.004, 0.002], { shape: 'ellipse at center' }) }} />
            <div className="hidden md:block absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-deep/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto relative h-full w-full flex flex-col items-center justify-center text-center z-20 px-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-contrast/5 border border-contrast/10 text-accent text-xs font-bold mb-8 uppercase tracking-widest">
                    <Zap size={14} />
                    {t('badge')}
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-contrast leading-tight mb-8">
                    {t.rich('title', {
                        br: () => <br />,
                        highlight: (chunks) => <span className="bg-gradient-highlight-mix text-transparent bg-clip-text">{chunks}</span>,
                    })}
                </h1>

                <p className="text-lg md:text-xl text-muted-alt mb-12 max-w-2xl mx-auto leading-relaxed">
                    {t('subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <a href={ctaHref}>
                        <AnimatedCTAButton className="font-medium">{t('cta')}</AnimatedCTAButton>
                    </a>
                </div>
            </div>
        </section>
    )
}

export default StarterPackageHero