const StarterPackageRoadmap = function () {

    const steps = [
        { num: "01", title: "Request", desc: "Tell me briefly what you have in mind." },
        { num: "02", title: "Discovery", desc: "A short call to agree on the details." },
        { num: "03", title: "Kickoff", desc: "Fill in the onboarding form and pay the deposit." },
        { num: "04", title: "Launch", desc: "Your site goes live about a week later." }
    ]

    return (
        <section className="relative py-20 lg:py-28 bg-brand-surface border-t border-white/5 px-6 overflow-hidden">
            <div className="md:hidden absolute top-1/2 right-[-172px] -translate-y-1/2 w-[600px] h-[600px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(217,70,239,0.045) 0%, rgba(217,70,239,0.042) 10%, rgba(217,70,239,0.035) 20%, rgba(217,70,239,0.026) 30%, rgba(217,70,239,0.017) 40%, rgba(217,70,239,0.009) 50%, rgba(217,70,239,0.005) 60%, rgba(217,70,239,0.002) 70%, transparent 100%)' }} />
            <div className="hidden md:block absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-[#d946ef]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="md:hidden absolute bottom-[-208px] left-[-208px] w-[800px] h-[800px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(6,182,212,0.025) 0%, rgba(6,182,212,0.024) 10%, rgba(6,182,212,0.020) 20%, rgba(6,182,212,0.014) 30%, rgba(6,182,212,0.009) 40%, rgba(6,182,212,0.005) 50%, rgba(6,182,212,0.003) 60%, rgba(6,182,212,0.001) 70%, transparent 100%)' }} />
            <div className="hidden md:block absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white">
                        The <span className="bg-gradient-to-r from-brand-blue to-cyan-400 text-transparent bg-clip-text">Roadmap</span>
                    </h2>
                    <p className="text-lg text-gray-400 mt-2 max-w-2xl mx-auto">From first message to live site.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {steps.map((step, i) => (
                        <div key={i} className="group p-6 bg-white/[0.03] border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-1 fade-in flex flex-col items-center text-center">
                            <div className="w-14 h-14 flex items-center justify-center rounded-full border border-cyan-500/30 group-hover:border-cyan-400 text-cyan-400 text-lg font-bold mb-5 transition-colors duration-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-white/[0.03]">
                                {step.num}
                            </div>
                            <h3 className="text-white font-bold mb-2 uppercase tracking-wider text-sm">{step.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StarterPackageRoadmap
