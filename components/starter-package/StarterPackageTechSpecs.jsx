import { useTranslations } from "next-intl"

// Labels and values live in messages under `Starter.TechSpecs.<id>`.
const specs = ['tech', 'speed', 'delivery', 'deployment']

const StarterPackageTechSpecs = function () {
    const t = useTranslations('Starter.TechSpecs')

    return (

        <section className="py-12 border-y border-white/5 bg-brand-surface " >
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-center">
                    {specs.map((id) => (
                        <div key={id}>
                            <div className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-widest">{t(`${id}.label`)}</div>
                            <div className="text-sm font-bold uppercase tracking-wider text-white">{t(`${id}.value`)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section >
    )
}

export default StarterPackageTechSpecs;
