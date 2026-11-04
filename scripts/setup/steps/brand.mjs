/**
 * Step "Brand & contact": site name and URL, contact details and social links -> config/site.js.
 */
import { text, select, multiselect, confirm, log } from '../prompts.mjs';
import * as v from '../validate.mjs';

const FILE = 'config/site.js';

const step = {
    id: 'brand',
    title: 'Brand & contact',
    hint: 'site name, URL, contact details, social links',

    async ask(state) {
        const { site } = state;
        log.step('Brand & contact');

        const name = await text({ message: 'Site name (brand, shown in the title, footer and mails)', initialValue: site.name, validate: v.displayName });
        const url = (await text({ message: 'Site URL (the origin only, e.g. https://example.com)', initialValue: site.url, validate: v.siteUrl })).replace(/\/+$/, '');

        const email = await text({ message: 'Contact email (shown in the footer and the legal pages)', initialValue: site.contact.email, validate: v.email });
        const formSender = await text({ message: 'Sender address for contact-form mails (must be on a domain verified in Resend)', initialValue: site.contact.formSender, validate: v.email });
        const phone = await text({ message: 'Phone number as shown on the site (used in the legal pages)', initialValue: site.contact.phone, validate: v.phone });
        const whatsappNumber = await text({
            message: 'WhatsApp number for the "Chat on WhatsApp" button (digits with country code; leave empty to hide the button)',
            initialValue: site.contact.whatsappNumber,
            placeholder: 'empty = no WhatsApp button',
            validate: v.optional(v.whatsappNumber),
        });

        const social = await askSocial(state);

        return { name, url, contact: { email, formSender, phone, whatsappNumber }, social };
    },

    changes(state, a) {
        const { site } = state;
        const changes = [];
        const add = (label, from, to) => { if (from !== to) changes.push({ file: FILE, label, from, to }); };
        add('name', site.name, a.name);
        add('url', site.url, a.url);
        for (const key of ['email', 'formSender', 'phone', 'whatsappNumber']) add(`contact.${key}`, site.contact[key], a.contact[key]);
        const describe = (links) => links.map((l) => `${l.label} (${l.url})`).join(', ') || '(none)';
        if (JSON.stringify(site.social) !== JSON.stringify(a.social)) add('social', describe(site.social), describe(a.social));
        return changes;
    },

    async write(state, a, workspace) {
        const file = await workspace.file(FILE);
        file.set('siteConfig.name', a.name);
        file.set('siteConfig.url', a.url);
        for (const key of ['email', 'formSender', 'phone', 'whatsappNumber']) file.set(`siteConfig.contact.${key}`, a.contact[key]);
        file.rewriteArray('siteConfig.social', a.social);
    },

    todos(state, a) {
        const todos = [];
        if (a.contact.formSender !== state.site.contact.formSender || /example\.com$/.test(a.contact.formSender)) {
            todos.push(`Verify the domain of ${a.contact.formSender} in Resend, otherwise contact-form mails are rejected.`);
        }
        return todos;
    },
};

export default step;

// The social links: keep, or edit the list (which to keep, their URLs, new ones).
async function askSocial(state) {
    const current = state.site.social.map((link) => ({ label: link.label, icon: link.icon, url: link.url }));
    const lines = current.length ? current.map((l) => `${l.label}: ${l.url}`) : ['(none)'];
    log.message(['Social links in the footer:', ...lines.map((l) => `  ${l}`)].join('\n'));

    const mode = await select({
        message: 'Social links',
        options: [
            { value: 'keep', label: 'Keep them as they are' },
            { value: 'edit', label: 'Edit the list', hint: 'remove links, change URLs, add links' },
        ],
        initialValue: 'keep',
    });
    if (mode === 'keep') return current;

    let links = current;
    if (links.length) {
        const kept = await multiselect({
            message: 'Which links stay? (space toggles, enter confirms)',
            options: links.map((l, i) => ({ value: i, label: l.label, hint: l.url })),
            initialValues: links.map((_, i) => i),
            required: false,
        });
        links = links.filter((_, i) => kept.includes(i));
        for (const link of links) {
            link.url = await text({ message: `URL of ${link.label}`, initialValue: link.url, validate: v.absoluteUrl });
        }
    }

    const icons = [...state.brandIcons, ...state.icons.filter((i) => !state.brandIcons.includes(i))];
    while (await confirm({ message: links.length ? 'Add another link?' : 'Add a link?', initialValue: links.length === 0 })) {
        const label = await text({ message: 'Label (e.g. Instagram)', validate: v.displayName });
        const guess = icons.find((i) => i === label.toLowerCase().replace(/\s+/g, '-'));
        const icon = await select({
            message: `Icon for ${label} (names from config/icons.js)`,
            options: icons.map((i) => ({ value: i, label: i, hint: state.brandIcons.includes(i) ? 'brand mark' : undefined })),
            initialValue: guess ?? icons[0],
        });
        const url = await text({ message: `URL of ${label}`, validate: v.absoluteUrl });
        links.push({ label, icon, url });
    }
    return links;
}
