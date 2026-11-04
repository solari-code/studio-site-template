/**
 * Step "Languages": default language and additional languages -> i18n/routing.js, plus a
 * messages/<code>.json for every new language (a copy of the default language's file, to be
 * translated by hand). A removed language keeps its messages file unless you say otherwise.
 */
import { text, select, multiselect, confirm, log } from '../prompts.mjs';
import * as v from '../validate.mjs';

const FILE = 'i18n/routing.js';
const messagesFile = (code) => `messages/${code}.json`;

// "Français" for 'fr': the language's name in the language itself, as the switcher shows it.
export function suggestLocaleName(code) {
    try {
        const name = new Intl.DisplayNames([code], { type: 'language' }).of(code);
        return name && name !== code ? name[0].toUpperCase() + name.slice(1) : code;
    } catch {
        return code;
    }
}

const step = {
    id: 'languages',
    title: 'Languages',
    hint: 'default language, additional languages',

    async ask(state) {
        const { locales, defaultLocale, localeNames } = state.routing;
        log.step('Languages');
        const describe = (code) => `${localeNames[code] ?? suggestLocaleName(code)} (${code})`;
        log.message(`Currently: ${locales.map(describe).join(', ')}; default ${defaultLocale} (no URL prefix).`);

        const notListed = (chosen) => (value) => (chosen.includes(value.trim()) ? `${value.trim()} is already in the list.` : undefined);
        const askCode = (message, chosen) => text({ message, placeholder: 'e.g. fr, es, pt-BR', validate: v.all(v.localeCode, notListed(chosen)) });

        let newDefault = await select({
            message: 'Default language (served without a URL prefix, the fallback for missing texts)',
            options: [
                ...locales.map((code) => ({ value: code, label: describe(code) })),
                { value: '', label: 'Another language…', hint: 'enter a code' },
            ],
            initialValue: defaultLocale,
        });
        const names = {};
        const askName = async (code) => {
            names[code] = localeNames[code] ?? await text({
                message: `Name of "${code}" as shown in the language switcher`,
                initialValue: suggestLocaleName(code),
                validate: v.displayName,
            });
        };
        const copySource = this.copySource(state);
        const added = (code) => log.success(`Added ${names[code]} (${code})${state.messages.includes(code) ? '' : `; ${messagesFile(code)} will be created as a copy of ${messagesFile(copySource)}`}.`);

        if (newDefault === '') {
            newDefault = await askCode('Language code of the default language', locales);
            await askName(newDefault);
            added(newDefault);
        } else {
            await askName(newDefault);
        }

        let additional = [];
        const candidates = locales.filter((code) => code !== newDefault);
        if (candidates.length) {
            additional = await multiselect({
                message: 'Additional languages (space toggles, enter confirms; unticked languages are removed)',
                options: candidates.map((code) => ({ value: code, label: describe(code) })),
                initialValues: candidates,
                required: false,
            });
        }
        for (const code of additional) await askName(code);

        const summary = () => [newDefault, ...additional].map((code) => `${code}${code === newDefault ? ' (default)' : ''}`).join(', ');
        while (await confirm({ message: `Languages so far: ${summary()}. Add another language?`, initialValue: false })) {
            const code = await askCode('Language code', [newDefault, ...additional]);
            await askName(code);
            additional.push(code);
            added(code);
        }

        const newLocales = [newDefault, ...additional];

        const removed = locales.filter((code) => !newLocales.includes(code));
        const deleteFiles = [];
        for (const code of removed) {
            if (!state.messages.includes(code)) continue;
            const remove = await confirm({ message: `"${code}" is removed. Delete ${messagesFile(code)} too? (No keeps the texts for later)`, initialValue: false });
            if (remove) deleteFiles.push(code);
        }

        return { locales: newLocales, defaultLocale: newDefault, localeNames: names, deleteFiles };
    },

    changes(state, a) {
        const { locales, defaultLocale, localeNames } = state.routing;
        const changes = [];
        const add = (file, label, from, to) => { if (from !== to) changes.push({ file, label, from, to }); };
        add(FILE, 'locales', locales.join(', '), a.locales.join(', '));
        add(FILE, 'defaultLocale', defaultLocale, a.defaultLocale);
        const describeNames = (names) => Object.entries(names).map(([code, name]) => `${code}: ${name}`).join(', ');
        add(FILE, 'localeNames', describeNames(localeNames), describeNames(a.localeNames));
        for (const code of this.newMessageFiles(state, a)) {
            changes.push({ file: messagesFile(code), label: 'new file', from: null, to: `copy of ${messagesFile(this.copySource(state))}, to be translated` });
        }
        for (const code of this.filesToDelete(state, a)) changes.push({ file: messagesFile(code), label: 'deleted', from: null, to: null });
        return changes;
    },

    async write(state, a, workspace) {
        const file = await workspace.file(FILE);
        file.rewriteArray('locales', a.locales);
        file.set('defaultLocale', a.defaultLocale);
        file.rewriteObject('localeNames', a.localeNames);
        for (const code of this.newMessageFiles(state, a)) workspace.copy(messagesFile(this.copySource(state)), messagesFile(code));
        for (const code of this.filesToDelete(state, a)) workspace.delete(messagesFile(code));
    },

    todos(state, a) {
        const todos = [];
        for (const code of this.newMessageFiles(state, a)) {
            todos.push(`Translate ${messagesFile(code)} (a copy of ${messagesFile(this.copySource(state))}); \`npm run check:messages\` lists what is left.`);
        }
        for (const code of state.routing.locales.filter((c) => !a.locales.includes(c) && !a.deleteFiles.includes(c) && state.messages.includes(c))) {
            todos.push(`${messagesFile(code)} is kept but no longer used; delete it or add "${code}" back in i18n/routing.js.`);
        }
        return todos;
    },

    // Languages that need a messages file.
    newMessageFiles(state, a) {
        return a.locales.filter((code) => !state.messages.includes(code));
    },

    // Message files of removed languages that should go (only those that exist and are not in use).
    filesToDelete(state, a) {
        return a.deleteFiles.filter((code) => state.messages.includes(code) && !a.locales.includes(code));
    },

    // New files are copied from the current default language (the most complete file), or en.json.
    copySource(state) {
        return state.messages.includes(state.routing.defaultLocale) ? state.routing.defaultLocale : 'en';
    },
};

export default step;
