#!/usr/bin/env node
/**
 * Setup assistant: asks for the brand basics, theme, languages, lab and pages of a new site and writes
 * the answers into config/, i18n/routing.js and messages/. The config files are edited in place,
 * so their comments stay. Re-running it shows the current values as defaults.
 *
 * Nothing is written before the summary is confirmed; afterwards `npm run check` runs and a list
 * of what is still to be done by hand (logo, images, texts, .env.local) is shown.
 *
 * Run it with: npm run setup
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { intro, outro, note, log, spinner, confirm, multiselect } from './prompts.mjs';
import { loadState } from './state.mjs';
import { Workspace } from './workspace.mjs';
import { manualTodos } from './todo.mjs';
import brand from './steps/brand.mjs';
import theme from './steps/theme.mjs';
import languages from './steps/languages.mjs';
import lab from './steps/lab.mjs';
import pages from './steps/pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const run = promisify(execFile);

// The steps in the order they are asked (and written). `lab` comes before `pages`: both edit
// config/pages.js by the sections' original positions, and `pages` reorders them at the end.
const steps = [
    brand,
    theme,
    languages,
    lab,
    pages,
];

async function main() {
    if (!process.stdin.isTTY) {
        console.error('The setup assistant is interactive; run it in a terminal: npm run setup');
        process.exit(1);
    }

    intro('Studio site setup');
    await warnAboutUncommittedChanges();

    const state = await loadState(root);
    const selected = await multiselect({
        message: 'What do you want to set up? (space toggles, enter confirms)',
        options: steps.map((step) => ({ value: step.id, label: step.title, hint: step.hint })),
        initialValues: steps.map((step) => step.id),
        required: true,
    });

    const answers = {};
    for (const step of steps) {
        if (selected.includes(step.id)) answers[step.id] = await step.ask(state);
    }
    const active = steps.filter((step) => answers[step.id]);

    const changes = active.flatMap((step) => step.changes(state, answers[step.id]));
    if (changes.length === 0) {
        outro('Everything is already set up the way you answered. Nothing to write.');
        return;
    }

    note(formatChanges(changes), 'Summary of changes');
    const proceed = await confirm({ message: 'Write these changes?', initialValue: true });
    if (!proceed) {
        outro('Nothing was changed.');
        return;
    }

    const workspace = new Workspace(root);
    for (const step of active) await step.write(state, answers[step.id], workspace);
    const written = await workspace.commit();
    log.success(`Written: ${written.join(', ')}`);

    await runCheck();

    const todos = [...active.flatMap((step) => step.todos?.(state, answers[step.id]) ?? []), ...manualTodos];
    note(todos.map((t, i) => `${i + 1}. ${t}`).join('\n'), 'Still to do by hand');
    outro('Done. Run `npm run dev` to see the site; run `npm run setup` again any time.');
}

// The assistant rewrites config files: with git, uncommitted changes are the only way back.
async function warnAboutUncommittedChanges() {
    let status;
    let prefix = '';
    try {
        ({ stdout: status } = await run('git', ['status', '--porcelain', '--', '.'], { cwd: root }));
        prefix = (await run('git', ['rev-parse', '--show-prefix'], { cwd: root })).stdout.trim();
    } catch {
        log.warn('Not a git repository (or git is not installed): there is no way to undo the changes. Consider committing the project first.');
        if (!(await confirm({ message: 'Continue anyway?', initialValue: false }))) { outro('Nothing was changed.'); process.exit(0); }
        return;
    }
    const files = status.trim().split('\n').filter(Boolean).map((line) => line.replace(prefix, ''));
    if (files.length === 0) return;
    log.warn(`There are uncommitted changes in ${files.length} file(s):\n${files.slice(0, 10).map((f) => `  ${f.trim()}`).join('\n')}${files.length > 10 ? '\n  …' : ''}\nCommit or stash them first, so the assistant's changes can be reverted on their own.`);
    if (!(await confirm({ message: 'Continue anyway?', initialValue: false }))) { outro('Nothing was changed.'); process.exit(0); }
}

// One line per change, grouped by file: `label: from → to`.
function formatChanges(changes) {
    const byFile = new Map();
    for (const change of changes) {
        if (!byFile.has(change.file)) byFile.set(change.file, []);
        byFile.get(change.file).push(change);
    }
    const show = (value) => (value === '' ? '(empty)' : String(value));
    const lines = [];
    for (const [file, items] of byFile) {
        lines.push(file);
        for (const { label, from, to } of items) {
            if (from === null && to === null) lines.push(`  ${label}`);
            else if (from === null) lines.push(`  ${label}: ${show(to)}`);
            else lines.push(`  ${label}: ${show(from)} → ${show(to)}`);
        }
    }
    return lines.join('\n');
}

// `npm run check` validates the result; its findings are shown, they don't stop the assistant.
async function runCheck() {
    const s = spinner();
    s.start('Running npm run check');
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    let output;
    let failed = false;
    try {
        const { stdout, stderr } = await run(npm, ['run', 'check', '--silent'], { cwd: root, shell: process.platform === 'win32' });
        output = `${stdout}${stderr}`; // warnings go to stderr
    } catch (error) {
        output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
        failed = true;
    }
    const findings = output.split('\n').filter((line) => /[✖⚠]/.test(line));
    const summary = output.split('\n').filter((line) => /error\(s\)|in sync|warning\(s\)\./.test(line)).map((l) => l.trim());
    if (failed) {
        s.stop('npm run check found problems');
        log.error([...findings, ...summary].join('\n'));
    } else {
        s.stop(`npm run check: ${summary.join('; ') || 'ok'}`);
        if (findings.length) log.warn(findings.join('\n'));
    }
}

main().catch((error) => {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
});
