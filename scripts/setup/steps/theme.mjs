/**
 * Step "Theme & fonts": an example theme or the current one, the colour-mode setup, optional
 * colour adjustments and the fonts -> config/theme.js and config/fonts.js.
 */
import { text, select, confirm, log, note } from '../prompts.mjs';
import * as v from '../validate.mjs';
import { themes, fontFamilies, matchTheme, paletteComments, pinnedShadesComment } from '../themes.mjs';

const THEME_FILE = 'config/theme.js';
const FONTS_FILE = 'config/fonts.js';

// Base tokens in the order they are written; the ones the assistant offers to adjust come first.
const ADJUSTABLE = ['background', 'foreground', 'contrast', 'primary', 'accent', 'secondary', 'tertiary', 'on-brand'];
const BASE_TOKENS = [...ADJUSTABLE, 'success', 'error', 'whatsapp'];
const TOKEN_HINTS = {
    background: 'page background, header, inputs',
    foreground: 'body text, navigation',
    contrast: 'headings; hairline borders and card fills with alpha',
    primary: 'buttons, focus rings, gradient starts',
    accent: 'icons, badges, tags, glows, gradient ends',
    secondary: 'highlighted words, hover colour',
    tertiary: 'end colour of the highlight gradient',
    'on-brand': 'text on buttons',
};

// The colour-mode setups (see config/theme.js): which palettes exist and how they are used.
const SETUPS = {
    dark: { label: 'Dark only', modes: ['dark'], colorMode: { default: 'dark', toggle: false } },
    light: { label: 'Light only', modes: ['light'], colorMode: { default: 'light', toggle: false } },
    system: { label: 'Dark and light, following the visitor\'s system preference', modes: ['dark', 'light'], colorMode: { default: 'system', toggle: false } },
    'system-toggle': { label: 'Dark and light, system preference + a switch', hint: 'the choice is kept in localStorage', modes: ['dark', 'light'], colorMode: { default: 'system', toggle: true } },
    'dark-toggle': { label: 'Dark and light, starts dark + a switch', modes: ['dark', 'light'], colorMode: { default: 'dark', toggle: true } },
    'light-toggle': { label: 'Dark and light, starts light + a switch', modes: ['dark', 'light'], colorMode: { default: 'light', toggle: true } },
    'dark-fixed': { label: 'Dark, with a light palette only for pinned sections', hint: 'no switch', modes: ['dark', 'light'], colorMode: { default: 'dark', toggle: false } },
    'light-fixed': { label: 'Light, with a dark palette only for pinned sections', hint: 'no switch, e.g. a dark hero', modes: ['dark', 'light'], colorMode: { default: 'light', toggle: false } },
};

// The setup key that describes a theme's `colors` and `colorMode`.
export function setupOf(theme) {
    const modes = ['dark', 'light'].filter((mode) => theme.colors[mode]);
    if (modes.length === 1) return modes[0];
    const { default: def = 'system', toggle = false } = theme.colorMode ?? {};
    if (def === 'system') return toggle ? 'system-toggle' : 'system';
    return toggle ? `${def}-toggle` : `${def}-fixed`;
}

const describeSetup = (key) => SETUPS[key].label;

// A coloured block for the terminal (24-bit colour; terminals without it show spaces).
const swatch = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return `\x1b[48;2;${(n >> 16) & 255};${(n >> 8) & 255};${n & 255}m   \x1b[0m`;
};

// The main tokens of the palettes as a table: one row per token, a swatch and the hex per mode.
function paletteTable(colors) {
    const modes = Object.keys(colors);
    const rows = [`${''.padEnd(12)}${modes.map((m) => m.padEnd(14)).join('')}`];
    for (const token of ADJUSTABLE) rows.push(`${token.padEnd(12)}${modes.map((m) => `${swatch(colors[m][token])} ${colors[m][token].padEnd(9)}`).join('')}`);
    return rows.join('\n');
}

// '#FFF' -> '#ffffff'; keeps `original` when it is the same colour, so nothing changes by case alone.
function normalizeHex(value, original) {
    const expanded = value.toLowerCase().replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/, '#$1$1$2$2$3$3');
    return original && expanded === normalizeHex(original) ? original : expanded;
}

