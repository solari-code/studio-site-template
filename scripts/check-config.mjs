#!/usr/bin/env node
/**
 * Validates the config files against each other, the messages and the files in public/:
 *
 * - config/pages.js: section types exist, ids are unique per page, nav labels and metadata
 *   namespaces exist in the messages, section data (items, projects, steps, …) matches the
 *   messages, icons are registered, referenced images/videos exist. Sections and pages that
 *   are switched off (`enabled: false`) are listed but their data is not checked.
 * - config/lab.js: project ids are unique and usable as URLs, texts exist in the messages, images
 *   exist, links use known types, landing pages are registered, markdown pages have their file in the
 *   default language; the homepage's lab section isn't on while the lab page is off
 * - config/site.js: social icons, favicons, preview image, form definitions
 * - config/theme.js: colour modes, shades, gradients and the scroll gradient reference existing tokens,
 *   font roles reference families loaded in config/fonts.js
 *
 * Errors (things that would break or silently hide content) exit with code 1; warnings don't.
 * Run it with: npm run check:config
 */
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { pages, sectionId, isEnabled } = await import(path.join(root, 'config', 'pages.js'));
const { labProjects, labLinkTypes } = await import(path.join(root, 'config', 'lab.js'));
const { siteConfig } = await import(path.join(root, 'config', 'site.js'));
const { theme, colors, colorModes, resolveColors } = await import(path.join(root, 'config', 'theme.js'));
const { defaultLocale } = await import(path.join(root, 'i18n', 'routing.js'));
const messages = JSON.parse(await readFile(path.join(root, 'messages', `${defaultLocale}.json`), 'utf8'));

// The registry and the icon file contain JSX, so their keys are read from the source instead of imported.
const registeredKeys = async (file, objectName) => {
    const source = await readFile(path.join(root, file), 'utf8');
    const body = source.slice(source.indexOf(`export const ${objectName} = {`));
    return [...body.matchAll(/^\s+'?([a-zA-Z0-9-]+)'?\s*:/gm)].map((m) => m[1]);
};
const sectionTypes = await registeredKeys('components/sections/index.jsx', 'sectionComponents');
const iconNames = await registeredKeys('config/icons.js', 'icons');
const landingIds = await registeredKeys('components/lab/landings/index.jsx', 'landingComponents');

// Default messages namespace per section type (mirrors the components' defaults).
const defaultNamespaces = {
    hero: 'Hero', intro: 'Intro', services: 'Services', work: 'Work', process: 'Process', lab: 'Lab',
    about: 'About', contact: 'Contact', 'starter-hero': 'Starter.Hero', 'starter-who-is-this-for': 'Starter.WhoIsThisFor',
    'starter-pricing': 'Starter.Pricing', 'starter-roadmap': 'Starter.Roadmap', 'starter-faq': 'Starter.Faq',
    'starter-contact': 'Starter.Contact', 'starter-tech-specs': 'Starter.TechSpecs', 'lab-projects': 'Lab.Overview',
};

let errors = 0;
let warnings = 0;
const error = (message) => { errors += 1; console.error(`  ✖ ${message}`); };
const warn = (message) => { warnings += 1; console.warn(`  ⚠ ${message}`); };

const getMessage = (keyPath) => keyPath.split('.').reduce((obj, key) => (obj && typeof obj === 'object' ? obj[key] : undefined), messages);
const fileExists = async (publicPath) => access(path.join(root, 'public', publicPath)).then(() => true, () => false);
const isRemote = (src) => /^https?:\/\//.test(src);

async function checkFile(src, where) {
    if (!src) return error(`${where}: missing file path`);
    if (isRemote(src)) return;
    if (!(await fileExists(src))) error(`${where}: file public${src} does not exist`);
}

function checkIcon(name, where) {
    if (!iconNames.includes(name)) error(`${where}: icon "${name}" is not registered in config/icons.js (available: ${iconNames.join(', ')})`);
}

function checkMessageKey(keyPath, where, { required = true } = {}) {
    if (getMessage(keyPath) === undefined) {
        (required ? error : warn)(`${where}: no text at "${keyPath}" in messages/${defaultLocale}.json`);
        return false;
    }
    return true;
}

// A `nav` entry of a page or section: its text exists, `order` (if set) is a number.
function checkNav(nav, where) {
    checkMessageKey(`Nav.${nav.label}`, where);
    if (nav.order !== undefined && !Number.isFinite(nav.order)) error(`${where}: order "${nav.order}" must be a number`);
}

