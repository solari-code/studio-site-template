import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, rm, readFile, readdir, symlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadState } from '../state.mjs';
import { Workspace } from '../workspace.mjs';
import lab, { labSections } from '../steps/lab.mjs';
import pages, { pagesToAsk, switchableSections } from '../steps/pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const countComments = (text) => (text.match(/\/\//g) ?? []).length;

let tmp;
before(async () => {
    tmp = await mkdtemp(path.join(os.tmpdir(), 'setup-lab-'));
    for (const dir of ['config', 'i18n', 'messages', 'content']) await cp(path.join(root, dir), path.join(tmp, dir), { recursive: true });
    await symlink(path.join(root, 'node_modules'), path.join(tmp, 'node_modules'), 'junction');
});
after(() => rm(tmp, { recursive: true, force: true }));

const read = (file) => readFile(path.join(tmp, file), 'utf8');
const importFresh = (file) => import(`${pathToFileURL(path.join(tmp, file)).href}?t=${Date.now()}${Math.random()}`);

// Fingerprint of everything the lab consists of besides its switches: projects, texts, markdown.
async function labFiles() {
    const files = ['config/lab.js', 'messages/en.json', 'messages/de.json'];
    const walk = async (dir) => {
        for (const entry of await readdir(path.join(tmp, dir), { withFileTypes: true })) {
            const rel = path.join(dir, entry.name);
            if (entry.isDirectory()) await walk(rel);
            else files.push(rel);
        }
    };
    await walk('content');
    const hashes = {};
    for (const file of files.sort()) hashes[file] = createHash('sha1').update(await read(file)).digest('hex');
    return hashes;
}

async function apply(step, answers) {
    const state = await loadState(tmp);
    const changes = step.changes(state, answers);
    const workspace = new Workspace(tmp);
    await step.write(state, answers, workspace);
    const written = await workspace.commit();
    execFileSync(process.execPath, ['--check', path.join(tmp, 'config/pages.js')], { stdio: 'pipe' });
    return { state, changes, written, after: await loadState(tmp) };
}

