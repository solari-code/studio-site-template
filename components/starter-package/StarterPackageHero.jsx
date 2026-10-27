
import { Zap, Calendar } from "lucide-react"
import AnimatedCTAButton from "../ui/AnimatedButton"

const StarterPackageHero = function () {


    return (

        <section className=" relative h-screen w-full pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden flex flex-col items-center text-center">
            {/* Background Effects */}
            <div className="md:hidden absolute top-[calc(-10%-200px)] left-1/2 -translate-x-1/2 w-[1300px] h-[900px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.080) 0%, rgba(6,182,212,0.075) 10%, rgba(6,182,212,0.062) 20%, rgba(6,182,212,0.046) 30%, rgba(6,182,212,0.030) 40%, rgba(6,182,212,0.017) 50%, rgba(6,182,212,0.008) 60%, rgba(6,182,212,0.004) 70%, rgba(6,182,212,0.002) 80%, transparent 100%)' }} />
            <div className="hidden md:block absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto relative h-full w-full flex flex-col items-center justify-center text-center z-20 px-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-bold mb-8 uppercase tracking-widest">
                    <Zap size={14} />
                    Starter package
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
                    Your Website.<br />
                    <span className="bg-gradient-to-r from-[#d946ef] to-cyan-400 text-transparent bg-clip-text">
                        Online in One Week.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    A focused landing page, designed and built for you, ready to share.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <a href="#contact">
                        <AnimatedCTAButton className="font-medium">Request a spot</AnimatedCTAButton>
                    </a>
                </div>
            </div>
        </section>
    )
}

export default StarterPackageHero