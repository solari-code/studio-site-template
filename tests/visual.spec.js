import { test, expect } from '@playwright/test';
import { routing } from '../i18n/routing';

/**
 * Full-page screenshots of every page in every language, desktop and mobile.
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

for (const locale of routing.locales) {
    for (const { name, path } of pages) {
        test(`${name} (${locale})`, async ({ page }, testInfo) => {
            await page.goto(localizedPath(path, locale), { waitUntil: 'networkidle' });
            await page.addStyleTag({ content: NEUTRALISE_CSS });
            await page.waitForTimeout(INTRO_ANIMATION_MS);
            await scrollThroughPage(page);

            await expect(page).toHaveScreenshot(`${name}-${locale}-${testInfo.project.name}.png`, { fullPage: true });
        });
    }
}
