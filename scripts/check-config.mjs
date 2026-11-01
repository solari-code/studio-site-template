#!/usr/bin/env node
/**
 * Validates the config files against each other, the messages and the files in public/:
 *
 * - config/pages.js: section types exist, ids are unique per page, nav labels and metadata
 *   namespaces exist in the messages, section data (items, projects, steps, …) matches the
 *   messages, icons are registered, referenced images/videos exist
 * - config/site.js: social icons, favicons, preview image, form definitions
 * - config/theme.js: gradients and the scroll gradient reference existing tokens
 *
 * Errors (things that would break or silently hide content) exit with code 1; warnings don't.
 * Run it with: npm run check:config
 */
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { pages, sectionId, enabledPages } = await import(path.join(root, 'config', 'pages.js'));
const { siteConfig } = await import(path.join(root, 'config', 'site.js'));
const { theme } = await import(path.join(root, 'config', 'theme.js'));
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

// Default messages namespace per section type (mirrors the components' defaults).
const defaultNamespaces = {
    hero: 'Hero', intro: 'Intro', services: 'Services', work: 'Work', process: 'Process', lab: 'Lab',
    about: 'About', contact: 'Contact', 'starter-hero': 'Starter.Hero', 'starter-who-is-this-for': 'Starter.WhoIsThisFor',
    'starter-pricing': 'Starter.Pricing', 'starter-roadmap': 'Starter.Roadmap', 'starter-faq': 'Starter.Faq',
    'starter-contact': 'Starter.Contact', 'starter-tech-specs': 'Starter.TechSpecs',
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

// Items keyed by id need a matching entry in the messages, e.g. Services.items.<id>
function checkIds(ids, namespace, key, where) {
    for (const id of ids) checkMessageKey(`${namespace}.${key}.${id}`, where);
}

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
            if (bg.type === 'color' && !theme.colors[bg.color] && !/^(#|rgb|hsl)/.test(bg.color ?? '')) warn(`${where}: "${bg.color}" is neither a colour token nor a CSS colour`);
        }
        if (s.overlay && s.overlay.color && !theme.colors[s.overlay.color]) error(`${where}: overlay colour "${s.overlay.color}" is not a token in config/theme.js`);
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
    lab: async (s, ns, where) => { if (!s.url) error(`${where}: "url" is required`); },
    'starter-who-is-this-for': async (s, ns, where) => {
        if (!Array.isArray(s.criteria)) return error(`${where}: "criteria" is required`);
        checkIds(s.criteria.map((c) => c.id), ns, 'criteria', where);
        s.criteria.forEach((c) => checkIcon(c.icon, `${where} criterion "${c.id}"`));
    },
    'starter-pricing': async (s, ns, where) => {
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
    if (page.nav) checkMessageKey(`Nav.${page.nav.label}`, `${where} nav`);

    if (page.type === 'legal') {
        if (!page.namespace) { error(`${where}: legal pages need a "namespace"`); continue; }
        checkMessageKey(`${page.namespace}.title`, where);
        checkMessageKey(`${page.namespace}.sections`, where);
        for (const extra of page.extraSections ?? []) checkMessageKey(`${page.namespace}.${extra}.paragraphs`, `${where} extraSections`);
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
        if (section.nav) checkMessageKey(`Nav.${section.nav.label}`, `${sWhere} nav`);

        const namespace = section.namespace ?? defaultNamespaces[section.type];
        if (namespace && getMessage(namespace) === undefined) error(`${sWhere}: messages namespace "${namespace}" does not exist`);
        if (sectionChecks[section.type]) await sectionChecks[section.type](section, namespace, sWhere);
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

for (const [name, stops] of Object.entries(theme.gradients)) {
    for (const token of stops) if (!theme.colors[token]) error(`gradient "${name}": "${token}" is not a colour token`);
}
for (const [role, name] of Object.entries(theme.scrollGradient)) {
    if (!theme.gradients[name]) error(`scrollGradient.${role}: gradient "${name}" is not defined`);
}
for (const token of ['background', 'surface', 'foreground', 'muted', 'contrast', 'primary', 'accent', 'secondary']) {
    if (!theme.colors[token]) error(`colour token "${token}" is required`);
}

// Disabled pages
for (const [key, page] of Object.entries(pages)) {
    if (page.enabled === false) console.log(`  ℹ page "${key}" is disabled`);
}
void enabledPages;

const summary = `${errors} error(s), ${warnings} warning(s)`;
console.log(errors === 0 ? `\nConfig looks good (${summary}).` : `\n${summary}.`);
process.exit(errors === 0 ? 0 : 1);
