import { test, expect } from '@playwright/test';
import { routing } from '../i18n/routing';
import { colorModes, staticColorMode, followsSystemColorMode, hasColorModeToggle, COLOR_MODE_STORAGE_KEY } from '../config/theme';

/**
 * Full-page screenshots of every page in every language and colour mode, desktop and mobile.
 *
 *   npm run visual:update   records the baseline into .snapshots/
 *   npm run visual          compares the current build against the baseline
 *
 * To make the pages deterministic:
 * - the hero video and its poster are hidden (the overlay and text stay),
 * - the page is scrolled through once so all `.fade-in` elements become visible,
 *   then scrolled back to the top, and intro animations (Framer Motion) are given time to finish,
 * - CSS animations/transitions are frozen by Playwright (`animations: 'disabled'`).
 */

const pages = [
    { name: 'home', path: '/' },
    { name: 'starter', path: '/starter' },
    { name: 'impressum', path: '/impressum' },
    { name: 'privacy', path: '/privacy' },
    { name: '404', path: '/this-page-does-not-exist' },
];

// Intro animations on the hero run for roughly 3.5 s (character stagger + CTA delay).
const INTRO_ANIMATION_MS = 4500;

const NEUTRALISE_CSS = `
  video, #hero img { visibility: hidden !important; }
  html { scroll-behavior: auto !important; }
`;

function localizedPath(path, locale) {
    if (locale === routing.defaultLocale) return path;
    return `/${locale}${path === '/' ? '' : path}`;
}

async function scrollThroughPage(page) {
    await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const step = Math.floor(window.innerHeight * 0.7);
        let y = 0;
        const max = () => document.documentElement.scrollHeight - window.innerHeight;
        while (y < max()) {
            y = Math.min(y + step, max());
            window.scrollTo(0, y);
            await sleep(120);
        }
        // The IntersectionObserver behind `.fade-in` doesn't always fire reliably during scripted
        // scrolling in headless mode, so force the revealed end state explicitly.
        document.querySelectorAll('.fade-in').forEach((el) => el.classList.add('is-visible'));
        // Let the last fade-in transitions (0.7 s + up to 0.75 s stagger) finish.
        await sleep(1700);
        window.scrollTo(0, 0);
        await sleep(500);
        // Make sure scroll-driven effects (e.g. the gradient headings) processed the final scroll position.
        window.dispatchEvent(new Event('scroll'));
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        await sleep(300);
    });
}

// Colour modes to capture (config/theme.js): every configured mode when the browser decides
// (OS preference and/or toggle), otherwise just the fixed one.
const modes = followsSystemColorMode || hasColorModeToggle ? colorModes : [staticColorMode];

// Puts the site into `mode` the way a visitor would get there: via the OS preference, or,
// for a fixed default with a toggle, via a stored choice.
async function useColorMode(page, mode) {
    if (followsSystemColorMode) await page.emulateMedia({ colorScheme: mode });
    else if (hasColorModeToggle) await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [COLOR_MODE_STORAGE_KEY, mode]);
}

for (const locale of routing.locales) {
    for (const mode of modes) {
        for (const { name, path } of pages) {
            test(`${name} (${locale}, ${mode})`, async ({ page }, testInfo) => {
                await useColorMode(page, mode);
                await page.goto(localizedPath(path, locale), { waitUntil: 'networkidle' });
                await page.addStyleTag({ content: NEUTRALISE_CSS });
                await page.waitForTimeout(INTRO_ANIMATION_MS);
                await scrollThroughPage(page);

                await expect(page).toHaveScreenshot(`${name}-${locale}-${mode}-${testInfo.project.name}.png`, { fullPage: true });
            });
        }
    }
}
