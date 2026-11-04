/**
 * The current state of the site, read from the config files: this is what every question of the
 * assistant shows as its default, so re-running it continues from what is there.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const load = (root, file) => import(`${pathToFileURL(path.join(root, file)).href}?t=${Date.now()}`);

// Keys of an object literal in a file that can't be imported (config/icons.js contains JSX).
async function registeredKeys(root, file, objectName) {
    const source = await readFile(path.join(root, file), 'utf8');
    const body = source.slice(source.indexOf(`export const ${objectName} = {`));
    return [...body.matchAll(/^\s+'?([a-zA-Z0-9-]+)'?\s*:\s*(\w+)?/gm)].map((m) => ({ name: m[1], kind: m[2] }));
}

// The fonts loaded in config/fonts.js (it can't be imported: next/font needs the Next build):
// { '--font-sans': { name: 'sans', file: 'InterVariable-latin.woff2', id: 'inter' }, … }, by CSS variable.
// `id` is the key in scripts/setup/themes.mjs `fontFamilies`, or null for a font that isn't bundled.
export async function loadFonts(root) {
    const source = (await readFile(path.join(root, 'config/fonts.js'), 'utf8')).replace(/^\s*\/\/.*$/gm, '');
    const { fontFamilies } = await import('./themes.mjs');
    const loaded = {};
    for (const m of source.matchAll(/export const (\w+) = localFont\(\{([^}]*)\}\)/g)) {
        const src = /src:\s*'([^']+)'/.exec(m[2])?.[1] ?? '';
        const variable = /variable:\s*'([^']+)'/.exec(m[2])?.[1];
        if (!variable) continue;
        const file = path.basename(src);
        loaded[variable] = { name: m[1], file, id: Object.keys(fontFamilies).find((id) => fontFamilies[id].file === file) ?? null };
    }
    return loaded;
}

export async function loadState(root) {
    const { siteConfig } = await load(root, 'config/site.js');
    const { locales, defaultLocale, localeNames } = await load(root, 'i18n/routing.js');
    const { theme } = await load(root, 'config/theme.js');
    const { pages } = await load(root, 'config/pages.js');
    const messages = (await readdir(path.join(root, 'messages'))).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
    const defaultMessages = messages.includes(defaultLocale) ? JSON.parse(await readFile(path.join(root, 'messages', `${defaultLocale}.json`), 'utf8')) : {};
    const icons = await registeredKeys(root, 'config/icons.js', 'icons');
    const loadedFonts = await loadFonts(root);
    const fontId = (role) => loadedFonts[/var\((--[\w-]+)\)/.exec(theme.fonts?.[role]?.family ?? '')?.[1]]?.id ?? null;

    return {
        root,
        site: siteConfig,
        routing: { locales: [...locales], defaultLocale, localeNames: { ...localeNames } },
        messages,                      // locales that have a messages/<code>.json
        navLabels: Object.keys(defaultMessages.Nav ?? {}), // keys usable as `nav.label`
        defaultMessages,               // messages of the default language (titles, nav labels)
        icons: icons.map((i) => i.name),
        brandIcons: icons.filter((i) => i.kind === 'filledIcon').map((i) => i.name), // brand marks for social links
        theme,
        fonts: { body: fontId('body'), heading: fontId('heading'), loaded: loadedFonts }, // ids from themes.mjs, null = not a bundled font
        pages,
    };
}
