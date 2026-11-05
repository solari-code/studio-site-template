/**
 * Step "Lab": switches the lab on or off as a whole: the /lab page (`pages.lab`), its project pages
 * and the homepage's lab section (every section of type 'lab') -> config/pages.js.
 *
 * Only their `enabled` flags change. The projects (config/lab.js), their texts, markdown files,
 * images and landing pages are never touched, so switching the lab on again brings everything back
 * as it was. Managing the projects themselves stays in config/lab.js.
 *
 * The pages step leaves the lab page and the on/off state of lab sections to this step (it still
 * reorders them). This step runs before it: both edit config/pages.js by the sections' original
 * positions, and the pages step reorders them at the very end.
 */
import { confirm, log } from '../prompts.mjs';

const FILE = 'config/pages.js';

// The key of the lab page in config/pages.js, and the sections that belong to the lab.
export const LAB_PAGE = 'lab';
export const isLabSection = (section) => section.type === 'lab';

const isOn = (entry) => entry.enabled !== false;
const sectionId = (section) => section.id ?? section.type;
const onOff = (value) => (value ? 'on' : 'off');

// Every lab section in config/pages.js with its position: [{ key: 'home', index: 4, section }]
export function labSections(pages) {
    return Object.entries(pages).flatMap(([key, page]) =>
        (page.sections ?? []).map((section, index) => ({ key, index, section })).filter(({ section }) => isLabSection(section)));
}

const step = {
    id: 'lab',
    title: 'Lab',
    hint: 'personal projects: /lab page and homepage section on/off',

    async ask(state) {
        log.step('Lab');
        const page = state.pages[LAB_PAGE];
        if (!page) {
            log.warn(`config/pages.js has no "${LAB_PAGE}" page, so there is nothing to switch.`);
            return { enabled: null };
        }
        const where = ['/lab', 'its project pages', ...(labSections(state.pages).length ? ['the homepage section'] : [])].join(', ');
        log.message(`The lab is currently ${onOff(isOn(page))}. Its projects are managed in config/lab.js.`);
        const enabled = await confirm({
            message: `Show the Lab? (${where}; switching it off only hides them, nothing is deleted)`,
            initialValue: isOn(page),
        });
        return { enabled };
    },

    changes(state, a) {
        const page = state.pages[LAB_PAGE];
        if (!page || typeof a.enabled !== 'boolean') return [];
        const changes = [];
        if (isOn(page) !== a.enabled) changes.push({ file: FILE, label: `${LAB_PAGE}: page`, from: onOff(isOn(page)), to: onOff(a.enabled) });
        for (const { key, section } of labSections(state.pages)) {
            if (isOn(section) !== a.enabled) changes.push({ file: FILE, label: `${key}.${sectionId(section)}: section`, from: onOff(isOn(section)), to: onOff(a.enabled) });
        }
        return changes;
    },

    async write(state, a, workspace) {
        const page = state.pages[LAB_PAGE];
        if (!page || typeof a.enabled !== 'boolean') return;
        const file = await workspace.file(FILE);
        // On: drop `enabled` (on is the default); off: `enabled: false`. Everything else stays.
        const apply = (path, entry) => {
            if (isOn(entry) === a.enabled) return;
            if (a.enabled) file.remove(`${path}.enabled`);
            else file.assign(`${path}.enabled`, false);
        };
        apply(`pages.${LAB_PAGE}`, page);
        for (const { key, index, section } of labSections(state.pages)) apply(`pages.${key}.sections[${index}]`, section);
    },

    todos(state, a) {
        if (a.enabled !== true) return [];
        return ['Lab: replace the example projects with your own: config/lab.js (links, images, which kind of page), their texts in messages/<language>.json (`Lab.projects.<id>`, `LabLandings.<id>`), the markdown in content/lab/<id>/ and the landing pages in components/lab/landings/.'];
    },
};

export default step;
