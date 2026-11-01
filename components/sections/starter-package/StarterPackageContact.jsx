"use client"

import { useState, useRef } from "react"
import { ArrowRight, CheckCircle } from "lucide-react"
import AnimatedCTAButton from "@/components/ui/AnimatedButton"
import { useLocale, useTranslations } from "next-intl"
import { sendContactEmail } from "@/app/actions"

// `form` picks the notification mail's subject/heading from `siteConfig.forms` in config/site.js.
const StarterPackageContact = function ({ id = 'starter-contact', namespace = 'Starter.Contact', form = 'starter' }) {
    const t = useTranslations(namespace)
    const tErrors = useTranslations('ContactForm.errors')
    const locale = useLocale()
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

        const result = await sendContactEmail(formData)

        if (result.error) {
            // The server action returns an error code, the message is translated here
            const code = tErrors.has(result.error) ? result.error : 'SEND_FAILED'
            setStatus({ loading: false, error: tErrors(code), success: false })
        } else {
            setStatus({ loading: false, error: null, success: true })
            e.target.reset()
        }
    }

    return (
        <section id={id} className="py-20 lg:py-28 px-6 border-t border-contrast/5 bg-background scroll-mt-16">
            <div className="container mx-auto max-w-3xl text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-contrast mb-4">
                    {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-highlight-alt text-transparent bg-clip-text">{chunks}</span> })}
                </h2>
                <p className="text-lg text-muted-alt mb-12">
                    {t('text')}
                </p>

                {status.success ? (
                    <div className="bg-contrast/[0.03] border border-contrast/10 p-12 rounded-xl">
                        <CheckCircle className="text-accent mx-auto mb-6" size={48} />
                        <h3 className="text-2xl font-bold text-contrast mb-2">{t('successTitle')}</h3>
                        <p className="text-muted-alt">{t('successText')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 text-left bg-contrast/[0.03] p-8 md:p-10 rounded-xl border border-contrast/10">
                        <div className="absolute w-0 h-0 overflow-hidden">
                            <input type="text" name="website" tabIndex="-1" autoComplete="off" />
                        </div>
                        {/* Tells the notification mail which language the visitor used */}
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="form" value={form} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0" style={{ marginTop: "0!Important" }}>
                            <div>
                                <label htmlFor="starter-name" className="block text-xs font-bold text-muted-deep uppercase tracking-wider mb-2">{t('name')}</label>
                                <input type="text" id="starter-name" name="name" className="w-full bg-background border border-contrast/10 rounded-lg p-4 text-contrast focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors" placeholder={t('namePlaceholder')} required />
                            </div>
                            <div>
                                <label htmlFor="starter-email" className="block text-xs font-bold text-muted-deep uppercase tracking-wider mb-2">{t('email')}</label>
                                <input type="email" id="starter-email" name="email" className="w-full bg-background border border-contrast/10 rounded-lg p-4 text-contrast focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors" placeholder={t('emailPlaceholder')} required />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="starter-message" className="block text-xs font-bold text-muted-deep uppercase tracking-wider mb-2">{t('message')}</label>
                            <textarea id="starter-message" name="message" className="w-full bg-background border border-contrast/10 rounded-lg p-4 h-32 text-contrast focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors" placeholder={t('messagePlaceholder')} required></textarea>
                        </div>

                        {status.error && <p className="text-error text-sm">{status.error}</p>}

                        <AnimatedCTAButton hoverScale={false} type="submit" disabled={status.loading} className="w-full justify-center font-bold uppercase tracking-widest text-sm hover:scale-100">
                            {status.loading ? t('sending') : <span className="flex items-center gap-2">{t('send')} <ArrowRight size={16} /></span>}
                        </AnimatedCTAButton>
                    </form>
                )}
            </div>
        </section>
    )
}

export default StarterPackageContact
