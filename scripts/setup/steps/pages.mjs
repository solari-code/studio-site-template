/**
 * Step "Pages & sections": which pages are on, which sections each page shows and in what order,
 * what is in the navigation, and the few section options that are data rather than text
 * (hero background and colour mode, CTA target, about image, pricing card mode)
 * -> config/pages.js. Sections are switched off with `enabled: false`, never deleted, so their
 * entries (and comments) stay for later.
 *
 * The lab is switched by its own step (steps/lab.mjs): the lab page isn't offered here, and lab
 * sections keep their on/off state (they can still be reordered and put into the navigation).
 */
import { text, select, multiselect, confirm, log } from '../prompts.mjs';
import * as v from '../validate.mjs';
import { LAB_PAGE, isLabSection } from './lab.mjs';

const FILE = 'config/pages.js';

const sectionId = (section) => section.id ?? section.type;
const isOn = (entry) => entry.enabled !== false;
const messagesFile = (locale) => `messages/${locale}.json`;

// Default messages namespace per section type (mirrors the components' defaults), for the section's title.
const NAMESPACES = {
    hero: 'Hero', intro: 'Intro', services: 'Services', work: 'Work', process: 'Process', lab: 'Lab', about: 'About', contact: 'Contact',
    'starter-hero': 'Starter.Hero', 'starter-who-is-this-for': 'Starter.WhoIsThisFor', 'starter-pricing': 'Starter.Pricing',
    'starter-roadmap': 'Starter.Roadmap', 'starter-faq': 'Starter.Faq', 'starter-contact': 'Starter.Contact', 'starter-tech-specs': 'Starter.TechSpecs',
    'lab-projects': 'Lab.Overview',
};

