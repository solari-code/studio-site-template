import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, rm, readFile, symlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadState } from '../state.mjs';
import { Workspace } from '../workspace.mjs';
import pages, { suggestNavText, navEntry } from '../steps/pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const countComments = (text) => (text.match(/\/\//g) ?? []).length;

let tmp;
before(async () => {
    tmp = await mkdtemp(path.join(os.tmpdir(), 'setup-pages-'));
    for (const dir of ['config', 'i18n', 'messages']) await cp(path.join(root, dir), path.join(tmp, dir), { recursive: true });
    await symlink(path.join(root, 'node_modules'), path.join(tmp, 'node_modules'), 'junction');
});
after(() => rm(tmp, { recursive: true, force: true }));

const read = (file) => readFile(path.join(tmp, file), 'utf8');
const importPages = () => import(`${pathToFileURL(path.join(tmp, 'config/pages.js')).href}?t=${Date.now()}${Math.random()}`);

// Answers that keep everything as it is (what `ask` returns when every default is accepted).
function unchanged(state) {
    const answer = {};
    for (const [key, page] of Object.entries(state.pages)) {
        answer[key] = { enabled: page.enabled !== false };
        if (page.sections) answer[key].sections = page.sections.map((s, index) => ({ index, enabled: s.enabled !== false, nav: s.nav ?? null, props: {} }));
    }
    return { pages: answer, navTexts: {} };
}

async function apply(answers) {
    const state = await loadState(tmp);
    const changes = pages.changes(state, answers);
    const workspace = new Workspace(tmp);
    await pages.write(state, answers, workspace);
    const written = await workspace.commit();
    execFileSync(process.execPath, ['--check', path.join(tmp, 'config/pages.js')], { stdio: 'pipe' });
    return { state, changes, written, after: await loadState(tmp) };
}

