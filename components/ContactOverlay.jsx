"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { sendContactEmail } from '@/app/actions';
import { siteConfig } from '@/config/site';

const ContactOverlay = ({ isOpen, onClose }) => {
    const t = useTranslations('ContactForm');
    const locale = useLocale();
    const [status, setStatus] = useState({ loading: false, error: null, success: null });
    const [timestampOpened, setTimestampOpened] = useState(Date.now());

    useEffect(() => {
        if (isOpen) {
            setTimestampOpened(Date.now());
            setStatus({ loading: false, error: null, success: null });
        }

        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };

    }, [isOpen]);

    if (!isOpen) return null;

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: null });
        const formData = new FormData(e.target);

        // Honeypot checks
        if ((Date.now() - timestampOpened) < 4000) {
            console.log('Honeypot - Less than 4s, blocking spam submission.');
            onClose();
            return;
        }
        if (formData.get('website')) {
            console.log('Honeypot field filled, blocking spam submission.');
            onClose();
            return;
        }

        try {
            const result = await sendContactEmail(formData);

            if (result.error) {
                // The server action returns an error code, the message is translated here
                const code = t.has(`errors.${result.error}`) ? result.error : 'SEND_FAILED';
                setStatus({ loading: false, error: t(`errors.${code}`), success: null });
            } else {
                setStatus({ loading: false, error: null, success: t('success') });
                e.target.reset();

                setTimeout(() => {
                    onClose();
                }, 3000);
            }
        } catch (error) {
            console.error("Contact form submission failed:", error);
            setStatus({
                loading: false,
                error: t('errors.UNEXPECTED'),
                success: null
            });
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-brand-dark/80 backdrop-blur-sm overflow-y-auto px-4 py-8 md:flex md:items-center md:justify-center"
            onClick={onClose}
        >
            <div
                className="bg-brand-surface w-full max-w-md mx-auto rounded-xl p-8 border border-white/10 text-center shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* All inner content remains the same */}
                <button onClick={onClose} className="absolute top-4 right-4 text-brand-gray hover:text-white transition-colors" aria-label={t('close')}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {status.success ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                        <h2 className="text-3xl font-bold text-white mb-2">{t('successTitle')}</h2>
                        <p className="text-green-400 mt-4">{status.success}</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-to-r from-brand-magenta to-pink-500 text-transparent bg-clip-text">{chunks}</span> })}
                        </h2>
                        <p className="text-brand-gray mb-8">{t('intro')}</p>

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                            <div className="absolute w-0 h-0 overflow-hidden">
                                <label htmlFor="website">{t('website')}</label>
                                <input type="text" id="website" name="website" tabIndex="-1" autoComplete="off" />
                            </div>
                            {/* Tells the notification mail which language the visitor used */}
                            <input type="hidden" name="locale" value={locale} />

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-brand-gray mb-1">{t('name')}</label>
                                <input type="text" id="name" name="name" required className="w-full bg-brand-dark border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-blue focus:outline-none" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-brand-gray mb-1">{t('email')}</label>
                                <input type="email" id="email" name="email" required className="w-full bg-brand-dark border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-blue focus:outline-none" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-brand-gray mb-1">{t('message')}</label>
                                <textarea id="message" name="message" required rows="4" className="w-full bg-brand-dark border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-blue focus:outline-none"></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={status.loading}
                                className="w-full bg-brand-blue bg-gradient-to-r from-brand-blue to-cyan-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 disabled:bg-brand-gray disabled:bg-none disabled:cursor-not-allowed"
                            >
                                {status.loading ? t('sending') : t('send')}
                            </button>
                        </form>

                        {status.error && <p className="text-red-400 mt-4">{status.error}</p>}

                        <div className="flex items-center my-6">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink mx-4 text-brand-gray text-sm">{t('or')}</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <a
                            href={`https://wa.me/${siteConfig.contact.whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.273-.099-.471-.148-.67.148-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                            {t('whatsapp')}
                        </a>
                    </>
                )}
            </div>
        </div>
    );
};

export default ContactOverlay;