// Items keyed by id need a matching entry in the messages, e.g. Services.items.<id>
function checkIds(ids, namespace, key, where) {
    for (const id of ids) checkMessageKey(`${namespace}.${key}.${id}`, where);
}

// A section (or part of it) pinned to a colour mode: 'dark' | 'light' | 'auto' (config/theme.js).
const checkPin = (value, option, where) => {
    if (value === undefined) return;
    if (!['dark', 'light', 'auto'].includes(value)) error(`${where}: ${option} "${value}" must be 'dark', 'light' or 'auto'`);
    else if (value !== 'auto' && !theme.colors[value]) warn(`${where}: ${option} "${value}" is not a configured palette; it follows the site instead`);
};

const sectionChecks = {
    hero: async (s, ns, where) => {
        const bg = s.background;
        if (bg) {
            if (!['video', 'image', 'gradient', 'color'].includes(bg.type)) error(`${where}: unknown background type "${bg.type}"`);
            if (bg.type === 'video' || bg.type === 'image') {
                await checkFile(bg.src, `${where} background.src`);
                if (bg.poster) await checkFile(bg.poster, `${where} background.poster`);
                if (bg.mobile?.src) await checkFile(bg.mobile.src, `${where} background.mobile.src`);
                if (bg.mobile?.poster) await checkFile(bg.mobile.poster, `${where} background.mobile.poster`);
            }
            if (bg.type === 'gradient' && !bg.css && !theme.gradients[bg.gradient]) error(`${where}: gradient "${bg.gradient}" is not defined in config/theme.js`);
            if (bg.type === 'color' && !colors[bg.color] && !/^(#|rgb|hsl)/.test(bg.color ?? '')) warn(`${where}: "${bg.color}" is neither a colour token nor a CSS colour`);
        }
        if (s.overlay && s.overlay.color && !colors[s.overlay.color]) error(`${where}: overlay colour "${s.overlay.color}" is not a token in config/theme.js`);
        checkPin(s.colorMode, 'colorMode', where);
        checkMessageKey(`${ns}.title`, where);
        checkMessageKey(`${ns}.cta`, where);
    },
    services: async (s, ns, where) => {
        if (!Array.isArray(s.items)) return error(`${where}: "items" is required`);
        checkIds(s.items.map((i) => i.id), ns, 'items', where);
        s.items.forEach((i) => checkIcon(i.icon, `${where} item "${i.id}"`));
    },
    work: async (s, ns, where) => {
        if (!Array.isArray(s.projects)) return error(`${where}: "projects" is required`);
        checkIds(s.projects.map((p) => p.id), ns, 'projects', where);
        for (const p of s.projects) await checkFile(p.image, `${where} project "${p.id}"`);
    },
    process: async (s, ns, where) => {
        if (!Array.isArray(s.steps)) return error(`${where}: "steps" is required`);
        checkIds(s.steps, ns, 'steps', where);
    },
    about: async (s, ns, where) => { await checkFile(s.image, `${where} image`); },
    lab: async (s, ns, where) => {
        checkMessageKey(`${ns}.title`, where);
        checkMessageKey(`${ns}.cta`, where);
        if (s.limit !== undefined && !(Number.isInteger(s.limit) && s.limit > 0)) error(`${where}: limit "${s.limit}" must be a positive whole number`);
    },
    'starter-who-is-this-for': async (s, ns, where) => {
        if (!Array.isArray(s.criteria)) return error(`${where}: "criteria" is required`);
        checkIds(s.criteria.map((c) => c.id), ns, 'criteria', where);
        s.criteria.forEach((c) => checkIcon(c.icon, `${where} criterion "${c.id}"`));
    },
    'starter-pricing': async (s, ns, where) => {
        checkPin(s.cardColorMode, 'cardColorMode', where);
        if (!Array.isArray(s.cards)) return error(`${where}: "cards" is required`);
        checkIds(s.cards.map((c) => c.id), ns, 'cards', where);
        s.cards.forEach((c) => checkIcon(c.icon, `${where} card "${c.id}"`));
    },
    'starter-roadmap': async (s, ns, where) => {
        if (!Array.isArray(s.steps)) return error(`${where}: "steps" is required`);
        checkIds(s.steps, ns, 'steps', where);
    },
    'starter-tech-specs': async (s, ns, where) => {
        if (!Array.isArray(s.specs)) return error(`${where}: "specs" is required`);
        checkIds(s.specs, ns, '', where);
    },
    'starter-contact': async (s, ns, where) => {
        if (s.form && !siteConfig.forms[s.form]) error(`${where}: form "${s.form}" is not defined in siteConfig.forms`);
    },
};

console.log('Checking config/pages.js\n');

const seenPaths = new Set();
for (const [key, page] of Object.entries(pages)) {
    const where = `page "${key}"`;
    if (!page.path?.startsWith('/')) error(`${where}: "path" must start with /`);
    if (seenPaths.has(page.path)) error(`${where}: path ${page.path} is used twice`);
    seenPaths.add(page.path);
    if (page.metadata) {
        checkMessageKey(`${page.metadata}.title`, where);
        checkMessageKey(`${page.metadata}.description`, where);
    } else {
        warn(`${where}: no "metadata" namespace, the page has no title/description of its own`);
    }
    if (page.nav) checkNav(page.nav, `${where} nav`);

    if (page.type === 'legal') {
        if (!page.namespace) { error(`${where}: legal pages need a "namespace"`); continue; }
        checkMessageKey(`${page.namespace}.title`, where);
        checkMessageKey(`${page.namespace}.sections`, where);
        for (const extra of page.extraSections ?? []) checkMessageKey(`${page.namespace}.${extra}.paragraphs`, `${where} extraSections`);
        const sectionCount = (getMessage(`${page.namespace}.sections`) ?? []).length;
        for (const [index, keys] of Object.entries(page.extraParagraphs ?? {})) {
            if (!(Number(index) < sectionCount)) error(`${where} extraParagraphs: section index ${index} does not exist (${sectionCount} sections)`);
            for (const key of keys) checkMessageKey(`${page.namespace}.${key}.paragraphs`, `${where} extraParagraphs`);
        }
        continue;
    }

    if (!Array.isArray(page.sections)) { error(`${where}: needs a "sections" list (or type: 'legal')`); continue; }

    const ids = new Set();
    for (const section of page.sections) {
        const id = sectionId(section);
        const sWhere = `${where} section "${id}"`;
        if (!sectionTypes.includes(section.type)) { error(`${sWhere}: unknown type "${section.type}" (available: ${sectionTypes.join(', ')})`); continue; }
        if (ids.has(id)) error(`${sWhere}: id "${id}" is used twice on this page`);
        ids.add(id);
        if (!isEnabled(section)) continue; // switched off: only the type and the id are checked
        if (section.nav) checkNav(section.nav, `${sWhere} nav`);

        const namespace = section.namespace ?? defaultNamespaces[section.type];
        if (namespace && getMessage(namespace) === undefined) error(`${sWhere}: messages namespace "${namespace}" does not exist`);
        if (sectionChecks[section.type]) await sectionChecks[section.type](section, namespace, sWhere);
    }
}

console.log('\nChecking config/lab.js\n');

// The lab page: its path is fixed by the route folder, and the homepage section links to it.
const labPage = pages.lab;
const labOn = Boolean(labPage) && isEnabled(labPage);
if (!labPage) {
    error('pages.lab is missing in config/pages.js (the lab page, its projects and the lab section need it)');
} else if (labPage.path !== '/lab') {
    error(`pages.lab: path must be '/lab' (it is fixed by the route folder app/[locale]/lab), not '${labPage.path}'`);
}
for (const [key, page] of Object.entries(pages)) {
    for (const section of (page.sections ?? []).filter((s) => s.type === 'lab' && isEnabled(s))) {
        if (labPage && !labOn) error(`page "${key}" section "${sectionId(section)}": the lab section is on but the lab page (pages.lab) is off, so the section is hidden; switch both on or both off (npm run setup, step "Lab")`);
    }
}

if (!labOn) {
    console.log('  ℹ the lab page is disabled; its projects are not checked');
} else {
    // Link types: each needs a registered icon and a text
    for (const [type, { icon }] of Object.entries(labLinkTypes)) {
        checkIcon(icon, `labLinkTypes.${type}`);
        checkMessageKey(`Lab.links.${type}`, `labLinkTypes.${type}`);
    }

    const seenIds = new Set();
    for (const [index, project] of labProjects.entries()) {
        const id = project.id;
        const where = `lab project "${id ?? `#${index + 1}`}"`;
        if (typeof id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
            error(`${where}: id must be lowercase letters, digits and single hyphens (it is the URL /lab/<id>)`);
            continue;
        }
        if (seenIds.has(id)) error(`${where}: id is used twice`);
        seenIds.add(id);
        if (!isEnabled(project)) { console.log(`  ℹ ${where} is disabled`); continue; }

        checkMessageKey(`Lab.projects.${id}.title`, where);
        checkMessageKey(`Lab.projects.${id}.description`, where);
        const tags = getMessage(`Lab.projects.${id}.tags`);
        if (tags !== undefined && !Array.isArray(tags)) error(`${where}: Lab.projects.${id}.tags must be a list`);
        if (project.image) await checkFile(project.image, `${where} image`);

        for (const [type, url] of Object.entries(project.links ?? {})) {
            if (!labLinkTypes[type]) error(`${where}: unknown link type "${type}" (available: ${Object.keys(labLinkTypes).join(', ')}; add one in labLinkTypes)`);
            if (!/^https?:\/\//.test(url ?? '')) error(`${where}: link "${type}" must be an absolute URL (https://…)`);
        }

        if (project.detail === 'landing') {
            if (!landingIds.includes(id)) error(`${where}: detail 'landing', but no landing page is registered under "${id}" in components/lab/landings/index.jsx`);
        } else if (project.detail === 'markdown') {
            const file = path.join('content', 'lab', id, `${defaultLocale}.md`);
            if (!(await access(path.join(root, file)).then(() => true, () => false))) error(`${where}: detail 'markdown', but ${file} does not exist`);
        } else if (project.detail !== undefined) {
            error(`${where}: detail "${project.detail}" must be 'landing', 'markdown' or left out (card only)`);
        }
    }

    // Landing pages registered for no project with detail 'landing'
    const landingProjects = labProjects.filter((p) => p.detail === 'landing').map((p) => p.id);
    for (const landing of landingIds.filter((l) => !landingProjects.includes(l))) {
        warn(`components/lab/landings/index.jsx: landing "${landing}" belongs to no project with detail: 'landing' in config/lab.js; it is never shown`);
    }

    // The homepage teaser shows the featured projects
    const teaserOn = Object.values(pages).some((page) => isEnabled(page) && (page.sections ?? []).some((s) => s.type === 'lab' && isEnabled(s)));
    if (teaserOn && !labProjects.some((p) => isEnabled(p) && p.featured)) {
        warn('no lab project is `featured`: the homepage\'s lab section shows only its text and button');
    }
}

console.log('\nChecking config/site.js\n');

if (!/^https?:\/\//.test(siteConfig.url ?? '')) error('siteConfig.url must be an absolute URL');
for (const item of siteConfig.social ?? []) {
    checkIcon(item.icon, `social link "${item.label}"`);
    if (!item.url) error(`social link "${item.label}": missing url`);
}
await checkFile(siteConfig.assets?.ogImage?.src, 'assets.ogImage');
for (const icon of siteConfig.assets?.favicons?.icon ?? []) await checkFile(icon.url, 'assets.favicons');
if (siteConfig.assets?.favicons?.apple) await checkFile(siteConfig.assets.favicons.apple, 'assets.favicons.apple');
if (!siteConfig.forms?.contact) error('siteConfig.forms.contact is required (used by the contact overlay)');
for (const [key, form] of Object.entries(siteConfig.forms ?? {})) {
    if (!form.subject || !form.heading) error(`siteConfig.forms.${key} needs "subject" and "heading"`);
}

console.log('\nChecking config/theme.js\n');

const isHex = (value) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value ?? '');
const knownModes = ['dark', 'light'];

// Colour modes
if (colorModes.length === 0) error(`colors must contain at least one palette ("dark" and/or "light")`);
for (const key of Object.keys(theme.colors)) {
    if (!knownModes.includes(key)) error(`colors.${key}: unknown mode; palettes are keyed by "dark" or "light"`);
}
const defaultMode = theme.colorMode?.default ?? 'system';
if (colorModes.length > 1 && !['system', ...colorModes].includes(defaultMode)) {
    error(`colorMode.default "${defaultMode}" must be "system" or a configured mode (${colorModes.join(', ')})`);
}
if (colorModes.length === 1 && !['system', colorModes[0]].includes(defaultMode)) {
    warn(`colorMode.default "${defaultMode}" is not configured; the only palette (${colorModes[0]}) is used`);
}
const toggle = theme.colorMode?.toggle ?? false;
if (typeof toggle !== 'boolean') error(`colorMode.toggle must be true or false`);
if (toggle && colorModes.length < 2) warn(`colorMode.toggle is true but only one palette is configured; no toggle is shown`);
const base = Object.keys(theme.colors[colorModes[0]] ?? {}).filter((name) => !theme.shades[name]);
for (const mode of colorModes) {
    const palette = theme.colors[mode];
    for (const [name, value] of Object.entries(palette)) {
        if (!isHex(value)) error(`colors.${mode}.${name}: "${value}" is not a hex colour (#rgb or #rrggbb)`);
    }
    for (const name of base) {
        if (!palette[name]) error(`colors.${mode}: base colour "${name}" is missing (every mode defines the same base colours)`);
    }
}

// Shades, checked against every mode (an explicit entry in a palette pins the shade for that mode)
for (const [name, shade] of Object.entries(theme.shades)) {
    for (const mode of colorModes) {
        const palette = theme.colors[mode];
        if (palette[name]) console.log(`  ℹ colors.${mode}.${name} pins the shade "${name}" to ${palette[name]}`);
        if (!palette[shade.base]) error(`shade "${name}": base "${shade.base}" is not a base colour of mode "${mode}"`);
        if (!isHex(shade.mix) && !palette[shade.mix]) error(`shade "${name}": mix "${shade.mix}" is neither a base colour of mode "${mode}" nor a hex colour`);
    }
    if (typeof shade.amount !== 'number' || shade.amount < 0 || shade.amount > 1) error(`shade "${name}": amount must be a number between 0 and 1`);
}

// Gradients and required tokens, per mode
for (const mode of colorModes) {
    let resolved;
    try { resolved = resolveColors(mode); } catch (e) { error(e.message); continue; }
    for (const [name, stops] of Object.entries(theme.gradients)) {
        if (stops.length < 2) error(`gradient "${name}" needs at least two colour stops`);
        for (const token of stops) if (!resolved[token]) error(`gradient "${name}": "${token}" is not a colour token in mode "${mode}"`);
    }
    for (const token of ['background', 'foreground', 'contrast', 'primary', 'accent', 'secondary', 'tertiary', 'on-brand', 'success', 'error', 'surface', 'surface-deep', 'muted', 'muted-strong']) {
        if (!resolved[token]) error(`colour token "${token}" is required in mode "${mode}" (as a base colour or a shade)`);
    }
}
for (const [role, name] of Object.entries(theme.scrollGradient)) {
    if (!theme.gradients[name]) error(`scrollGradient.${role}: gradient "${name}" is not defined`);
}

// Font roles: `{ family, fallback }` per role, the family a CSS variable from config/fonts.js
const fontsSource = (await readFile(path.join(root, 'config', 'fonts.js'), 'utf8')).replace(/^\s*\/\/.*$/gm, ''); // without comment lines
const fontVariables = [...fontsSource.matchAll(/variable:\s*'(--font-[a-z0-9-]+)'/g)].map((m) => m[1]);
for (const role of ['body', 'heading']) {
    const font = theme.fonts?.[role];
    if (!font || typeof font !== 'object') { error(`fonts.${role} must be an object { family, fallback }`); continue; }
    const variable = /^var\((--font-[a-z0-9-]+)\)$/.exec(font.family ?? '')?.[1];
    if (!variable) error(`fonts.${role}.family "${font.family}" must reference a CSS variable from config/fonts.js, e.g. 'var(--font-sans)'`);
    else if (!fontVariables.includes(variable)) error(`fonts.${role}.family: "${variable}" is not defined in config/fonts.js (available: ${fontVariables.join(', ')})`);
    if (!['sans-serif', 'serif', 'monospace', 'system-ui'].includes(font.fallback)) error(`fonts.${role}.fallback "${font.fallback}" must be a generic family (sans-serif, serif, monospace or system-ui)`);
}
const setup = colorModes.length < 2 ? `${colorModes[0]} only`
    : `${defaultMode === 'system' ? 'system preference' : `fixed ${defaultMode}`}${toggle ? ' + toggle' : ', no toggle'}`;
console.log(`  ℹ colour modes: ${colorModes.join(', ')} (${setup})`);

// Disabled pages and sections
for (const [key, page] of Object.entries(pages)) {
    if (!isEnabled(page)) console.log(`  ℹ page "${key}" is disabled`);
    const off = (page.sections ?? []).filter((section) => !isEnabled(section)).map(sectionId);
    if (off.length) console.log(`  ℹ page "${key}": disabled section(s) ${off.join(', ')}`);
}

const summary = `${errors} error(s), ${warnings} warning(s)`;
console.log(errors === 0 ? `\nConfig looks good (${summary}).` : `\n${summary}.`);
process.exit(errors === 0 ? 0 : 1);