// The current theme as the data the step works with (palettes copied, so they can be edited).
function currentTheme(state) {
    const { theme, fonts } = state;
    return {
        colors: Object.fromEntries(Object.entries(theme.colors).map(([mode, palette]) => [mode, { ...palette }])),
        colorMode: { ...theme.colorMode },
        gradients: theme.gradients,
        scrollGradient: theme.scrollGradient,
        fonts: { body: fonts.body, heading: fonts.heading },
    };
}

const step = {
    id: 'theme',
    title: 'Theme & fonts',
    hint: 'example themes, colour modes, colours, fonts',

    async ask(state) {
        log.step('Theme & fonts');
        const current = currentTheme(state);
        const currentPreset = matchTheme(state.theme, current.fonts);

        // 1. Theme
        const presetId = await select({
            message: 'Theme',
            options: [
                { value: '', label: 'Keep the current theme', hint: currentPreset ? `currently "${themes[currentPreset].name}"` : 'customised' },
                ...Object.entries(themes).map(([id, t]) => ({ value: id, label: t.name, hint: t.description })),
            ],
            initialValue: '',
        });
        const preset = presetId ? themes[presetId] : null;
        const base = preset
            ? { colors: structuredClone(preset.colors), colorMode: { ...preset.colorMode }, gradients: preset.gradients, scrollGradient: preset.scrollGradient, fonts: { ...preset.fonts } }
            : current;

        // 2. Colour modes
        const setupKey = await select({
            message: 'Colour modes',
            options: Object.entries(SETUPS).map(([value, s]) => ({ value, label: s.label, hint: s.hint })),
            initialValue: setupOf(base),
        });
        const setup = SETUPS[setupKey];
        const colors = {};
        for (const mode of setup.modes) {
            // A palette the current theme doesn't have: from the preset, else the example theme closest to it.
            colors[mode] = base.colors[mode] ?? (currentPreset ? themes[currentPreset] : themes.nova).colors[mode];
            if (!base.colors[mode]) log.info(`There is no ${mode} palette yet; starting from ${currentPreset ? themes[currentPreset].name : 'Nova'}'s. You can adjust it below or in config/theme.js.`);
        }

        // 3. Colours
        note(paletteTable(colors), preset ? `${preset.name} colours` : 'Current colours');
        if (await confirm({ message: 'Adjust colours? (the main tokens per palette; everything else stays)', initialValue: false })) {
            for (const mode of setup.modes) {
                log.message(`${mode} palette`);
                for (const token of ADJUSTABLE) {
                    const answer = await text({
                        message: `${swatch(colors[mode][token])} ${mode} ${token} (${TOKEN_HINTS[token]})`,
                        initialValue: colors[mode][token],
                        validate: v.hexColor,
                    });
                    colors[mode][token] = normalizeHex(answer, colors[mode][token]);
                }
            }
            note(paletteTable(colors), 'Adjusted colours');
        }

        // 4. Fonts
        const fontOptions = Object.entries(fontFamilies).map(([id, f]) => ({ value: id, label: f.name, hint: f.hint }));
        const keepCustom = (role) => (current.fonts[role] === null ? [{ value: '', label: 'Keep the current font', hint: `not a bundled font, see ${FONTS_FILE}` }] : []);
        const body = await select({
            message: 'Body font',
            options: [...keepCustom('body'), ...fontOptions],
            initialValue: base.fonts.body ?? '',
        });
        const heading = await select({
            message: 'Heading font',
            options: [{ value: 'body', label: 'Same as the body font' }, ...keepCustom('heading'), ...fontOptions],
            initialValue: base.fonts.heading === base.fonts.body ? 'body' : (base.fonts.heading ?? ''),
        });
        const fonts = {
            body: body || null,
            heading: heading === 'body' ? (body || null) : (heading || null),
        };

        return { preset: presetId || null, setup: setupKey, colorMode: setup.colorMode, colors, gradients: base.gradients, scrollGradient: base.scrollGradient, fonts };
    },

    changes(state, a) {
        const { theme, fonts } = state;
        const changes = [];
        const add = (file, label, from, to) => { if (JSON.stringify(from) !== JSON.stringify(to)) changes.push({ file, label, from, to }); };

        const currentSetup = setupOf(theme);
        if (currentSetup !== a.setup) add(THEME_FILE, 'colour modes', describeSetup(currentSetup), describeSetup(a.setup));
        for (const mode of ['dark', 'light']) {
            const before = theme.colors[mode];
            const after = a.colors[mode];
            if (before && !after) changes.push({ file: THEME_FILE, label: `colors.${mode}`, from: 'palette', to: 'removed' });
            else if (!before && after) changes.push({ file: THEME_FILE, label: `colors.${mode}`, from: null, to: `new palette${a.preset ? ` (${themes[a.preset].name})` : ''}` });
            else if (before && after) {
                const tokens = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((t) => before[t] !== after[t]);
                for (const t of tokens) add(THEME_FILE, `colors.${mode}.${t}`, before[t] ?? '(derived)', after[t] ?? '(derived)');
            }
        }
        add(THEME_FILE, 'gradients', theme.gradients, a.gradients);
        add(THEME_FILE, 'scrollGradient', theme.scrollGradient, a.scrollGradient);
        const fontName = (id) => (id ? fontFamilies[id].name : '(custom)');
        for (const role of ['body', 'heading']) add(THEME_FILE, `fonts.${role}`, fontName(fonts[role]), fontName(a.fonts[role]));
        if (this.fontsChanged(state, a)) add(FONTS_FILE, 'loaded fonts', this.loadedFonts(state.fonts), this.loadedFonts(a.fonts));
        return changes;
    },

    async write(state, a, workspace) {
        const file = await workspace.file(THEME_FILE);
        file.set('theme.colorMode', a.colorMode);
        for (const mode of ['dark', 'light']) {
            if (!a.colors[mode]) {
                if (state.theme.colors[mode]) file.remove(`theme.colors.${mode}`);
                continue;
            }
            const palette = orderPalette(a.colors[mode], state.theme.colors[mode]);
            const isNew = !state.theme.colors[mode];
            // A new palette starts empty and is filled (with comments) by the rewrite below; dark goes before light.
            if (isNew) file.insert('theme.colors', mode, {}, mode === 'dark' && file.has('theme.colors.light') ? { before: 'light' } : {});
            file.rewriteObject(`theme.colors.${mode}`, palette, { comments: paletteCommentsFor(palette, isNew ? {} : state.theme.colors[mode]) });
        }
        file.rewriteObject('theme.gradients', a.gradients);
        file.set('theme.scrollGradient', a.scrollGradient);
        if (this.fontsChanged(state, a)) {
            const roles = fontRoles(a.fonts, state);
            file.rewriteObject('theme.fonts', roles);
            await writeFontsFile(await workspace.file(FONTS_FILE), a.fonts, state);
        }
    },

    todos(state, a) {
        const todos = [];
        if (a.preset && a.preset !== matchTheme(state.theme, state.fonts)) todos.push(`The ${themes[a.preset].name} theme is a starting point: fine-tune colours and gradients in ${THEME_FILE}.`);
        if (a.preset || JSON.stringify(state.theme.colors) !== JSON.stringify(a.colors)) {
            todos.push('The link-preview image (public/og-image-2.png) and the hero footage still use the old colours; replace them to match.');
        }
        return todos;
    },

    fontsChanged(state, a) {
        return a.fonts.body !== state.fonts.body || a.fonts.heading !== state.fonts.heading;
    },

    loadedFonts(fonts) {
        const name = (id) => (id ? fontFamilies[id].name : '(custom)');
        return fonts.body === fonts.heading ? name(fonts.body) : `${name(fonts.body)} + ${name(fonts.heading)}`;
    },
};

