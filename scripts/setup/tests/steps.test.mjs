import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, rm, readFile, access, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadState } from '../state.mjs';
import { Workspace } from '../workspace.mjs';
import brand from '../steps/brand.mjs';
import languages, { suggestLocaleName } from '../steps/languages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const exists = (file) => access(file).then(() => true, () => false);

// A throwaway copy of the config-relevant part of the project.
let tmp;
before(async () => {
    tmp = await mkdtemp(path.join(os.tmpdir(), 'setup-steps-'));
    for (const dir of ['config', 'i18n', 'messages', 'content']) await cp(path.join(root, dir), path.join(tmp, dir), { recursive: true });
    await symlink(path.join(root, 'node_modules'), path.join(tmp, 'node_modules'), 'junction'); // i18n/routing.js imports next-intl
});
after(() => rm(tmp, { recursive: true, force: true }));

describe('state', () => {
    test('loadState reads the current values and the registered icons', async () => {
        const state = await loadState(tmp);
        assert.equal(state.site.name, 'Nova Studio');
        assert.deepEqual(state.routing.locales, ['en', 'de']);
        assert.equal(state.routing.defaultLocale, 'en');
        assert.deepEqual(state.messages.sort(), ['de', 'en']);
        assert.ok(state.icons.includes('rocket'));
        assert.deepEqual(state.brandIcons, ['linkedin', 'github', 'instagram', 'npm']);
        assert.ok(state.theme.colors.dark);
        assert.ok(state.pages.home.sections.length > 0);
    });
});

