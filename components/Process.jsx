import ScrollAwareGradient from "./ui/GradientText";

const processArray = [
    { title: "Discover", description: "We start with a conversation about your goals, your audience and your budget, so we agree on what to build before anything gets built." },
    { title: "Design", description: "I sketch the structure and look of the site, and we refine it together until it feels right for your brand." },
    { title: "Develop", description: "I build it with clean, maintainable code and share progress along the way, so there are no surprises." },
    { title: "Deploy", description: "I take care of hosting and launch, check that everything runs smoothly, and stay available for updates afterwards." },
]

const Process = () => (
    <section id="process" className="relative py-20 lg:py-28 bg-brand-surface scroll-mt-16 overflow-hidden">

        <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16 fade-in">
                <h2 className="text-3xl lg:text-4xl font-bold text-white">
                    The <ScrollAwareGradient startColor1="#D946EF" endColor1="#EC4899" startColor2="#3081F7" endColor2="#22d3ee">Process</ScrollAwareGradient>
                </h2>
                <p className="text-lg text-brand-gray mt-2 max-w-2xl mx-auto">Four steps, no guesswork.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {processArray.map((item, index) => (
                    <div key={item.title} className="group p-6 bg-white/[0.03] border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-1 fade-in flex flex-col items-center text-center">
                        <div className="w-14 h-14 flex items-center justify-center rounded-full border border-cyan-500/30 group-hover:border-cyan-400 text-cyan-400 text-lg font-bold mb-5 transition-colors duration-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-white/[0.03]">
                            {String(index + 1).padStart(2, "0")}
                        </div>
                        <h3 className="text-white font-bold mb-2 uppercase tracking-wider text-sm">{item.title}</h3>
                        <p className="text-brand-gray text-sm leading-relaxed">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Process;
