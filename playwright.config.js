import { defineConfig, devices } from '@playwright/test';

// Visual regression setup for the refactoring work: `npm run visual:update` records a baseline,
// `npm run visual` compares the current build against it. See tests/visual.spec.js.
//
// Runs against a production build on port 3100 (started automatically).
// Optional: PLAYWRIGHT_CHROMIUM_EXECUTABLE / PLAYWRIGHT_CHROMIUM_ARGS point to a custom
// Chromium when the browsers from `npx playwright install chromium` can't be used.

const PORT = 3100;

const launchOptions = {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
    args: process.env.PLAYWRIGHT_CHROMIUM_ARGS ? process.env.PLAYWRIGHT_CHROMIUM_ARGS.split(' ') : undefined,
};

export default defineConfig({
    testDir: './tests',
    testMatch: /visual\.spec\.js/,
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: [['list']],
    timeout: 90_000,
    expect: {
        // Full-page captures of long pages can take a while on slow machines.
        timeout: 30_000,
        toHaveScreenshot: {
            // Fail on any pixel difference; the pages are fully deterministic once video and animations are neutralised.
            maxDiffPixels: 0,
            threshold: 0.05,
            animations: 'disabled',
            caret: 'hide',
        },
    },
    snapshotPathTemplate: '.snapshots/{arg}{ext}',
    outputDir: '.snapshots/results',
    use: {
        baseURL: `http://127.0.0.1:${PORT}`,
        launchOptions,
        // Default OS preference; tests/visual.spec.js switches it per colour mode.
        colorScheme: 'dark',
    },
    projects: [
        {
            name: 'desktop',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
        },
        {
            name: 'mobile',
            use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
        },
    ],
    webServer: {
        command: `npm run build && npm run start -- -p ${PORT}`,
        url: `http://127.0.0.1:${PORT}/`,
        reuseExistingServer: true,
        timeout: 240_000,
    },
});
