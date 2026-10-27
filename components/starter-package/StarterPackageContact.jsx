"use client"

import { useState, useRef } from "react"
import { ArrowRight, CheckCircle } from "lucide-react"
import AnimatedCTAButton from "@/components/ui/AnimatedButton"
import { sendStarterContactEmail } from "@/app/actions"

const StarterPackageContact = function () {
    const [status, setStatus] = useState({ loading: false, error: null, success: false })
    const timestampRef = useRef(Date.now())

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus({ loading: true, error: null, success: false })

        const formData = new FormData(e.target)

        if ((Date.now() - timestampRef.current) < 4000) {
            setStatus({ loading: false, error: null, success: false })
            return
        }
        if (formData.get('website')) {
            setStatus({ loading: false, error: null, success: false })
            return
        }

        const result = await sendStarterContactEmail(formData)

        if (result.error) {
            setStatus({ loading: false, error: result.error, success: false })
        } else {
            setStatus({ loading: false, error: null, success: true })
            e.target.reset()
        }
    }

    return (
        <section id="contact" className="py-20 lg:py-28 px-6 border-t border-white/5 bg-brand-dark scroll-mt-16">
            <div className="container mx-auto max-w-3xl text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                    Let’s get you <span className="bg-gradient-to-r from-brand-blue to-cyan-400 text-transparent bg-clip-text">online</span>.
                </h2>
                <p className="text-lg text-gray-400 mb-12">
                    Share a few words about your business. If the package is a good match,
                    you'll get the next steps by email.
                </p>

                {status.success ? (
                    <div className="bg-white/[0.03] border border-white/10 p-12 rounded-xl">
                        <CheckCircle className="text-cyan-400 mx-auto mb-6" size={48} />
                        <h3 className="text-2xl font-bold text-white mb-2">Request Received</h3>
                        <p className="text-gray-400">Thanks! I'll read your message and get back to you with the next steps.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 text-left bg-white/[0.03] p-8 md:p-10 rounded-xl border border-white/10">
                        <div className="absolute w-0 h-0 overflow-hidden">
                            <input type="text" name="website" tabIndex="-1" autoComplete="off" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0" style={{ marginTop: "0!Important" }}>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name</label>
                                <input type="text" name="name" className="w-full bg-brand-dark border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors" placeholder="John Doe" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                                <input type="email" name="email" className="w-full bg-brand-dark border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors" placeholder="john@example.com" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                            <textarea name="message" className="w-full bg-brand-dark border border-white/10 rounded-lg p-4 h-32 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors" placeholder="What does your business do?" required></textarea>
                        </div>

                        {status.error && <p className="text-red-400 text-sm">{status.error}</p>}

                        <AnimatedCTAButton hoverScale={false} type="submit" disabled={status.loading} className="w-full justify-center font-bold uppercase tracking-widest text-sm hover:scale-100">
                            {status.loading ? "Sending..." : <span className="flex items-center gap-2">Send Request <ArrowRight size={16} /></span>}
                        </AnimatedCTAButton>
                    </form>
                )}
            </div>
        </section>
    )
}

export default StarterPackageContact