// Suggested navigation text for a section. Navigation texts must be short, so it is the keyword of the
// section's title (the single <highlight>…</highlight> word, as in "Recent <highlight>Work</highlight>"),
// else the title itself when it is short, else the id capitalised.
export function suggestNavText(state, section) {
    const namespace = section.namespace ?? NAMESPACES[section.type];
    const title = namespace?.split('.').reduce((obj, key) => obj?.[key], state.defaultMessages)?.title;
    const short = (text) => text && !text.includes('{') && text.split(' ').length <= 2 && text.length <= NAV_TEXT_MAX;
    if (typeof title === 'string') {
        const highlights = [...title.matchAll(/<(highlight\w*)>(.*?)<\/\1>/g)].map((m) => m[2].trim()); // <highlight>, <highlightAlt>, …
        if (highlights.length === 1 && short(highlights[0])) return highlights[0];
        const plain = title.replace(/<br><\/br>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (short(plain)) return plain;
    }
    const id = sectionId(section);
    return id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
}

// A section's `nav` entry from the answers. Options the assistant doesn't ask about (e.g. `order`)
// are kept from the current entry, so re-running it doesn't undo them.
export function navEntry(label, header, footer, current = null) {
    const { label: _label, header: _header, footer: _footer, ...kept } = current ?? {};
    return { label, ...(header ? {} : { header: false }), ...(footer ? {} : { footer: false }), ...kept };
}

// Navigation texts have to fit the header; "Privacy Policy" (14) is the longest in the template.
const NAV_TEXT_MAX = 24;
const navText = v.all(v.required, (value) => (value.trim().length > NAV_TEXT_MAX ? `Keep navigation texts short (max. ${NAV_TEXT_MAX} characters).` : undefined));

// Section options the assistant offers, by type. Everything else on a section entry stays as it is.
const OPTIONS = {
    hero: ['background', 'overlay', 'colorMode', 'ctaHref'],
    about: ['image'],
    'starter-pricing': ['cardColorMode'],
};

// Pages this step asks about: all but the lab page, which the lab step switches.
export const pagesToAsk = (pages) => Object.keys(pages).filter((key) => key !== LAB_PAGE);

// Positions of the sections that can be switched on/off here: all but lab sections (lab step).
export const switchableSections = (sections) => sections.map((_, i) => i).filter((i) => !isLabSection(sections[i]));

const step = {
    id: 'pages',
    title: 'Pages & sections',
    hint: 'pages on/off, sections, order, navigation, section options',

    async ask(state) {
        log.step('Pages & sections');
        const { pages } = state;
        const keys = pagesToAsk(pages);

        // 1. Pages
        const describePage = (key) => `${key} (${pages[key].path})`;
        const enabledPages = await multiselect({
            message: 'Pages (untick to switch a page off: 404, not in the sitemap or navigation)',
            options: keys.map((key) => ({
                value: key,
                label: describePage(key),
                hint: pages[key].type === 'legal' ? 'legal page' : `${(pages[key].sections ?? []).length} sections`,
                disabled: pages[key].path === '/',
            })),
            initialValues: keys.filter((key) => isOn(pages[key])),
            required: true,
        });

        const answers = {};
        const navTexts = {}; // new `Nav.<label>` texts for the default language
        for (const key of keys) {
            const page = pages[key];
            const enabled = page.path === '/' || enabledPages.includes(key);
            answers[key] = { enabled };
            if (!enabled || !page.sections) continue;
            answers[key].sections = await askSections(state, key, page, navTexts);
        }
        return { pages: answers, navTexts };
    },

    changes(state, a) {
        const changes = [];
        const add = (label, from, to) => { if (JSON.stringify(from) !== JSON.stringify(to)) changes.push({ file: FILE, label, from, to }); };
        for (const [key, page] of Object.entries(state.pages)) {
            const answer = a.pages[key];
            if (!answer) continue;
            add(`${key}: page`, isOn(page) ? 'on' : 'off', answer.enabled ? 'on' : 'off');
            if (!answer.sections) continue;
            const before = page.sections;
            const names = (list) => list.map((s) => sectionId(s)).join(', ');
            // Lab sections are left out: their on/off state belongs to the lab step.
            const onBefore = before.filter((s) => isOn(s) && !isLabSection(s));
            const onAfter = answer.sections.filter((s) => s.enabled).map((s) => before[s.index]).filter((s) => !isLabSection(s));
            add(`${key}: sections`, names(onBefore), names(onAfter));
            for (const s of answer.sections) {
                const section = before[s.index];
                const id = sectionId(section);
                add(`${key}.${id}: nav`, describeNav(section.nav), describeNav(s.nav));
                for (const [prop, value] of Object.entries(s.props)) add(`${key}.${id}: ${prop}`, describeValue(section[prop]), describeValue(value));
            }
        }
        for (const [label, value] of Object.entries(a.navTexts ?? {})) {
            changes.push({ file: messagesFile(state.routing.defaultLocale), label: `Nav.${label}`, from: null, to: `"${value}" (navigation text)` });
        }
        return changes;
    },

    async write(state, a, workspace) {
        const file = await workspace.file(FILE);
        for (const [key, page] of Object.entries(state.pages)) {
            const answer = a.pages[key];
            if (!answer) continue;
            const pagePath = `pages.${key}`;
            if (answer.enabled !== isOn(page)) {
                if (answer.enabled) file.set(`${pagePath}.enabled`, true);
                else file.assign(`${pagePath}.enabled`, false);
            }
            if (!answer.sections) continue;
            for (const s of answer.sections) {
                const section = page.sections[s.index];
                const sectionPath = `${pagePath}.sections[${s.index}]`;
                if (s.enabled !== isOn(section)) {
                    if (s.enabled) file.remove(`${sectionPath}.enabled`);
                    else file.assign(`${sectionPath}.enabled`, false);
                }
                if (JSON.stringify(s.nav) !== JSON.stringify(section.nav ?? null)) {
                    if (s.nav) file.assign(`${sectionPath}.nav`, s.nav);
                    else file.remove(`${sectionPath}.nav`);
                }
                for (const [prop, value] of Object.entries(s.props)) file.assign(`${sectionPath}.${prop}`, value);
            }
            const order = answer.sections.map((s) => s.index);
            if (order.some((index, i) => index !== i)) file.reorder(`${pagePath}.sections`, order);
        }
        if (Object.keys(a.navTexts ?? {}).length) {
            const messages = await workspace.jsonFile(messagesFile(state.routing.defaultLocale));
            messages.Nav = { ...messages.Nav, ...a.navTexts };
        }
    },

    todos(state, a) {
        const todos = [];
        for (const [key, page] of Object.entries(state.pages)) {
            const answer = a.pages[key];
            if (!answer) continue;
            if (!answer.enabled && page.type === 'legal') todos.push(`The ${key} page is switched off; make sure your site doesn't need it legally (it does in Germany).`);
            const turnedOn = (answer.sections ?? []).filter((s) => s.enabled && !isOn(page.sections[s.index])).map((s) => sectionId(page.sections[s.index]));
            if (turnedOn.length) todos.push(`Sections switched on (${key}: ${turnedOn.join(', ')}): check their texts in messages/<language>.json.`);
            const hero = (answer.sections ?? []).find((s) => page.sections[s.index].type === 'hero' && s.props.background);
            if (hero && ['video', 'image'].includes(hero.props.background.type)) todos.push('Hero footage: replace the placeholder files in public/images/hero/ with your own (same paths, or change them in config/pages.js).');
        }
        const labels = Object.keys(a.navTexts ?? {});
        const others = state.routing.locales.filter((l) => l !== state.routing.defaultLocale);
        if (labels.length && others.length) {
            todos.push(`Navigation text${labels.length > 1 ? 's' : ''} ${labels.map((l) => `Nav.${l}`).join(', ')} added to ${messagesFile(state.routing.defaultLocale)}; translate ${labels.length > 1 ? 'them' : 'it'} in ${others.map(messagesFile).join(', ')} (until then the default language shows).`);
        }
        return todos;
    },
};

export default step;

// Sections of one page: on/off, order, navigation, options. Returns entries in the new order:
// { index (in the current config), enabled, nav (object or null), props (changed options) }.
async function askSections(state, key, page, navTexts) {
    const sections = page.sections;
    const id = (i) => sectionId(sections[i]);
    log.message(`${key} (${page.path}): ${sections.map((s, i) => `${id(i)}${isOn(s) ? '' : ' (off)'}`).join(', ')}`);

    const switchable = switchableSections(sections);
    const chosen = switchable.length === 0 ? [] : await multiselect({
        message: `Sections on ${page.path} (untick to switch off; the entry stays in the config${switchable.length < sections.length ? '; the lab section is switched in the Lab step' : ''})`,
        options: switchable.map((i) => ({ value: i, label: id(i), hint: sections[i].type !== id(i) ? sections[i].type : undefined })),
        initialValues: switchable.filter((i) => isOn(sections[i])),
        required: true,
    });
    // Lab sections keep their state; the ones that are on take part in ordering and navigation.
    const enabled = [...chosen, ...sections.map((_, i) => i).filter((i) => !switchable.includes(i) && isOn(sections[i]))];

    // Order
    let order = sections.map((_, i) => i);
    if (await confirm({ message: `Reorder the sections of ${page.path}?`, initialValue: false })) {
        for (;;) {
            const shown = order.filter((i) => enabled.includes(i));
            const pick = await select({
                message: `Order: ${shown.map((i) => id(i)).join(' → ')}. Move a section?`,
                options: [{ value: -1, label: 'Done, keep this order' }, ...shown.map((i) => ({ value: i, label: id(i) }))],
                initialValue: -1,
            });
            if (pick === -1) break;
            const others = shown.filter((i) => i !== pick);
            const after = await select({
                message: `Move "${id(pick)}"`,
                options: [{ value: -1, label: 'to the top' }, ...others.map((i) => ({ value: i, label: `after ${id(i)}` }))],
            });
            order = order.filter((i) => i !== pick);
            order.splice(after === -1 ? 0 : order.indexOf(after) + 1, 0, pick);
        }
    }

    // Navigation. The label is the section's `nav.label`, else a `Nav.<id>` text that already exists;
    // a section without either gets one: the text is asked for and written to the default language.
    const enabledInOrder = order.filter((i) => enabled.includes(i));
    const existingLabel = (i) => sections[i].nav?.label ?? state.navLabels.find((l) => l === id(i) || l === sections[i].type);
    const candidates = enabledInOrder;
    const navs = {};
    // A page whose sections aren't in the navigation yet (e.g. /starter) is only asked if wanted.
    const askNav = candidates.length > 0 && (candidates.some((i) => sections[i].nav) || await confirm({ message: `Put sections of ${page.path} into the navigation?`, initialValue: false }));
    if (askNav) {
        const inHeader = await multiselect({
            message: `Header navigation for ${page.path}`,
            options: candidates.map((i) => ({ value: i, label: id(i), hint: existingLabel(i) ? `text "Nav.${existingLabel(i)}"` : 'no navigation text yet, you will be asked for one' })),
            initialValues: candidates.filter((i) => sections[i].nav && sections[i].nav.header !== false),
            required: false,
        });
        const inFooter = await multiselect({
            message: `Footer navigation for ${page.path}`,
            options: candidates.map((i) => ({ value: i, label: id(i) })),
            initialValues: candidates.filter((i) => sections[i].nav && (sections[i].nav.footer ?? true) === true),
            required: false,
        });
        for (const i of candidates) {
            const header = inHeader.includes(i);
            const footer = inFooter.includes(i);
            if (!header && !footer) { navs[i] = null; continue; }
            let label = existingLabel(i);
            if (!label) {
                label = id(i);
                navTexts[label] = await text({
                    message: `Navigation text for "${id(i)}" (${state.routing.defaultLocale}; written to ${messagesFile(state.routing.defaultLocale)} as Nav.${label})`,
                    initialValue: suggestNavText(state, sections[i]),
                    validate: navText,
                });
            }
            navs[i] = navEntry(label, header, footer, sections[i].nav);
        }
    }

    // Options
    const props = {};
    const withOptions = enabledInOrder.filter((i) => OPTIONS[sections[i].type]);
    if (withOptions.length && await confirm({ message: `Adjust section options on ${page.path}? (${withOptions.map((i) => `${id(i)}: ${OPTIONS[sections[i].type].join(', ')}`).join('; ')})`, initialValue: false })) {
        const ids = enabledInOrder.map((i) => id(i));
        for (const i of withOptions) props[i] = await askOptions(state, sections[i], ids);
    }

    return order.map((i) => ({
        index: i,
        enabled: enabled.includes(i),
        nav: i in navs ? navs[i] : (sections[i].nav ?? null),
        props: props[i] ?? {},
    }));
}

// The options of one section; only what differs from the current entry is returned.
async function askOptions(state, section, sectionIds) {
    const id = sectionId(section);
    const changed = {};
    const keep = (prop, value) => { if (JSON.stringify(value) !== JSON.stringify(section[prop])) changed[prop] = value; };
    const modes = Object.keys(state.theme.colors);
    const pinOptions = [{ value: 'auto', label: 'auto', hint: 'follows the site' }, ...modes.map((m) => ({ value: m, label: m, hint: `always the ${m} palette` }))];
    log.message(`${id} (${section.type})`);

    switch (section.type) {
        case 'hero': {
            keep('background', await askHeroBackground(state, section.background));
            const overlay = section.overlay === false ? 0 : (section.overlay?.opacity ?? 0.5);
            const opacity = Number(await text({ message: 'Overlay tint over the background (0 = none, 1 = solid; 0.5 is the default)', initialValue: String(overlay), validate: v.numberBetween(0, 1) }));
            keep('overlay', opacity === 0 ? false : { color: section.overlay?.color ?? 'background', opacity });
            keep('colorMode', await select({ message: 'Colour mode of the hero (dark footage usually wants the dark palette)', options: pinOptions, initialValue: section.colorMode ?? 'dark' }));
            keep('ctaHref', await text({
                message: 'Where the hero button scrolls to',
                initialValue: section.ctaHref ?? '#intro',
                validate: v.all(v.anchor, (value) => (sectionIds.includes(value.trim().slice(1)) ? undefined : `No section with that id on this page (${sectionIds.map((s) => `#${s}`).join(', ')}).`)),
            }));
            break;
        }
        case 'about':
            keep('image', await text({ message: 'Portrait image (path under public/)', initialValue: section.image, validate: v.publicPath(state.root) }));
            break;
        case 'starter-pricing':
            keep('cardColorMode', await select({ message: 'Colour mode of the price card', options: pinOptions, initialValue: section.cardColorMode ?? 'auto' }));
            break;
        default:
            break;
    }
    return changed;
}

// The hero background: video, image, gradient or colour; see components/sections/HeroBackground.jsx.
async function askHeroBackground(state, current = {}) {
    const type = await select({
        message: 'Hero background',
        options: [
            { value: 'video', label: 'Video', hint: 'looping, muted; with a poster image' },
            { value: 'image', label: 'Image' },
            { value: 'gradient', label: 'Gradient', hint: 'a named gradient from config/theme.js' },
            { value: 'color', label: 'Colour', hint: 'a colour token' },
        ],
        initialValue: ['video', 'image', 'gradient', 'color'].includes(current.type) ? current.type : 'video',
    });
    const same = current.type === type;
    const file = (message, value, optional = false) => text({ message, initialValue: value, placeholder: optional ? 'empty = none' : undefined, validate: optional ? v.optional(v.publicPath(state.root)) : v.publicPath(state.root) });

    switch (type) {
        case 'video': {
            const src = await file('Video file (path under public/)', same ? current.src : '/images/hero/hero_loop_silent_2.mp4');
            const poster = await file('Poster image, shown until the video plays', same ? current.poster : '/images/hero/hero_poster.jpg');
            const mobileSrc = await file('Video for phones (optional)', same ? current.mobile?.src : '', true);
            const mobilePoster = mobileSrc ? await file('Poster for phones', same ? current.mobile?.poster : '') : '';
            return { type, src, poster, ...(mobileSrc ? { mobile: { src: mobileSrc, poster: mobilePoster } } : {}) };
        }
        case 'image': {
            const src = await file('Image file (path under public/)', same ? current.src : '/images/hero/hero_poster.jpg');
            const mobileSrc = await file('Image for phones (optional)', same ? current.mobile?.src : '', true);
            return { type, src, ...(mobileSrc ? { mobile: { src: mobileSrc } } : {}) };
        }
        case 'gradient': {
            const names = Object.keys(state.theme.gradients);
            const gradient = await select({ message: 'Gradient', options: names.map((n) => ({ value: n, label: n, hint: state.theme.gradients[n].join(' → ') })), initialValue: same && names.includes(current.gradient) ? current.gradient : 'brand' });
            const direction = await text({ message: 'Direction (CSS, e.g. 135deg or "to right")', initialValue: same ? (current.direction ?? '135deg') : '135deg', validate: v.required });
            return { type, gradient, direction };
        }
        case 'color': {
            const tokens = ['background', 'surface', 'surface-deep', 'primary', 'secondary', 'accent'];
            const color = await select({ message: 'Colour token', options: tokens.map((t) => ({ value: t })), initialValue: same && tokens.includes(current.color) ? current.color : 'surface' });
            return { type, color };
        }
        default:
            return current;
    }
}

const describeNav = (nav) => {
    if (!nav) return 'not in the navigation';
    const places = [nav.header !== false && 'header', (nav.footer ?? true) === true && 'footer', nav.footer === 'legal' && 'legal footer'].filter(Boolean);
    return `${places.join(' + ') || 'hidden'} (label "${nav.label}")`;
};

const describeValue = (value) => {
    if (value === undefined) return '(default)';
    if (value === false) return 'off';
    if (typeof value !== 'object') return String(value);
    if (value.type) return `${value.type}${value.src ? ` ${value.src}` : ''}${value.gradient ? ` ${value.gradient}` : ''}${value.color ? ` ${value.color}` : ''}`;
    if (value.opacity !== undefined) return `${value.color ?? 'background'} at ${value.opacity}`;
    return JSON.stringify(value);
};
