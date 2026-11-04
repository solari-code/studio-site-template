import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, copyFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SourceFile, raw, printValue, parseBlock, parsePath, detectQuote, detectIndentUnit, deepEqual } from '../source.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const configFile = (name) => path.join(root, name);

// Writes files into a fresh temp dir and imports one of them (a fresh module instance every time).
async function importFromTemp(files, entry) {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'setup-test-'));
    for (const [name, content] of Object.entries(files)) {
        if (content === null) await copyFile(configFile(name), path.join(dir, path.basename(name)));
        else await writeFile(path.join(dir, path.basename(name)), content);
    }
    try {
        return await import(`${pathToFileURL(path.join(dir, path.basename(entry))).href}?t=${Date.now()}`);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

// `node --check` on a file: the edit must at least leave valid syntax behind.
async function assertParses(text) {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'setup-check-'));
    const file = path.join(dir, 'file.mjs');
    await writeFile(file, text);
    try {
        execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

const countComments = (text) => (text.match(/\/\//g) ?? []).length;

const sample = `// header comment
export const cfg = {
    name: 'Nova', // the name
    url: 'https://example.com',
    inline: { type: 'intro' },

    // Above contrast
    // second line
    contrast: '#ffffff',
    list: [
        { id: 'a' },
        // note on b
        { id: 'b' }, // trailing b
        { id: 'c' },
        // tail comment
    ],
    'on-brand': '#fff',
    expr: process.env.X ? ['umami'] : [],
    nested: {
        deep: { value: 1 },
    },
};
export const single = 'en' // no semicolon
export const list = ['en', 'de'];
`;

describe('paths and helpers', () => {
    test('parsePath', () => {
        assert.deepEqual(parsePath('pages.home.sections[2].enabled'), ['pages', 'home', 'sections', 2, 'enabled']);
        assert.deepEqual(parsePath('theme.colors.dark.on-brand'), ['theme', 'colors', 'dark', 'on-brand']);
        assert.deepEqual(parsePath('list[0][1]'), ['list', 0, 1]);
        assert.deepEqual(parsePath(['a', 1]), ['a', 1]);
    });

    test('detectQuote and detectIndentUnit follow the file', () => {
        assert.equal(detectQuote(`a = 'x'; b = "y"; c = 'z'; // "comment"`), "'");
        assert.equal(detectQuote(`a = "x"; b = "y"; c = 'z';`), '"');
        assert.equal(detectIndentUnit('{\n    a: 1,\n        b: 2,\n}'), '    ');
        assert.equal(detectIndentUnit('{\n  a: 1,\n}'), '  ');
        assert.equal(detectIndentUnit('{\n\ta: 1,\n}'), '\t');
        assert.equal(detectIndentUnit('flat'), '    ');
        assert.equal(detectIndentUnit('/**\n * doc\n */\n{\n    a: 1,\n}'), '    ');
        assert.equal(detectIndentUnit('{\n    // note\n    a: 1,\n  // odd comment\n}'), '    ');
    });

    test('deepEqual', () => {
        assert.ok(deepEqual({ a: [1, { b: 'x' }] }, { a: [1, { b: 'x' }] }));
        assert.ok(deepEqual({ a: 1, b: undefined }, { a: 1 }));
        assert.ok(!deepEqual({ a: 1 }, { a: 2 }));
        assert.ok(!deepEqual([1, 2], [2, 1]));
        assert.ok(deepEqual(raw('x'), raw('x')));
        assert.ok(!deepEqual(raw('x'), 'x'));
    });

    test('parseBlock splits entries and attaches comments', () => {
        const text = sample;
        const block = parseBlock(text, text.indexOf('{'));
        assert.equal(block.kind, 'object');
        assert.ok(block.multiline);
        assert.equal(block.indent, '    ');
        assert.deepEqual(block.entries.map((e) => e.key), ['name', 'url', 'inline', 'contrast', 'list', 'on-brand', 'expr', 'nested']);
        const [name, , , contrast] = block.entries;
        assert.equal(name.trailing, '// the name');
        assert.equal(name.valueStart, text.indexOf("'Nova'"));
        assert.deepEqual(contrast.leading, ['// Above contrast', '// second line']);
        assert.ok(contrast.blankBefore);
        const list = parseBlock(text, text.indexOf('['));
        assert.equal(list.kind, 'array');
        assert.deepEqual(list.entries.map((e) => e.text), ["{ id: 'a' }", "{ id: 'b' }", "{ id: 'c' }"]);
        assert.deepEqual(list.entries[1].leading, ['// note on b']);
        assert.equal(list.entries[1].trailing, '// trailing b');
        assert.deepEqual(list.tail, ['// tail comment']);
    });
});

describe('printValue', () => {
    test('primitives and quoting', () => {
        assert.equal(printValue('it\'s'), "'it\\'s'");
        assert.equal(printValue('say "hi"', { quote: '"' }), '"say \\"hi\\""');
        assert.equal(printValue(0.5), '0.5');
        assert.equal(printValue(false), 'false');
        assert.equal(printValue(null), 'null');
        assert.equal(printValue(raw('process.env.X')), 'process.env.X');
        assert.throws(() => printValue(undefined));
    });

    test('short objects and arrays stay inline, long ones break per entry', () => {
        assert.equal(printValue({ from: 'highlight', to: 'highlight-alt' }), "{ from: 'highlight', to: 'highlight-alt' }");
        assert.equal(printValue(['secondary', 'tertiary']), "['secondary', 'tertiary']");
        assert.equal(printValue({}), '{}');
        assert.equal(printValue([]), '[]');
        assert.equal(printValue({ 'on-brand': '#fff', ok: 1 }), "{ 'on-brand': '#fff', ok: 1 }");
        const long = { background: '#0D1117', foreground: '#E6EDF3', contrast: '#ffffff', primary: '#3081F7', accent: '#22d3ee', secondary: '#D946EF' };
        assert.equal(printValue(long, { indent: '        ' }), [
            '{',
            "            background: '#0D1117',",
            "            foreground: '#E6EDF3',",
            "            contrast: '#ffffff',",
            "            primary: '#3081F7',",
            "            accent: '#22d3ee',",
            "            secondary: '#D946EF',",
            '        }',
        ].join('\n'));
        assert.equal(printValue({ a: 1 }, { forceMultiline: true }), '{\n    a: 1,\n}');
        assert.equal(printValue({ a: 1 }, { unit: '  ', forceMultiline: true }), '{\n  a: 1,\n}');
    });
});

describe('SourceFile edits', () => {
    test('set replaces only the value and keeps the trailing comment', () => {
        const f = new SourceFile(sample).set('cfg.name', 'Acme');
        assert.match(f.text, /name: 'Acme', \/\/ the name\n/);
        assert.equal(f.get('cfg.name'), 'Acme');
        assert.equal(countComments(f.text), countComments(sample));
    });

    test('set is a no-op for an equal value and keeps expressions untouched otherwise', () => {
        const f = new SourceFile(sample);
        f.set('cfg.name', 'Nova');
        f.set('cfg.nested', { deep: { value: 1 } });
        assert.equal(f.text, sample);
        assert.equal(f.get('cfg.expr'), undefined); // not plain data
        assert.equal(f.source('cfg.expr'), "process.env.X ? ['umami'] : []");
        f.set('cfg.expr', raw("process.env.Y ? ['a'] : []"));
        assert.match(f.text, /expr: process\.env\.Y \? \['a'\] : \[\],/);
    });

    test('set prints nested values in the file style at the right indentation', () => {
        const f = new SourceFile(sample).set('cfg.nested', { deep: { value: 2 }, more: 'x' });
        assert.match(f.text, /    nested: \{ deep: \{ value: 2 \}, more: 'x' \},\n/);
        const wide = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`key${i}`, `value-${i}`]));
        const g = new SourceFile(sample).set('cfg.nested', wide);
        assert.match(g.text, /    nested: \{\n        key0: 'value-0',\n(.*\n)*        key7: 'value-7',\n    \},\n/);
    });

    test('set and rewriteObject keep aligned trailing comments in their column', () => {
        const src = `export const t = {\n    a: '#0D1117',  // bg\n    bb: 'x',      // short\n    c: 1, // one space\n};\n`;
        const f = new SourceFile(src);
        f.set('t.a', '#fff');
        f.set('t.bb', 'longer value');
        f.set('t.c', 12345);
        assert.equal(f.text, `export const t = {\n    a: '#fff',     // bg\n    bb: 'longer value', // short\n    c: 12345, // one space\n};\n`);
        const g = new SourceFile(src).rewriteObject('t', { a: '#fff', bb: 'longer value', c: 12345 });
        assert.equal(g.text, f.text);
    });

    test('set works on hyphenated keys, array items and declarations without semicolon', () => {
        const f = new SourceFile(sample);
        f.set('cfg.on-brand', '#abcdef');
        f.set('cfg.list[1].id', 'bee');
        f.set('single', 'de');
        f.set('list', ['en', 'de', 'fr']);
        assert.match(f.text, /'on-brand': '#abcdef',/);
        assert.match(f.text, /\{ id: 'bee' \}, \/\/ trailing b/);
        assert.match(f.text, /export const single = 'de' \/\/ no semicolon\n/);
        assert.match(f.text, /export const list = \['en', 'de', 'fr'\];\n/);
    });

    test('assign sets an existing property or appends a new one, inline or multi-line', () => {
        const f = new SourceFile(sample);
        f.assign('cfg.inline.enabled', false);
        f.assign('cfg.list[0].enabled', false);
        f.assign('cfg.nested.extra', 'x');
        f.assign('cfg.name', 'Acme');
        assert.match(f.text, /inline: \{ type: 'intro', enabled: false \},/);
        assert.match(f.text, /\{ id: 'a', enabled: false \},/);
        assert.match(f.text, /    nested: \{\n        deep: \{ value: 1 \},\n        extra: 'x',\n    \},/);
        assert.match(f.text, /name: 'Acme', \/\/ the name/);
        f.assign('cfg.inline.enabled', true);
        assert.match(f.text, /inline: \{ type: 'intro', enabled: true \},/);
    });

    test('insert places an entry after/before a key with its own comments', () => {
        const f = new SourceFile(sample);
        f.insert('cfg', 'added', { a: 1 }, { after: 'name', comments: { leading: ['// lead'], trailing: '// new', blankBefore: true } });
        f.insert('cfg', 'first', 1, { before: 'name' });
        f.insert('cfg.list', null, { id: 'd' });
        assert.match(f.text, /export const cfg = \{\n    first: 1,\n    name: 'Nova', \/\/ the name\n\n    \/\/ lead\n    added: \{ a: 1 \}, \/\/ new\n    url:/);
        assert.match(f.text, /\{ id: 'c' \},\n        \{ id: 'd' \},\n        \/\/ tail comment\n    \],/);
        assert.throws(() => f.insert('cfg', 'x', 1, { after: 'missing' }), /no property "missing"/);
    });

    test('remove drops the entry with its comments and blank line', () => {
        const f = new SourceFile(sample);
        f.remove('cfg.contrast');
        assert.doesNotMatch(f.text, /Above contrast|second line|#ffffff/);
        assert.match(f.text, /inline: \{ type: 'intro' \},\n    list: \[/);
        f.remove('cfg.list[1]');
        assert.doesNotMatch(f.text, /note on b|trailing b/);
        assert.match(f.text, /\{ id: 'a' \},\n        \{ id: 'c' \},\n        \/\/ tail comment/);
        f.remove('cfg.inline.type');
        assert.match(f.text, /inline: \{\},/);
        assert.throws(() => f.remove('cfg.missing'), /no property "missing"/);
    });

    test('rewriteObject keeps comments of kept keys, drops removed ones, adds new ones with given comments', () => {
        const f = new SourceFile(sample);
        f.rewriteObject('cfg', {
            name: 'Acme',
            contrast: '#000',
            fresh: ['x', 'y'],
            expr: raw("process.env.X ? ['umami'] : []"),
            list: f.get('cfg.list'),
        }, { comments: { fresh: { leading: ['// brand new'], trailing: '// fresh', blankBefore: true } } });
        assert.equal(f.text, `// header comment
export const cfg = {
    name: 'Acme', // the name

    // Above contrast
    // second line
    contrast: '#000',

    // brand new
    fresh: ['x', 'y'], // fresh
    expr: process.env.X ? ['umami'] : [],
    list: [
        { id: 'a' },
        // note on b
        { id: 'b' }, // trailing b
        { id: 'c' },
        // tail comment
    ],
};
export const single = 'en' // no semicolon
export const list = ['en', 'de'];
`);
        assert.throws(() => f.rewriteObject('cfg.list', {}), /not an object/);
    });

    test('rewriteArray keeps the text and comments of unchanged items (also when reordered)', () => {
        const f = new SourceFile(sample);
        f.rewriteArray('cfg.list', [{ id: 'c' }, { id: 'b' }, { id: 'new' }]);
        assert.match(f.text, /list: \[\n        \{ id: 'c' \},\n        \/\/ note on b\n        \{ id: 'b' \}, \/\/ trailing b\n        \{ id: 'new' \},\n        \/\/ tail comment\n    \],/);
        f.rewriteArray('cfg.list', []);
        assert.match(f.text, /list: \[\n        \/\/ tail comment\n    \],/);
        f.rewriteArray('list', ['de', 'en', 'fr']);
        assert.match(f.text, /export const list = \['de', 'en', 'fr'\];/);
        assert.throws(() => f.rewriteArray('cfg', []), /not an array/);
    });

    test('reorder moves entries with their comments and validates the permutation', () => {
        const f = new SourceFile(sample);
        f.reorder('cfg.list', [2, 1, 0]);
        assert.match(f.text, /list: \[\n        \{ id: 'c' \},\n        \/\/ note on b\n        \{ id: 'b' \}, \/\/ trailing b\n        \{ id: 'a' \},\n        \/\/ tail comment\n    \],/);
        assert.throws(() => f.reorder('cfg.list', [0, 1]), /each index 0–2 exactly once/);
        assert.throws(() => f.reorder('cfg.list', [0, 0, 1]), /each index 0–2 exactly once/);
    });

    test('errors name the file and the missing path', () => {
        const f = new SourceFile(sample, { path: 'config/x.js' });
        assert.throws(() => f.locate('nope.a'), /config\/x\.js: no declaration of "nope"/);
        assert.throws(() => f.locate('cfg.missing'), /config\/x\.js: cfg has no property "missing"/);
        assert.throws(() => f.locate('cfg.list[9]'), /cfg\.list has no item 9/);
        assert.throws(() => f.locate('cfg.name.x'), /cfg\.name is not an object or array/);
        assert.equal(f.has('cfg.name'), true);
        assert.equal(f.has('cfg.nope'), false);
    });

    test('the same edits applied twice give the same text', () => {
        const edit = (f) => f.set('cfg.name', 'Acme').assign('cfg.inline.enabled', false).rewriteArray('cfg.list', [{ id: 'c' }, { id: 'a' }]).reorder('cfg.list', [1, 0]);
        const once = edit(new SourceFile(sample)).text;
        const twice = edit(new SourceFile(once)).text;
        assert.equal(once, twice);
    });
});

describe('the real config files', () => {
    test('rewriting every block of config/theme.js with its own values changes nothing', async () => {
        const { theme } = await import(pathToFileURL(configFile('config/theme.js')).href);
        const f = await SourceFile.read(configFile('config/theme.js'));
        const before = f.text;
        assert.equal(f.quote, "'");
        for (const mode of Object.keys(theme.colors)) f.rewriteObject(`theme.colors.${mode}`, theme.colors[mode]);
        f.rewriteObject('theme.gradients', theme.gradients);
        f.rewriteObject('theme.shades', theme.shades);
        f.rewriteObject('theme.fonts', theme.fonts);
        f.rewriteObject('theme', theme);
        f.set('theme.colorMode', theme.colorMode);
        assert.equal(f.text, before);
    });

    test('rewriting config/site.js and i18n/routing.js with their own values changes nothing', async () => {
        const { siteConfig } = await import(pathToFileURL(configFile('config/site.js')).href);
        const f = await SourceFile.read(configFile('config/site.js'));
        const before = f.text;
        assert.equal(f.quote, '"');
        f.rewriteArray('siteConfig.social', siteConfig.social);
        f.rewriteObject('siteConfig.contact', siteConfig.contact);
        f.rewriteObject('siteConfig', siteConfig);
        assert.equal(f.text, before);

        const routing = await import(pathToFileURL(configFile('i18n/routing.js')).href);
        const g = await SourceFile.read(configFile('i18n/routing.js'));
        const beforeRouting = g.text;
        g.rewriteArray('locales', routing.locales);
        g.rewriteObject('localeNames', routing.localeNames);
        g.set('defaultLocale', routing.defaultLocale);
        assert.equal(g.text, beforeRouting);
    });

    test('reordering config/pages.js sections with the identity changes nothing', async () => {
        const { pages } = await import(pathToFileURL(configFile('config/pages.js')).href);
        const f = await SourceFile.read(configFile('config/pages.js'));
        const before = f.text;
        for (const key of Object.keys(pages)) {
            if (!pages[key].sections) continue;
            f.reorder(`pages.${key}.sections`, pages[key].sections.map((_, i) => i));
            f.rewriteObject(`pages.${key}`, { ...pages[key], extraSections: undefined, extraParagraphs: undefined, ...(f.has(`pages.${key}.extraSections`) && { extraSections: raw(f.source(`pages.${key}.extraSections`)) }) });
        }
        f.set('pages.home.sections[0].background', pages.home.sections[0].background);
        assert.equal(f.text, before);
    });

    test('theme.js: new palette values keep every comment; a removed palette makes a single-mode site', async () => {
        const { theme } = await import(pathToFileURL(configFile('config/theme.js')).href);
        const f = await SourceFile.read(configFile('config/theme.js'));
        const dark = { ...theme.colors.dark, background: '#101010', primary: '#ff0000' };
        f.rewriteObject('theme.colors.dark', dark);
        assert.equal(countComments(f.source('theme.colors.dark')), countComments(new SourceFile(await readFile(configFile('config/theme.js'), 'utf8')).source('theme.colors.dark')));
        f.remove('theme.colors.light');
        f.set('theme.colorMode', { default: 'dark', toggle: false });
        const edited = await importFromTemp({ 'config/theme.js': f.text }, 'config/theme.js');
        assert.deepEqual(edited.colorModes, ['dark']);
        assert.equal(edited.theme.colors.dark.background, '#101010');
        assert.equal(edited.theme.colors.dark.primary, '#ff0000');
        assert.equal(edited.theme.colors.dark['on-brand'], '#ffffff');
        assert.equal(edited.hasColorModeToggle, false);
        assert.ok(edited.resolveColors('dark').surface);
    });

    test('theme.js: a palette can be added back with comments, and the file still imports', async () => {
        const { theme } = await import(pathToFileURL(configFile('config/theme.js')).href);
        const f = await SourceFile.read(configFile('config/theme.js'));
        f.remove('theme.colors.light');
        f.insert('theme.colors', 'light', theme.colors.light, { comments: { leading: ['// Light palette'] } });
        assert.match(f.text, /        \/\/ Light palette\n        light: \{\n            background: '#ffffff',\n/);
        assert.match(f.text, /            'surface-deep': '#f3f4f6',\n        \},\n    \},/);
        const edited = await importFromTemp({ 'config/theme.js': f.text }, 'config/theme.js');
        assert.deepEqual(edited.colorModes, ['dark', 'light']);
        assert.deepEqual(edited.theme.colors.light, theme.colors.light);
    });

    test('pages.js: disabling by index and reordering survive an import', async () => {
        const { pages } = await import(pathToFileURL(configFile('config/pages.js')).href);
        const f = await SourceFile.read(configFile('config/pages.js'));
        const index = pages.home.sections.findIndex((s) => s.type === 'work');
        f.assign(`pages.home.sections[${index}].enabled`, false);
        const lab = pages.home.sections.findIndex((s) => s.type === 'lab');
        f.remove(`pages.home.sections[${lab}].enabled`);
        f.set('pages.home.sections[0].ctaHref', '#services');
        f.assign('pages.starter.enabled', false);
        const order = pages.home.sections.map((_, i) => i).reverse();
        f.reorder('pages.home.sections', order);
        const edited = await importFromTemp({ 'config/theme.js': null, 'config/pages.js': f.text }, 'config/pages.js');
        assert.deepEqual(edited.pages.home.sections.map((s) => s.type), pages.home.sections.map((s) => s.type).reverse());
        assert.equal(edited.pages.home.sections.find((s) => s.type === 'work').enabled, false);
        assert.equal(edited.pages.home.sections.find((s) => s.type === 'lab').enabled, undefined);
        assert.equal(edited.pages.home.sections.find((s) => s.type === 'hero').ctaHref, '#services');
        assert.equal(edited.pages.starter.enabled, false);
        assert.deepEqual(edited.enabledSections(edited.pages.home).map((s) => s.type), ['contact', 'about', 'process', 'lab', 'services', 'intro', 'hero']);
        // the comments of the moved entries travelled with them
        assert.equal(countComments(f.source('pages.home.sections')), countComments(new SourceFile(await readFile(configFile('config/pages.js'), 'utf8')).source('pages.home.sections')));
        assert.match(f.text, /\/\/ Texts from `Process\.steps\.<id>`\.\n                steps: \['discover'/);
    });

    test('site.js: brand values and social links, in the file\'s double-quote style', async () => {
        const f = await SourceFile.read(configFile('config/site.js'));
        f.set('siteConfig.name', 'Acme Studio');
        f.set('siteConfig.url', 'https://acme.example');
        f.set('siteConfig.contact.whatsappNumber', '');
        f.rewriteArray('siteConfig.social', [
            { label: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/acme' },
            { label: 'GitHub', icon: 'github', url: 'https://github.com/' },
        ]);
        assert.match(f.text, /name: "Acme Studio",\n/);
        assert.match(f.text, /whatsappNumber: "",\n/);
        assert.match(f.text, /social: \[\n        \{ label: "Instagram", icon: "instagram", url: "https:\/\/www\.instagram\.com\/acme" \},\n        \{ label: "GitHub", icon: "github", url: "https:\/\/github\.com\/" \},\n        \/\/ \{ label: "Instagram", icon: "instagram", url: "https:\/\/www\.instagram\.com\/" \},\n    \],/);
        assert.match(f.text, /\/\/ Shown as a "Chat on WhatsApp" button/); // the comment above the value stayed
        const edited = await importFromTemp({ 'config/site.js': f.text }, 'config/site.js');
        assert.equal(edited.siteConfig.name, 'Acme Studio');
        assert.equal(edited.siteConfig.social.length, 2);
        assert.equal(edited.siteConfig.contact.email, 'hello@example.com');
    });

    test('routing.js: locales, default and names', async () => {
        const f = await SourceFile.read(configFile('i18n/routing.js'));
        f.rewriteArray('locales', ['de', 'en', 'fr']);
        f.set('defaultLocale', 'de');
        f.rewriteObject('localeNames', { de: 'Deutsch', en: 'English', fr: 'Français' });
        assert.match(f.text, /export const locales = \['de', 'en', 'fr'\];\nexport const defaultLocale = 'de';\n/);
        assert.match(f.text, /\/\/ Shown in the language switcher\.\nexport const localeNames = \{\n    de: 'Deutsch',\n    en: 'English',\n    fr: 'Français',\n\};/);
        await assertParses(f.text);
    });
});
