import { Rocket, Target, Zap, User, Sparkles, Lightbulb } from "lucide-react";

const StarterPackageWhoIsThisFor = function () {

    const criteria = [
        {
            title: "First Website",
            text: "You’re ready for a proper online home for your business.",
            icon: <Rocket size={20} />
        },
        {
            title: "One Clear Offer",
            text: "You have one main service or product and want to present it well.",
            icon: <Target size={20} />
        },
        {
            title: "Short Timeline",
            text: "You’d rather launch this month than plan for the next six.",
            icon: <Zap size={20} />
        },
        {
            title: "Direct Contact",
            text: "You talk to the person who builds your site, not a chain of project managers.",
            icon: <User size={20} />
        },
        {
            title: "Care for Detail",
            text: "You want a site that looks polished and works reliably.",
            icon: <Sparkles size={20} />
        },
        {
            title: "Content Ready",
            text: "You know roughly what you want to say and need someone to shape it into a site.",
            icon: <Lightbulb size={20} />
        }
    ];

    return (
        <section className="relative py-24 lg:py-32 px-6 overflow-hidden border-t border-white/5 bg-brand-surface scroll-mt-16">
            <div className="md:hidden absolute top-1/2 left-[-172px] -translate-y-1/2 w-[600px] h-[600px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(217,70,239,0.045) 0%, rgba(217,70,239,0.042) 10%, rgba(217,70,239,0.035) 20%, rgba(217,70,239,0.026) 30%, rgba(217,70,239,0.017) 40%, rgba(217,70,239,0.009) 50%, rgba(217,70,239,0.005) 60%, rgba(217,70,239,0.002) 70%, transparent 100%)' }} />
            <div className="hidden md:block absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-[#d946ef]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="md:hidden absolute bottom-[-208px] right-[-208px] w-[800px] h-[800px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(6,182,212,0.025) 0%, rgba(6,182,212,0.024) 10%, rgba(6,182,212,0.020) 20%, rgba(6,182,212,0.014) 30%, rgba(6,182,212,0.009) 40%, rgba(6,182,212,0.005) 50%, rgba(6,182,212,0.003) 60%, rgba(6,182,212,0.001) 70%, transparent 100%)' }} />
            <div className="hidden md:block absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        This is <span className="bg-gradient-to-r from-brand-blue to-cyan-400 text-transparent bg-clip-text whitespace-nowrap">right for you if...</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Made for small businesses and solo founders who want a solid landing page without a months-long project.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {criteria.map((item, i) => (
                        <div
                            key={item.title}
                            className="group p-6 bg-white/[0.03] border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-1 fade-in"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-cyan-500/10 transition-colors text-cyan-400">
                                    {item.icon}
                                </div>
                                <span className="text-xs font-mono text-white/10 group-hover:text-white/20 transition-colors">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                            </div>
                            <h3 className="text-white font-bold mb-2 uppercase tracking-wider text-sm">{item.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex justify-center">
                    <div className="inline-flex text-center sm:text-left items-center gap-4 px-6 py-3 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-gray-500">
                        <span className="hidden sm:flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                        Built to be fast, clear and easy to update
                    </div>
                </div>
            </div>
        </section>
    )
}

export default StarterPackageWhoIsThisFor;