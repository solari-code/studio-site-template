#!/usr/bin/env node
/**
 * Compares every messages/<locale>.json with the default language's file and reports
 * missing or extra keys, mismatched types and unregistered/missing locale files.
 * Does the same for the markdown of the lab's project pages (content/lab/<id>/<locale>.md):
 * missing translations, files of unregistered languages, folders no project uses.
 *
 * This script only warns. It always exits with code 0 and never blocks a build.
 * Run it with: npm run check:messages
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const messagesDir = path.join(root, 'messages');

const { locales, defaultLocale } = await import(path.join(root, 'i18n', 'routing.js'));
const { labProjects } = await import(path.join(root, 'config', 'lab.js'));

// Flattens nested objects and arrays into "a.b.0.c" -> value
function flatten(value, prefix = '', out = {}) {
    if (Array.isArray(value)) {
        value.forEach((item, i) => flatten(item, prefix ? `${prefix}.${i}` : String(i), out));
    } else if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) {
            flatten(child, prefix ? `${prefix}.${key}` : key, out);
        }
    } else {
        out[prefix] = value;
    }
    return out;
}

async function loadMessages(locale) {
    const raw = await readFile(path.join(messagesDir, `${locale}.json`), 'utf8');
    return JSON.parse(raw);
}

let warnings = 0;
const warn = (message) => { warnings += 1; console.warn(`  ⚠ ${message}`); };

console.log(`Checking messages against "${defaultLocale}.json" (locales: ${locales.join(', ')})\n`);

// Files vs. registered locales
const files = (await readdir(messagesDir)).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
for (const file of files) {
    if (!locales.includes(file)) warn(`messages/${file}.json exists but "${file}" is not listed in i18n/routing.js`);
}
for (const locale of locales) {
    if (!files.includes(locale)) warn(`"${locale}" is listed in i18n/routing.js but messages/${locale}.json is missing`);
}

// Keys per locale
let reference;
try {
    reference = flatten(await loadMessages(defaultLocale));
} catch (error) {
    warn(`Could not read messages/${defaultLocale}.json: ${error.message}`);
}

if (reference) {
    for (const locale of locales.filter((l) => l !== defaultLocale && files.includes(l))) {
        let current;
        try {
            current = flatten(await loadMessages(locale));
        } catch (error) {
            warn(`Could not read messages/${locale}.json: ${error.message}`);
            continue;
        }

        const missing = Object.keys(reference).filter((key) => !(key in current));
        const extra = Object.keys(current).filter((key) => !(key in reference));
        const typeMismatch = Object.keys(reference).filter((key) => key in current && typeof current[key] !== typeof reference[key]);

        console.log(`${locale}.json: ${missing.length} missing, ${extra.length} extra, ${typeMismatch.length} type mismatches`);
        missing.forEach((key) => warn(`${locale}: missing "${key}"`));
        extra.forEach((key) => warn(`${locale}: extra "${key}" (not in ${defaultLocale}.json)`));
        typeMismatch.forEach((key) => warn(`${locale}: "${key}" is ${typeof current[key]}, expected ${typeof reference[key]}`));
    }
}

// Markdown of the lab's project pages: one file per project and language. A missing translation shows
// the default language's text (like missing messages); npm run check:config reports a missing default file.
const contentDir = path.join(root, 'content', 'lab');
const markdownProjects = labProjects.filter((project) => project.detail === 'markdown').map((project) => project.id);
const folders = await readdir(contentDir, { withFileTypes: true }).then((entries) => entries.filter((e) => e.isDirectory()).map((e) => e.name), () => []);
if (markdownProjects.length || folders.length) console.log(`\nChecking lab pages in content/lab/ against "${defaultLocale}.md"\n`);
for (const id of markdownProjects) {
    const files = folders.includes(id) ? (await readdir(path.join(contentDir, id))).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')) : [];
    if (!files.includes(defaultLocale)) continue; // an error in check:config
    const missing = locales.filter((locale) => !files.includes(locale));
    console.log(`${id}: ${locales.filter((locale) => files.includes(locale)).join(', ')}${missing.length ? ` (missing: ${missing.join(', ')})` : ''}`);
    missing.forEach((locale) => warn(`content/lab/${id}/${locale}.md is missing (the ${defaultLocale} text is shown)`));
    files.filter((f) => !locales.includes(f)).forEach((f) => warn(`content/lab/${id}/${f}.md: "${f}" is not listed in i18n/routing.js`));
}
for (const folder of folders.filter((f) => !markdownProjects.includes(f))) {
    warn(`content/lab/${folder}/ is not used: no project in config/lab.js has id "${folder}" and detail: 'markdown'`);
}

console.log(warnings === 0 ? '\nAll message files are in sync.' : `\n${warnings} warning(s). Nothing is blocked; fix them when convenient.`);
process.exit(0);
