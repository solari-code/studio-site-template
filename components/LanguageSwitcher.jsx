"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import NextLink from 'next/link';
import { getPathname, usePathname } from '@/i18n/navigation';
import { locales, localeNames } from '@/i18n/routing';

// Up to this many languages the compact variant renders as a segmented pill;
// with more languages it automatically becomes a dropdown.
const MAX_PILL_LOCALES = 3;

/**
 * Language switcher, generated from `i18n/routing.js`.
 *
 * variant="compact": two-letter codes in a pill (header). Becomes a dropdown with more than 3 languages.
 * variant="menu":    larger version for the mobile menu. Pill up to 3 languages, otherwise a list of full names.
 * variant="links":   full language names as plain text links (footer).
 */
export default function LanguageSwitcher({ variant = 'compact', className = '' }) {
    const locale = useLocale();
    const pathname = usePathname();
    const t = useTranslations('LanguageSwitcher');

    const isCompact = locales.length <= MAX_PILL_LOCALES;

    if (variant === 'links') {
        return (
            <nav aria-label={t('label')} className={`flex flex-wrap justify-center gap-x-4 gap-y-1 ${className}`}>
                {locales.map((code) => (
                    <LocaleLink
                        key={code}
                        code={code}
                        pathname={pathname}
                        isActive={code === locale}
                        className={`transition-colors ${code === locale ? 'text-white' : 'hover:text-white'}`}
                    >
                        {localeNames[code]}
                    </LocaleLink>
                ))}
            </nav>
        );
    }

    if (variant === 'menu') {
        if (isCompact) {
            return <Pill locale={locale} pathname={pathname} label={t('label')} size="lg" className={className} />;
        }
        return (
            <nav aria-label={t('label')} className={`flex flex-col items-center ${className}`}>
                {locales.map((code) => (
                    <LocaleLink
                        key={code}
                        code={code}
                        pathname={pathname}
                        isActive={code === locale}
                        className={`block py-2 text-lg transition-colors duration-300 ${code === locale ? 'text-white' : 'text-brand-gray hover:text-white'}`}
                    >
                        {localeNames[code]}
                    </LocaleLink>
                ))}
            </nav>
        );
    }

    // variant="compact"
    if (isCompact) {
        return <Pill locale={locale} pathname={pathname} label={t('label')} className={className} />;
    }
    return <Dropdown locale={locale} pathname={pathname} label={t('label')} className={className} />;
}

// One link per language: the current path with the prefix of the target language
// (none for the default language, e.g. "/starter" vs. "/de/starter").
function LocaleLink({ code, pathname, isActive, className, children, onClick }) {
    return (
        <NextLink
            href={getPathname({ href: pathname, locale: code })}
            hrefLang={code}
            lang={code}
            aria-label={localeNames[code]}
            aria-current={isActive ? 'true' : undefined}
            onClick={onClick}
            className={className}
        >
            {children}
        </NextLink>
    );
}

function Pill({ locale, pathname, label, size = 'sm', className = '' }) {
    const sizeClasses = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs';
    return (
        <nav aria-label={label} className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 ${className}`}>
            {locales.map((code) => {
                const isActive = code === locale;
                return (
                    <LocaleLink
                        key={code}
                        code={code}
                        pathname={pathname}
                        isActive={isActive}
                        className={`rounded-full font-bold uppercase tracking-widest transition-colors duration-300 ${sizeClasses} ${isActive ? 'bg-white/10 text-white' : 'text-brand-gray hover:text-white'}`}
                    >
                        {code}
                    </LocaleLink>
                );
            })}
        </nav>
    );
}

function Dropdown({ locale, pathname, label, className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click and Escape
    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
        const onKeyDown = (e) => { if (e.key === 'Escape') setIsOpen(false); };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 pl-4 pr-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            >
                {locale}
                <ChevronDown size={14} className={`text-brand-gray transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div
                role="menu"
                aria-label={label}
                className={`absolute right-0 mt-2 min-w-[11rem] rounded-xl border border-white/10 bg-brand-surface/95 backdrop-blur-lg shadow-2xl p-1.5 transition-all duration-200 origin-top-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
                {locales.map((code) => {
                    const isActive = code === locale;
                    return (
                        <LocaleLink
                            key={code}
                            code={code}
                            pathname={pathname}
                            isActive={isActive}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'text-white bg-white/5' : 'text-brand-gray hover:text-white hover:bg-white/5'}`}
                        >
                            <span>{localeNames[code]}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray/70">{code}</span>
                        </LocaleLink>
                    );
                })}
            </div>
        </div>
    );
}