export default step;

// Palette keys in writing order: the keys the palette already has, in their order (so the file
// keeps its layout), then new base tokens, then new pinned shades.
function orderPalette(palette, existing = {}) {
    const kept = Object.keys(existing).filter((t) => palette[t] !== undefined);
    const added = Object.keys(palette).filter((t) => !kept.includes(t));
    const order = [...kept, ...BASE_TOKENS.filter((t) => added.includes(t)), ...added.filter((t) => !BASE_TOKENS.includes(t))];
    return Object.fromEntries(order.map((t) => [t, palette[t]]));
}

// Comments for the keys that are new in a palette: the template's token comments, and the note
// above the first pinned shade when the palette didn't pin any before.
function paletteCommentsFor(palette, existing) {
    const comments = {};
    for (const token of Object.keys(palette)) {
        if (existing[token] !== undefined) continue;
        if (paletteComments[token]) comments[token] = paletteComments[token];
    }
    const firstShade = Object.keys(palette).find((t) => !BASE_TOKENS.includes(t));
    if (firstShade && !Object.keys(existing).some((t) => !BASE_TOKENS.includes(t))) comments[firstShade] = pinnedShadesComment;
    return comments;
}

// `theme.fonts` roles for the chosen fonts: body is `--font-sans`, a different heading font `--font-display`.
function fontRoles(fonts, state) {
    const current = state.theme.fonts;
    const family = (role) => {
        if (fonts[role] === null) return current[role]; // a custom font stays as it is
        return { family: `var(${role === 'heading' && fonts.heading !== fonts.body ? '--font-display' : '--font-sans'})`, fallback: fontFamilies[fonts[role]].fallback };
    };
    return { body: family('body'), heading: family('heading') };
}

