import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, rm, readFile, symlink, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadState } from '../state.mjs';
import { Workspace } from '../workspace.mjs';
import { themes, fontFamilies } from '../themes.mjs';
import theme, { setupOf } from '../steps/theme.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const countComments = (text) => (text.match(/\/\//g) ?? []).length;

let tmp;
before(async () => {
    tmp = await mkdtemp(path.join(os.tmpdir(), 'setup-theme-'));
    for (const dir of ['config', 'i18n', 'messages']) await cp(path.join(root, dir), path.join(tmp, dir), { recursive: true });
    await symlink(path.join(root, 'node_modules'), path.join(tmp, 'node_modules'), 'junction');
});
after(() => rm(tmp, { recursive: true, force: true }));

const read = (file) => readFile(path.join(tmp, file), 'utf8');
const importTheme = () => import(`${pathToFileURL(path.join(tmp, 'config/theme.js')).href}?t=${Date.now()}${Math.random()}`);
const checkSyntax = (file) => execFileSync(process.execPath, ['--check', path.join(tmp, file)], { stdio: 'pipe' });

// Answers as the step's `ask` would return them for a preset and a colour-mode setup.
function answersFor(presetId, setup, overrides = {}) {
    const preset = themes[presetId];
    const SETUP = { dark: ['dark'], light: ['light'] };
    const modes = SETUP[setup] ?? ['dark', 'light'];
    const colorModes = { dark: { default: 'dark', toggle: false }, light: { default: 'light', toggle: false }, system: { default: 'system', toggle: false }, 'system-toggle': { default: 'system', toggle: true }, 'dark-toggle': { default: 'dark', toggle: true }, 'light-toggle': { default: 'light', toggle: true }, 'dark-fixed': { default: 'dark', toggle: false }, 'light-fixed': { default: 'light', toggle: false } };
    return {
        preset: presetId, setup, colorMode: colorModes[setup],
        colors: Object.fromEntries(modes.map((mode) => [mode, { ...preset.colors[mode] }])),
        gradients: preset.gradients, scrollGradient: preset.scrollGradient, fonts: { ...preset.fonts },
        ...overrides,
    };
}

async function apply(answers) {
    const state = await loadState(tmp);
    const changes = theme.changes(state, answers);
    const workspace = new Workspace(tmp);
    await theme.write(state, answers, workspace);
    await workspace.commit();
    checkSyntax('config/theme.js');
    checkSyntax('config/fonts.js');
    return { state, changes, after: await loadState(tmp) };
}

// What check-config verifies for fonts: every role's variable is defined in config/fonts.js.
async function assertFontsConsistent() {
    const fontsSource = (await read('config/fonts.js')).replace(/^\s*\/\/.*$/gm, '');
    const variables = [...fontsSource.matchAll(/variable:\s*'(--font-[a-z0-9-]+)'/g)].map((m) => m[1]);
    const { theme: t } = await importTheme();
    for (const role of ['body', 'heading']) {
        const variable = /^var\((--font-[a-z0-9-]+)\)$/.exec(t.fonts[role].family)[1];
        assert.ok(variables.includes(variable), `${role}: ${variable} is loaded`);
    }
    assert.match(fontsSource, new RegExp(`fontVariables = \\[${variables.map((v) => `${v === '--font-sans' ? 'sans' : 'display'}.variable`).join(', ')}\\]`));
}

