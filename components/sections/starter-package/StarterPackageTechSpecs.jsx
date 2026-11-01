import { useTranslations } from "next-intl"
import { requireProp } from "../requireProp"

// Spec order comes from config/pages.js: `specs: ['tech', ...]`;
// labels and values live in messages under `Starter.TechSpecs.<id>`.
const StarterPackageTechSpecs = function ({ id = 'starter-tech-specs', namespace = 'Starter.TechSpecs', specs = requireProp('starter-tech-specs', 'specs', "['tech', 'speed', ...]") }) {
    const t = useTranslations(namespace)

    return (

        <section id={id} className="py-12 border-y border-contrast/5 bg-surface " >
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-center">
                    {specs.map((id) => (
                        <div key={id}>
                            <div className="text-xs font-mono text-accent mb-1 uppercase tracking-widest">{t(`${id}.label`)}</div>
                            <div className="text-sm font-bold uppercase tracking-wider text-contrast">{t(`${id}.value`)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section >
    )
}

export default StarterPackageTechSpecs;