// Rewrites the `localFont` declarations in config/fonts.js for the chosen fonts; the header comment
// and everything else in the file stays.
async function writeFontsFile(file, fonts, state) {
    const block = (name, id, variable) => [
        `export const ${name} = localFont({`,
        `    src: '../app/fonts/${fontFamilies[id].file}',`,
        `    weight: '${fontFamilies[id].weight}',`,
        `    variable: '${variable}',`,
        `    display: 'swap',`,
        '});',
    ].join('\n');
    const DISPLAY_EXAMPLE = "// export const display = localFont({ src: '../app/fonts/Display.woff2', variable: '--font-display' });";
    // The comment above it, for the example and for a loaded second family.
    const OPTIONAL_COMMENT = "// Optional second family, e.g. for headings; then set `fonts.heading: { family: 'var(--font-display)', fallback: 'serif' }` in config/theme.js.";
    const DISPLAY_COMMENT = '// Second family for the headings (`fonts.heading` in config/theme.js).';
    const swapComment = (from, to) => { const i = file.text.indexOf(from); if (i !== -1) file.splice(i, i + from.length, to); };

    if (fonts.body !== null && fonts.body !== state.fonts.body) {
        const sans = file.declaration('sans');
        file.splice(sans.start, sans.end, block('sans', fonts.body, '--font-sans'));
        // The line above names the font.
        const lineStart = file.text.lastIndexOf('\n', sans.start - 2) + 1;
        const line = file.text.slice(lineStart, sans.start);
        if (/^\/\/ .* is bundled locally/.test(line)) {
            file.splice(lineStart, sans.start, `// ${fontFamilies[fonts.body].name} is bundled locally (app/fonts, SIL OFL) so builds don't need to reach Google Fonts.\n`);
        }
    }

    const needsDisplay = fonts.heading !== null && fonts.heading !== fonts.body;
    const hasDisplay = Boolean(state.fonts.loaded['--font-display']);
    if (needsDisplay) {
        const displayBlock = block('display', fonts.heading, '--font-display');
        if (hasDisplay) {
            const display = file.declaration('display');
            file.splice(display.start, display.end, displayBlock);
        } else {
            const example = file.text.indexOf(DISPLAY_EXAMPLE);
            if (example !== -1) {
                file.splice(example, example + DISPLAY_EXAMPLE.length, displayBlock);
                swapComment(OPTIONAL_COMMENT, DISPLAY_COMMENT);
            } else {
                const sans = file.declaration('sans');
                file.splice(sans.end, sans.end, `\n\n${DISPLAY_COMMENT}\n${displayBlock}`);
            }
        }
    } else if (hasDisplay && fonts.heading !== null) {
        const display = file.declaration('display');
        file.splice(display.start, display.end, DISPLAY_EXAMPLE);
        swapComment(DISPLAY_COMMENT, OPTIONAL_COMMENT);
    }

    const variables = needsDisplay || (fonts.heading === null && hasDisplay) ? '[sans.variable, display.variable]' : '[sans.variable]';
    const fontVariables = file.declaration('fontVariables');
    file.splice(fontVariables.start, fontVariables.end, `export const fontVariables = ${variables}.join(' ');`);

    // "(used below)" markers in the header's font list.
    const used = new Set([fonts.body, fonts.heading].filter(Boolean).map((id) => fontFamilies[id].file));
    file.text = file.text.replace(/^(\/\/ {3}(\S+\.woff2)\s+\S+\s+[\d–]+)(\s+\(used below\))?$/gm, (m, head, fileName) => (used.has(fileName) ? `${head}   (used below)` : head));
}
