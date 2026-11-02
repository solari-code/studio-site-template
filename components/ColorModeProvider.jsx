"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    colorModes,
    followsSystemColorMode,
    staticColorMode,
    hasColorModeToggle,
    resolveColors,
    COLOR_MODE_ATTRIBUTE,
    COLOR_MODE_STORAGE_KEY,
} from '@/config/theme';

/**
 * Keeps the colour mode (config/theme.js) in sync between <html>, localStorage and the
 * components that need it (`useColorMode`).
 *
 * The initial mode is set by the inline script in the root layout before the first paint;
 * this provider only reads it back once mounted. While the visitor hasn't chosen explicitly,
 * the site follows the OS preference, including live changes. A click on the toggle stores
 * the choice in localStorage (no cookie).
 */

const ColorModeContext = createContext({
    mode: staticColorMode,
    modes: colorModes,
    setMode: () => {},
    toggle: () => {},
});

const themeColorOf = (mode) => resolveColors(mode).background;

function applyMode(mode) {
    document.documentElement.setAttribute(COLOR_MODE_ATTRIBUTE, mode);
    // Browser chrome (address bar on mobile) follows the page background; the per-OS-preference
    // entries from the layout collapse into the chosen colour.
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
        meta.removeAttribute('media');
        meta.setAttribute('content', themeColorOf(mode));
    });
}

export default function ColorModeProvider({ children }) {
    // `null` until mounted: the server doesn't know the visitor's preference.
    const [mode, setModeState] = useState(null);

    useEffect(() => {
        const current = document.documentElement.getAttribute(COLOR_MODE_ATTRIBUTE) || staticColorMode;
        setModeState(current);
        // A stored choice was applied by the inline script; bring the theme-color metas in line with it.
        if (hasColorModeToggle && colorModes.includes(localStorage.getItem(COLOR_MODE_STORAGE_KEY))) applyMode(current);
    }, []);

    // Follow the OS while there is no explicit choice.
    useEffect(() => {
        if (!followsSystemColorMode) return;
        const query = window.matchMedia('(prefers-color-scheme: light)');
        const onChange = () => {
            if (hasColorModeToggle && colorModes.includes(localStorage.getItem(COLOR_MODE_STORAGE_KEY))) return;
            const next = query.matches ? 'light' : 'dark';
            applyMode(next);
            setModeState(next);
        };
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    const setMode = useCallback((next) => {
        if (!hasColorModeToggle || !colorModes.includes(next)) return;
        applyMode(next);
        setModeState(next);
        try { localStorage.setItem(COLOR_MODE_STORAGE_KEY, next); } catch { /* storage unavailable: the choice lasts for this page view */ }
    }, []);

    const value = useMemo(() => ({
        mode: mode ?? staticColorMode,
        modes: colorModes,
        setMode,
        toggle: () => setMode((mode ?? staticColorMode) === 'dark' ? 'light' : 'dark'),
    }), [mode, setMode]);

    return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

/**
 * `{ mode, modes, setMode, toggle }`. `mode` is the site's current mode ('dark' | 'light');
 * before hydration it is the static mode from config/theme.js.
 */
export function useColorMode() {
    return useContext(ColorModeContext);
}