describe('theme step', () => {
    test('setupOf recognises every colour-mode setup', () => {
        assert.equal(setupOf({ colors: { dark: {} }, colorMode: { default: 'dark', toggle: false } }), 'dark');
        assert.equal(setupOf({ colors: { light: {} }, colorMode: {} }), 'light');
        assert.equal(setupOf({ colors: { dark: {}, light: {} }, colorMode: { default: 'system', toggle: false } }), 'system');
        assert.equal(setupOf({ colors: { dark: {}, light: {} }, colorMode: { default: 'system', toggle: true } }), 'system-toggle');
        assert.equal(setupOf({ colors: { dark: {}, light: {} }, colorMode: { default: 'dark', toggle: true } }), 'dark-toggle');
        assert.equal(setupOf({ colors: { dark: {}, light: {} }, colorMode: { default: 'light', toggle: false } }), 'light-fixed');
    });

    test('the template theme with its own values is a no-op', async () => {
        const before = await read('config/theme.js');
        const beforeFonts = await read('config/fonts.js');
        const { changes } = await apply(answersFor('nova', 'system-toggle'));
        assert.deepEqual(changes, []);
        assert.equal(await read('config/theme.js'), before);
        assert.equal(await read('config/fonts.js'), beforeFonts);
    });

    test('Editorial: palettes replaced with comments intact, serif heading font loaded as a second family', async () => {
        const before = await read('config/theme.js');
        const { changes, after } = await apply(answersFor('editorial', 'light-toggle'));
        assert.ok(changes.some((c) => c.label === 'colour modes'));
        assert.ok(changes.some((c) => c.label === 'colors.dark.primary' && c.to === '#fb923c'));
        assert.ok(changes.some((c) => c.label === 'fonts.heading' && c.from === 'Inter' && c.to === 'Fraunces'));
        assert.ok(changes.some((c) => c.file === 'config/fonts.js' && c.to === 'Inter + Fraunces'));

        const text = await read('config/theme.js');
        assert.equal(countComments(text), countComments(before) + 0, 'no comment lost or added (the light palette already had pinned shades)');
        assert.match(text, /background: '#1c1917',  \/\/ page background, header, inputs/);
        assert.match(text, /muted: '#6b645e',\n/);
        assert.deepEqual(after.theme.colors, themes.editorial.colors);
        assert.deepEqual(after.theme.colorMode, { default: 'light', toggle: true });
        assert.deepEqual(after.theme.fonts, { body: { family: 'var(--font-sans)', fallback: 'sans-serif' }, heading: { family: 'var(--font-display)', fallback: 'serif' } });
        assert.deepEqual(after.fonts, { body: 'inter', heading: 'fraunces', loaded: { '--font-sans': { name: 'sans', file: 'InterVariable-latin.woff2', id: 'inter' }, '--font-display': { name: 'display', file: 'FrauncesVariable-latin.woff2', id: 'fraunces' } } });
        await assertFontsConsistent();

        const fonts = await read('config/fonts.js');
        assert.match(fonts, /^\/\/ Fonts for the whole site\./, 'header kept');
        assert.match(fonts, /InterVariable-latin\.woff2 {5}sans {3}100–900 {3}\(used below\)/);
        assert.match(fonts, /FrauncesVariable-latin\.woff2 {2}serif {2}100–900 {3}\(used below\)/);
        assert.doesNotMatch(fonts, /LoraVariable-latin\.woff2.*\(used below\)/);
        assert.match(fonts, /export const display = localFont\(\{\n    src: '\.\.\/app\/fonts\/FrauncesVariable-latin\.woff2',\n    weight: '100 900',\n    variable: '--font-display',\n    display: 'swap',\n\}\);/);
        assert.doesNotMatch(fonts, /^\/\/ export const display/m);
        assert.match(fonts, /\/\/ Second family for the headings \(`fonts\.heading` in config\/theme\.js\)\.\nexport const display/);
        assert.doesNotMatch(fonts, /Optional second family/);
        const { resolveColors, themeCss } = await importTheme();
        assert.ok(resolveColors('dark').surface && resolveColors('light').muted === '#6b645e');
        assert.ok(themeCss().includes('[data-color-mode="light"]'));
        assert.match(theme.todos(await loadState(tmp), answersFor('editorial', 'light-toggle'))[0], /Editorial theme is a starting point/);
    });

    test('Atelier on top: body font changes, display font swapped, the theme still imports', async () => {
        const { after } = await apply(answersFor('atelier', 'system-toggle'));
        assert.deepEqual(after.fonts.body, 'dm-sans');
        assert.deepEqual(after.fonts.heading, 'lora');
        assert.deepEqual(after.theme.colors, themes.atelier.colors);
        await assertFontsConsistent();
        const fonts = await read('config/fonts.js');
        assert.match(fonts, /\/\/ DM Sans is bundled locally \(app\/fonts, SIL OFL\)/);
        assert.match(fonts, /export const sans = localFont\(\{\n    src: '\.\.\/app\/fonts\/DMSansVariable-latin\.woff2',\n    weight: '100 1000',/);
        assert.equal((fonts.match(/export const display/g) ?? []).length, 1);
    });

    test('Dusk, dark only: the light palette is removed; one font family again', async () => {
        const { after } = await apply(answersFor('dusk', 'dark'));
        const { colorModes, hasColorModeToggle, staticColorMode } = await importTheme();
        assert.deepEqual(colorModes, ['dark']);
        assert.equal(hasColorModeToggle, false);
        assert.equal(staticColorMode, 'dark');
        assert.deepEqual(after.theme.colors, { dark: themes.dusk.colors.dark });
        assert.deepEqual(after.theme.colorMode, { default: 'dark', toggle: false });
        const fonts = await read('config/fonts.js');
        assert.match(fonts, /^\/\/ Optional second family, e\.g\. for headings; .*\n\/\/ export const display = localFont\(\{ src: '\.\.\/app\/fonts\/Display\.woff2', variable: '--font-display' \}\);$/m, 'the example line and its comment are back');
        assert.match(fonts, /fontVariables = \[sans\.variable\]\.join/);
        assert.deepEqual(after.theme.fonts, { body: { family: 'var(--font-sans)', fallback: 'sans-serif' }, heading: { family: 'var(--font-sans)', fallback: 'sans-serif' } });
        await assertFontsConsistent();
        const text = await read('config/theme.js');
        assert.doesNotMatch(text, /light: \{/);
        assert.match(text, /\/\/ derived from these; a shade can be pinned per mode by adding it here explicitly/, 'the comment above `colors` stays');
    });

    test('light palette added back (with the token comments) and switched to light-first', async () => {
        const { after } = await apply(answersFor('dusk', 'light-toggle'));
        const { colorModes, resolveColors } = await importTheme();
        assert.deepEqual(colorModes, ['dark', 'light']);
        assert.deepEqual(after.theme.colors, themes.dusk.colors);
        assert.ok(resolveColors('light')['surface-deep'] === '#f1eefb');
        const text = await read('config/theme.js');
        assert.match(text, /        light: \{\n            background: '#fbfaff', \/\/ page background, header, inputs\n            foreground: '#171428', \/\/ body text, navigation\n            \/\/ Highest-contrast colour/);
        assert.match(text, /            'on-brand': '#ffffff', \/\/ text on brand-coloured surfaces \(CTA buttons\)\n\n            success: '#16a34a',\n            error: '#dc2626',\n            whatsapp: '#25D366',\n\n            \/\/ Pinned shades: the derived values would be too faint here \(see `shades` below\)\.\n            'muted-strong': '#7f7a94',\n            'surface-deep': '#f1eefb',\n        \},\n    \},/);
    });

    test('custom colours and a single-mode site that gets its palette from the preset', async () => {
        const custom = answersFor('dusk', 'light-toggle', {
            preset: null,
            colors: { dark: { ...themes.dusk.colors.dark, primary: '#ff0000' }, light: { ...themes.dusk.colors.light, background: '#fffff0' } },
        });
        const { changes, after } = await apply(custom);
        assert.deepEqual(changes.map((c) => c.label), ['colors.dark.primary', 'colors.light.background']);
        assert.equal(after.theme.colors.dark.primary, '#ff0000');
        assert.equal(after.theme.colors.light.background, '#fffff0');
        assert.deepEqual(theme.changes(after, custom), []);
    });

    test('a custom (not bundled) font is left alone', async () => {
        // Make the body font a custom file, as a user would by hand.
        let fonts = await read('config/fonts.js');
        fonts = fonts.replace("src: '../app/fonts/ManropeVariable-latin.woff2'", "src: '../app/fonts/MyBrand.woff2'");
        await writeFile(path.join(tmp, 'config/fonts.js'), fonts);
        const state = await loadState(tmp);
        assert.equal(state.fonts.body, null);
        const answers = { ...answersFor('dusk', 'light-toggle'), preset: null, fonts: { body: null, heading: 'lora' } };
        assert.ok(theme.changes(state, answers).some((c) => c.label === 'fonts.heading' && c.from === '(custom)' && c.to === 'Lora'));
        const workspace = new Workspace(tmp);
        await theme.write(state, answers, workspace);
        await workspace.commit();
        const written = await read('config/fonts.js');
        assert.match(written, /src: '\.\.\/app\/fonts\/MyBrand\.woff2'/, 'custom body font kept');
        assert.match(written, /LoraVariable-latin\.woff2',\n    weight: '400 700',\n    variable: '--font-display'/);
        assert.match(written, /fontVariables = \[sans\.variable, display\.variable\]/);
        const { theme: t } = await importTheme();
        assert.deepEqual(t.fonts, { body: { family: 'var(--font-sans)', fallback: 'sans-serif' }, heading: { family: 'var(--font-display)', fallback: 'serif' } });
    });
});
