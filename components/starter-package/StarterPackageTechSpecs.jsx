const StarterPackageTechSpecs = function () {
    return (

        <section className="py-12 border-y border-white/5 bg-brand-surface " >
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-center">
                    {[
                        { label: 'Tech', val: 'Next.js / React' },
                        { label: 'Speed', val: 'Fast by default' },
                        { label: 'Delivery', val: 'About One Week' },
                        { label: 'Deployment', val: 'Hosting & Domain Included' }
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-widest">{stat.label}</div>
                            <div className="text-sm font-bold uppercase tracking-wider text-white">{stat.val}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section >
    )
}

export default StarterPackageTechSpecs;