describe('lab step', () => {
    test('labSections finds the lab sections with their positions', async () => {
        const state = await loadState(tmp);
        const found = labSections(state.pages);
        assert.deepEqual(found.map(({ key, index }) => [key, index]), [['home', state.pages.home.sections.findIndex((s) => s.type === 'lab')]]);
    });

    test('accepting the default changes nothing', async () => {
        const before = await read('config/pages.js');
        const { changes, written } = await apply(lab, { enabled: true });
        assert.deepEqual(changes, []);
        assert.deepEqual(written, []);
        assert.equal(await read('config/pages.js'), before);
    });

    test('off: only the enabled flags of the page and the section change; no other file is touched', async () => {
        const before = await read('config/pages.js');
        const filesBefore = await labFiles();

        const { state, changes, written, after } = await apply(lab, { enabled: false });
        assert.deepEqual(changes.map((c) => [c.label, c.from, c.to]), [['lab: page', 'on', 'off'], ['home.lab: section', 'on', 'off']]);
        assert.ok(changes.every((c) => c.file === 'config/pages.js'));
        assert.deepEqual(written, ['config/pages.js']);
        assert.deepEqual(await labFiles(), filesBefore, 'projects, texts and markdown stay as they are');

        const text = await read('config/pages.js');
        assert.equal(countComments(text), countComments(before), 'comments stay');
        assert.match(text, /\{ type: 'lab', enabled: false \},/);
        assert.match(text, /            \{ type: 'lab-projects' \},\n        \],\n        enabled: false,\n    \},/);

        const { pages: p, enabledPages, headerNav } = await importFresh('config/pages.js');
        assert.equal(p.lab.enabled, false);
        assert.ok(!enabledPages().includes(p.lab));
        assert.ok(!headerNav().some((item) => item.href === '/lab'), 'out of the navigation');
        const { labProjects, labProjectsWithPage } = await importFresh('config/lab.js');
        assert.equal(labProjects.length, 3, 'the projects are still configured');
        assert.deepEqual(labProjectsWithPage(), [], 'but have no pages while the lab is off');

        assert.deepEqual(lab.changes(after, { enabled: false }), [], 're-run: the default is the written state');
        assert.deepEqual(lab.todos(state, { enabled: false }), []);
    });

    test('on again: the config is exactly as before', async () => {
        const original = await readFile(path.join(root, 'config/pages.js'), 'utf8');
        const { state, changes } = await apply(lab, { enabled: true });
        assert.deepEqual(changes.map((c) => [c.label, c.from, c.to]), [['lab: page', 'off', 'on'], ['home.lab: section', 'off', 'on']]);
        assert.equal(await read('config/pages.js'), original);
        assert.match(lab.todos(state, { enabled: true })[0], /^Lab: replace the example projects/);
    });

    test('a half-switched lab (page off, section on) is brought in line', async () => {
        const workspace = new Workspace(tmp);
        (await workspace.file('config/pages.js')).assign('pages.lab.enabled', false);
        await workspace.commit();

        const state = await loadState(tmp);
        assert.deepEqual(lab.changes(state, { enabled: true }).map((c) => c.label), ['lab: page']);
        assert.deepEqual(lab.changes(state, { enabled: false }).map((c) => c.label), ['home.lab: section']);
        await apply(lab, { enabled: true });
        assert.equal(await read('config/pages.js'), await readFile(path.join(root, 'config/pages.js'), 'utf8'));
    });

    test('without a lab page there is nothing to switch', async () => {
        const state = await loadState(tmp);
        delete state.pages.lab;
        assert.deepEqual(lab.changes(state, { enabled: false }), []);
        const workspace = new Workspace(tmp);
        await lab.write(state, { enabled: false }, workspace);
        assert.deepEqual(workspace.touched, []);
    });

    test('together with the pages step: the lab switch and a reorder land on the right sections', async () => {
        const state = await loadState(tmp);
        const workspace = new Workspace(tmp);
        // Lab off, and in the pages step move "contact" to the top of the homepage.
        const home = state.pages.home.sections;
        const contact = home.findIndex((s) => s.type === 'contact');
        const order = [contact, ...home.map((_, i) => i).filter((i) => i !== contact)];
        const answers = { pages: {}, navTexts: {} };
        for (const [key, page] of Object.entries(state.pages)) {
            answers.pages[key] = { enabled: page.enabled !== false };
            if (page.sections) answers.pages[key].sections = page.sections.map((s, index) => ({ index, enabled: s.enabled !== false, nav: s.nav ?? null, props: {} }));
        }
        answers.pages.home.sections = order.map((i) => answers.pages.home.sections[i]);

        await lab.write(state, { enabled: false }, workspace);   // same order as in index.mjs
        await pages.write(state, answers, workspace);
        await workspace.commit();

        const { pages: p } = await importFresh('config/pages.js');
        assert.deepEqual(p.home.sections.map((s) => s.type), ['contact', ...home.filter((s) => s.type !== 'contact').map((s) => s.type)]);
        assert.deepEqual(p.home.sections.filter((s) => s.enabled === false).map((s) => s.type), ['lab'], 'only the lab section is off');
        assert.equal(p.lab.enabled, false);
        assert.equal(p.home.sections[0].nav.order, 1, 'contact keeps its options');
    });
});

describe('pages step leaves the lab to the lab step', () => {
    test('the lab page is not asked about; lab sections are not switchable', async () => {
        const state = await loadState(tmp);
        assert.ok(!pagesToAsk(state.pages).includes('lab'));
        assert.ok(pagesToAsk(state.pages).includes('starter'));
        const home = state.pages.home.sections;
        const switchable = switchableSections(home);
        assert.equal(switchable.length, home.length - 1);
        assert.ok(!switchable.includes(home.findIndex((s) => s.type === 'lab')));
    });
});