describe('pages step', () => {
    test('suggestNavText: the highlighted keyword of the title, a short title, else the id', async () => {
        const state = await loadState(tmp);
        assert.equal(suggestNavText(state, { type: 'lab' }), 'Lab', 'From the <highlight>Lab</highlight>');
        assert.equal(suggestNavText(state, { type: 'work' }), 'Work', 'Recent <highlight>Work</highlight>');
        assert.equal(suggestNavText(state, { type: 'process' }), 'Process');
        assert.equal(suggestNavText(state, { type: 'services' }), 'Services', 'a short title without highlight');
        assert.equal(suggestNavText(state, { type: 'about' }), 'About', 'two highlighted words (<highlight>, <highlightAlt>) in a long title: the id');
        assert.equal(suggestNavText(state, { type: 'contact' }), "Let's talk", 'one short highlighted phrase');
        assert.equal(suggestNavText(state, { type: 'intro' }), 'Intro', 'titles with placeholders are not used');
        assert.equal(suggestNavText(state, { type: 'starter-tech-specs' }), 'Starter tech specs');
        assert.equal(suggestNavText(state, { type: 'services', id: 'my-thing', namespace: 'Nope' }), 'My thing');
    });

    test('navigation order: config order, moved by `nav.order`; the assistant keeps options it does not ask about', async () => {
        const { headerNav, footerNav } = await importPages();
        assert.deepEqual(headerNav().map((i) => i.href), ['/#services', '/#work', '/#process', '/#about', '/lab', '/#contact'], 'contact has order: 1');
        assert.deepEqual(footerNav().map((i) => i.href), ['/#services', '/#work', '/#process', '/#about', '/lab']);

        const current = { label: 'contact', footer: false, order: 1 };
        assert.deepEqual(navEntry('contact', true, false, current), current, 'unchanged answers give the same entry');
        assert.deepEqual(navEntry('contact', true, true, current), { label: 'contact', order: 1 });
        assert.deepEqual(navEntry('intro', false, true), { label: 'intro', header: false });
    });

    test('accepting every default changes nothing', async () => {
        const before = await read('config/pages.js');
        const state = await loadState(tmp);
        const { changes, written } = await apply(unchanged(state));
        assert.deepEqual(changes, []);
        assert.deepEqual(written, []);
        assert.equal(await read('config/pages.js'), before);
    });

    test('sections on/off, reorder, navigation and options; comments travel with the entries', async () => {
        const before = await read('config/pages.js');
        const state = await loadState(tmp);
        const a = unchanged(state);
        const home = a.pages.home.sections;
        const at = (type) => home.find((s) => state.pages.home.sections[s.index].type === type);

        at('work').enabled = false;                         // off
        at('intro').nav = { label: 'intro', footer: false }; // new in the navigation: needs a Nav.intro text
        a.navTexts = { intro: 'Intro' };
        at('process').nav = { label: 'process', footer: false };
        at('contact').nav = null;                           // out of the navigation
        at('about').props = { image: '/images/about/portrait-placeholder.jpg' }; // same value: not a change
        at('hero').props = { ctaHref: '#services', overlay: false, background: { type: 'gradient', gradient: 'brand', direction: '135deg' } };
        // new order: hero, intro, about, services, work, lab, process, contact
        const moved = home.splice(home.indexOf(at('about')), 1)[0];
        home.splice(2, 0, moved);
        a.pages.starter.sections.find((s) => state.pages.starter.sections[s.index].type === 'starter-pricing').props = { cardColorMode: 'dark' };
        a.pages.starter.sections.find((s) => state.pages.starter.sections[s.index].type === 'starter-tech-specs').enabled = true; // on (was off)
        a.pages.impressum.enabled = false;

        const { changes, after } = await apply(a);
        assert.deepEqual(changes.map((c) => c.label), [
            'home: sections', 'home.hero: ctaHref', 'home.hero: overlay', 'home.hero: background',
            'home.intro: nav', 'home.process: nav', 'home.contact: nav',
            'starter: sections', 'starter.starter-pricing: cardColorMode', 'impressum: page', 'Nav.intro',
        ]);
        assert.deepEqual(changes.at(-1), { file: 'messages/en.json', label: 'Nav.intro', from: null, to: '"Intro" (navigation text)' });
        assert.equal(changes.find((c) => c.label === 'home: sections').to, 'hero, intro, about, services, process, contact', 'the lab section is left to the lab step');
        assert.equal(changes.find((c) => c.label === 'home.hero: background').from, 'video /images/hero/hero_loop_silent_2.mp4');
        assert.equal(changes.find((c) => c.label === 'home.hero: background').to, 'gradient brand');
        assert.equal(changes.find((c) => c.label === 'home.contact: nav').to, 'not in the navigation');

        const { pages: p, enabledSections, headerNav, footerNav } = await importPages();
        assert.deepEqual(p.home.sections.map((s) => s.type), ['hero', 'intro', 'about', 'services', 'work', 'lab', 'process', 'contact']);
        assert.deepEqual(enabledSections(p.home).map((s) => s.type), ['hero', 'intro', 'about', 'services', 'lab', 'process', 'contact']);
        assert.equal(p.home.sections.find((s) => s.type === 'work').enabled, false);
        assert.equal(p.home.sections.find((s) => s.type === 'lab').enabled, undefined);
        assert.equal(p.starter.sections.find((s) => s.type === 'starter-tech-specs').enabled, undefined);
        assert.deepEqual(p.home.sections[0].background, { type: 'gradient', gradient: 'brand', direction: '135deg' });
        assert.equal(p.home.sections[0].overlay, false);
        assert.equal(p.home.sections[0].ctaHref, '#services');
        assert.equal(p.home.sections[0].colorMode, 'dark', 'untouched option stays');
        assert.deepEqual(headerNav().map((i) => i.href), ['/#intro', '/#about', '/#services', '/#process', '/lab']);
        assert.deepEqual(footerNav().map((i) => i.href), ['/#about', '/#services', '/lab']);
        assert.equal(p.starter.sections.find((s) => s.type === 'starter-pricing').cardColorMode, 'dark');
        assert.equal(p.impressum.enabled, false);
        assert.deepEqual(p.privacy.extraParagraphs, { 2: ['colorMode'] }, 'the expressions on the privacy page are untouched');

        const text = await read('config/pages.js');
        assert.equal(countComments(text), countComments(before));
        assert.match(text, /\/\/ Texts from `Process\.steps\.<id>`\.\n                steps: \['discover', 'design', 'develop', 'deploy'\],/);
        assert.match(text, /\{ type: 'intro', nav: \{ label: 'intro', footer: false \} \},/);
        const en = await read('messages/en.json');
        assert.equal(en, `${JSON.stringify(JSON.parse(en), null, 4)}\n`, 'messages keep their format');
        assert.equal(JSON.parse(en).Nav.intro, 'Intro');
        assert.deepEqual(Object.keys(JSON.parse(en).Nav), ['services', 'work', 'process', 'about', 'contact', 'lab', 'impressum', 'privacy', 'intro']);
        assert.equal(JSON.parse(await read('messages/de.json')).Nav.intro, undefined, 'other languages are left to be translated');
        assert.deepEqual((await loadState(tmp)).navLabels.at(-1), 'intro');
        assert.match(text, /nav: \{ label: 'process', footer: false \},/);
        assert.match(text, /background: \{ type: 'gradient', gradient: 'brand', direction: '135deg' \},\n/);
        assert.match(text, /\/\/ Alternatives:\n/, 'the comment block about alternatives stays');
        assert.match(text, /overlay: false, \/\/ tint over the background/);
        assert.match(text, /process\.env\.NEXT_PUBLIC_UMAMI_WEBSITE_ID \? \['umami'\] : \[\]/);
        assert.match(text, /        nav: \{ label: 'impressum', header: false, footer: 'legal' \},\n        enabled: false,\n    \},/);

        assert.deepEqual(pages.changes(after, unchanged(after)), [], 're-run: the defaults are the written state');
        const todos = pages.todos(state, a);
        assert.ok(todos.some((t) => /impressum page is switched off/.test(t)));
        assert.ok(todos.some((t) => /Sections switched on \(starter: starter-tech-specs\)/.test(t)));
        assert.ok(todos.some((t) => /Navigation text Nav\.intro added to messages\/en\.json; translate it in messages\/de\.json/.test(t)));
    });

    test('back again: pages and sections re-enabled, the video background restored', async () => {
        const state = await loadState(tmp);
        const a = unchanged(state);
        a.pages.impressum.enabled = true;
        const work = a.pages.home.sections.find((s) => state.pages.home.sections[s.index].type === 'work');
        work.enabled = true;
        const hero = a.pages.home.sections.find((s) => state.pages.home.sections[s.index].type === 'hero');
        hero.props = {
            background: { type: 'video', src: '/images/hero/hero_loop_silent_2.mp4', poster: '/images/hero/hero_poster.jpg', mobile: { src: '/images/hero/hero_mobile_2.mp4', poster: '/images/hero/hero_poster_mobile_2.jpg' } },
            overlay: { color: 'background', opacity: 0.3 },
        };
        const { after } = await apply(a);
        const { pages: p } = await importPages();
        assert.equal(p.impressum.enabled, true);
        assert.equal(p.home.sections.find((s) => s.type === 'work').enabled, undefined);
        assert.deepEqual(p.home.sections[0].overlay, { color: 'background', opacity: 0.3 });
        assert.equal(p.home.sections[0].background.mobile.poster, '/images/hero/hero_poster_mobile_2.jpg');
        const text = await read('config/pages.js');
        assert.match(text, /                background: \{\n                    type: 'video',\n                    src: '\/images\/hero\/hero_loop_silent_2\.mp4',\n                    poster: '\/images\/hero\/hero_poster\.jpg',\n                    mobile: \{\n                        src: '\/images\/hero\/hero_mobile_2\.mp4',\n                        poster: '\/images\/hero\/hero_poster_mobile_2\.jpg',\n                    \},\n                \},/);
        assert.match(pages.todos(state, a).find((t) => /Hero footage/.test(t)), /public\/images\/hero/);
        assert.deepEqual(pages.changes(after, unchanged(after)), []);
    });
});
