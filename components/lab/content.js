import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { routing } from '@/i18n/routing';

// Markdown of the lab's project pages (`detail: 'markdown'` in config/lab.js): one file per project
// and language, content/lab/<id>/<language>.md. Read on the server while the pages are prerendered.

// Path of a project's file in one language, relative to the project root.
export const projectContentFile = (id, locale) => path.join('content', 'lab', id, `${locale}.md`);

/**
 * The text of a project page in `locale`. Like the messages, a missing translation falls back to the
 * default language: returns `{ markdown, locale }` with the language the text is actually in.
 * Fails the build with a readable message when the default language's file is missing too.
 */
export async function loadProjectContent(id, locale) {
    for (const candidate of new Set([locale, routing.defaultLocale])) {
        try {
            const markdown = await readFile(path.join(process.cwd(), projectContentFile(id, candidate)), 'utf8');
            return { markdown, locale: candidate };
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
    }
    throw new Error(`Lab project "${id}" has detail: 'markdown' in config/lab.js, but ${projectContentFile(id, routing.defaultLocale)} does not exist.`);
}
