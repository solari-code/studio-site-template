"use client";

import { useTranslations } from 'next-intl';
import { Sun, Moon } from 'lucide-react';
import { hasColorModeToggle } from '@/config/theme';
import { useColorMode } from './ColorModeProvider';

/**
 * Dark/light toggle, rendered only when config/theme.js has both palettes and `colorMode.toggle: true`.
 * Shows the mode you switch *to*: a sun in dark mode, a moon in light mode.
 *
 * variant="compact": round icon button next to the language pill (header).
 * variant="menu":    larger version for the mobile menu.
 * variant="links":   icon plus text, for the footer's small-print row.
 *
 * Which icon/text is visible is decided by CSS (`dark:` variants follow `data-color-mode`
 * on <html>), so the server render is correct for either mode without a hydration mismatch.
 */
export default function ColorModeSwitcher({ variant = 'compact', className = '' }) {
    const t = useTranslations('ColorModeSwitcher');
    const { mode, toggle } = useColorMode();

    if (!hasColorModeToggle) return null;

    const label = t(mode === 'dark' ? 'light' : 'dark');

    if (variant === 'links') {
        return (
            <button
                type="button"
                onClick={toggle}
                className={`inline-flex items-center gap-1.5 hover:text-contrast transition-colors ${className}`}
            >
                <Sun size={14} className="hidden dark:block" aria-hidden="true" />
                <Moon size={14} className="dark:hidden" aria-hidden="true" />
                <span className="hidden dark:inline">{t('light')}</span>
                <span className="dark:hidden">{t('dark')}</span>
            </button>
        );
    }

    // Sizes match the language pill of the same variant (see LanguageSwitcher.jsx).
    const isMenu = variant === 'menu';
    const innerSize = isMenu ? 'h-8 w-8' : 'h-6 w-6';
    const iconSize = isMenu ? 18 : 14;

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={label}
            title={label}
            className={`group inline-flex items-center justify-center rounded-full border border-contrast/10 bg-contrast/5 p-1 text-muted hover:text-contrast transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${className}`}
        >
            <span className={`flex items-center justify-center rounded-full group-hover:bg-contrast/10 transition-colors duration-300 ${innerSize}`}>
                <Sun size={iconSize} className="hidden dark:block" aria-hidden="true" />
                <Moon size={iconSize} className="dark:hidden" aria-hidden="true" />
            </span>
        </button>
    );
}