describe('brand step', () => {
    const answers = {
        name: 'Acme Studio',
        url: 'https://acme.example',
        contact: { email: 'hi@acme.example', formSender: 'website@acme.example', phone: '+49 30 1234567', whatsappNumber: '' },
        social: [
            { label: 'GitHub', icon: 'github', url: 'https://github.com/' },
            { label: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/acme' },
        ],
    };

    test('changes lists what differs, nothing when the answers equal the config', async () => {
        const state = await loadState(tmp);
        const changes = brand.changes(state, answers);
        assert.deepEqual(changes.map((c) => c.label), ['name', 'url', 'contact.email', 'contact.formSender', 'contact.phone', 'contact.whatsappNumber', 'social']);
        assert.ok(changes.every((c) => c.file === 'config/site.js'));
        const same = { name: state.site.name, url: state.site.url, contact: { ...state.site.contact }, social: state.site.social.map((l) => ({ ...l })) };
        assert.deepEqual(brand.changes(state, same), []);
    });

    test('write updates config/site.js and keeps its comments; nothing is written before commit', async () => {
        const state = await loadState(tmp);
        const before = await readFile(path.join(tmp, 'config/site.js'), 'utf8');
        const workspace = new Workspace(tmp);
        await brand.write(state, answers, workspace);
        assert.equal(await readFile(path.join(tmp, 'config/site.js'), 'utf8'), before);
        assert.deepEqual(workspace.touched, ['config/site.js']);
        assert.deepEqual(await workspace.commit(), ['config/site.js']);

        const after = await readFile(path.join(tmp, 'config/site.js'), 'utf8');
        assert.equal((after.match(/\/\//g) ?? []).length, (before.match(/\/\//g) ?? []).length);
        const updated = await loadState(tmp);
        assert.equal(updated.site.name, 'Acme Studio');
        assert.equal(updated.site.url, 'https://acme.example');
        assert.deepEqual(updated.site.contact, answers.contact);
        assert.deepEqual(updated.site.social, answers.social);
        assert.deepEqual(updated.site.assets, state.site.assets); // untouched parts stay
        assert.deepEqual(brand.changes(updated, answers), []);     // re-run: nothing left to change
        assert.match(brand.todos(state, answers)[0], /Verify the domain of website@acme\.example in Resend/);
    });
});

describe('languages step', () => {
    test('suggestLocaleName', () => {
        assert.equal(suggestLocaleName('fr'), 'Français');
        assert.equal(suggestLocaleName('de'), 'Deutsch');
        assert.equal(suggestLocaleName('zz'), 'zz');
    });

    test('adding and removing languages: routing, new message files, optional deletion', async () => {
        const state = await loadState(tmp);
        const answers = { locales: ['en', 'fr'], defaultLocale: 'en', localeNames: { en: 'English', fr: 'Français' }, deleteFiles: [] };

        const changes = languages.changes(state, answers);
        assert.deepEqual(changes.map((c) => [c.file, c.label]), [
            ['i18n/routing.js', 'locales'],
            ['i18n/routing.js', 'localeNames'],
            ['messages/fr.json', 'new file'],
        ]);
        assert.deepEqual(languages.todos(state, answers), [
            'Translate messages/fr.json (a copy of messages/en.json); `npm run check:messages` lists what is left.',
            'messages/de.json is kept but no longer used; delete it or add "de" back in i18n/routing.js.',
            'The lab page texts content/lab/*/de.md are kept but no longer used; delete them or add "de" back in i18n/routing.js.',
            'Lab pages: translate content/lab/<id>/en.md into content/lab/<id>/fr.md where you want them (until then the en text is shown; `npm run check:messages` lists them).',
        ]);

        const workspace = new Workspace(tmp);
        await languages.write(state, answers, workspace);
        assert.deepEqual(workspace.touched, ['i18n/routing.js', 'messages/fr.json']);
        await workspace.commit();

        const updated = await loadState(tmp);
        assert.deepEqual(updated.routing.locales, ['en', 'fr']);
        assert.deepEqual(updated.routing.localeNames, { en: 'English', fr: 'Français' });
        assert.equal(await readFile(path.join(tmp, 'messages/fr.json'), 'utf8'), await readFile(path.join(tmp, 'messages/en.json'), 'utf8'));
        assert.ok(await exists(path.join(tmp, 'messages/de.json'))); // kept
        assert.ok(await exists(path.join(tmp, 'content/lab/message-diff/de.md'))); // kept, unless asked
        assert.ok(!(await exists(path.join(tmp, 'content/lab/message-diff/fr.md'))), 'a new language gets no markdown copies');
        assert.match(await readFile(path.join(tmp, 'i18n/routing.js'), 'utf8'), /\/\/ Shown in the language switcher\.\nexport const localeNames = \{\n    en: 'English',\n    fr: 'Français',\n\};/);

        // Re-run: make fr the default, bring de back (its file still exists), drop fr and delete its file.
        const again = { locales: ['de', 'en'], defaultLocale: 'de', localeNames: { de: 'Deutsch', en: 'English' }, deleteFiles: ['fr'] };
        const changes2 = languages.changes(updated, again);
        assert.deepEqual(changes2.map((c) => [c.file, c.label]), [
            ['i18n/routing.js', 'locales'],
            ['i18n/routing.js', 'defaultLocale'],
            ['i18n/routing.js', 'localeNames'],
            ['messages/fr.json', 'deleted'],
        ]);
        const ws2 = new Workspace(tmp);
        await languages.write(updated, again, ws2);
        await ws2.commit();
        const final = await loadState(tmp);
        assert.deepEqual(final.routing.locales, ['de', 'en']);
        assert.equal(final.routing.defaultLocale, 'de');
        assert.ok(!(await exists(path.join(tmp, 'messages/fr.json'))));
        assert.deepEqual(languages.changes(final, again), []);
    });

    test('a removed language\'s lab page texts are deleted only when asked, and never those of a language in use', async () => {
        const dir = await mkdtemp(path.join(os.tmpdir(), 'setup-languages-'));
        try {
            for (const d of ['config', 'i18n', 'messages', 'content']) await cp(path.join(root, d), path.join(dir, d), { recursive: true });
            await symlink(path.join(root, 'node_modules'), path.join(dir, 'node_modules'), 'junction');
            const state = await loadState(dir);
            assert.deepEqual(state.labContent, { de: ['content/lab/message-diff/de.md'], en: ['content/lab/message-diff/en.md'] });

            const keep = { locales: ['en'], defaultLocale: 'en', localeNames: { en: 'English' }, deleteFiles: [], deleteContent: [] };
            assert.deepEqual(languages.changes(state, keep).map((c) => [c.file, c.label]), [['i18n/routing.js', 'locales'], ['i18n/routing.js', 'localeNames']]);

            const stray = { ...keep, deleteContent: ['en'] }; // en is still in use: nothing of it goes
            assert.deepEqual(languages.changes(state, stray).filter((c) => c.label === 'deleted'), []);

            const remove = { ...keep, deleteFiles: ['de'], deleteContent: ['de'] };
            assert.deepEqual(languages.changes(state, remove).filter((c) => c.label === 'deleted').map((c) => c.file), ['messages/de.json', 'content/lab/message-diff/de.md']);
            assert.deepEqual(languages.todos(state, remove), [], 'nothing left behind to mention');
            const workspace = new Workspace(dir);
            await languages.write(state, remove, workspace);
            await workspace.commit();
            assert.ok(!(await exists(path.join(dir, 'content/lab/message-diff/de.md'))));
            assert.ok(await exists(path.join(dir, 'content/lab/message-diff/en.md')));
            assert.deepEqual((await loadState(dir)).labContent, { en: ['content/lab/message-diff/en.md'] });
        } finally {
            await rm(dir, { recursive: true, force: true });
        }
    });
});
