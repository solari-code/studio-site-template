/**
 * Collects the edits of all steps in memory and writes them in one go at the end, so a failing
 * edit leaves the project untouched and nothing is written before the summary is confirmed.
 */
import { readFile, writeFile, copyFile, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { SourceFile } from './source.mjs';

export class Workspace {
    constructor(root) {
        this.root = root;
        this.files = new Map();   // relative path -> SourceFile (edited in memory)
        this.json = new Map();    // relative path -> { data, original } (JSON files edited in memory)
        this.copies = [];         // { from, to } relative paths
        this.deletions = [];      // relative paths
    }

    /** The parsed content of a JSON file (messages/<code>.json); edit it in place, it is written on commit. */
    async jsonFile(relative) {
        if (!this.json.has(relative)) {
            const original = await readFile(path.join(this.root, relative), 'utf8');
            this.json.set(relative, { data: JSON.parse(original), original });
        }
        return this.json.get(relative).data;
    }

    /** The editable source of a config file (read once, shared by all steps). */
    async file(relative) {
        if (!this.files.has(relative)) {
            this.files.set(relative, await SourceFile.read(path.join(this.root, relative)));
        }
        return this.files.get(relative);
    }

    copy(from, to) { this.copies.push({ from, to }); }
    delete(relative) { this.deletions.push(relative); }

    /** Relative paths of everything that will be written, created or deleted. */
    get touched() {
        return [
            ...[...this.files.entries()].filter(([, f]) => f.changed).map(([name]) => name),
            ...[...this.json.entries()].filter(([, j]) => serialize(j.data) !== j.original).map(([name]) => name),
            ...this.copies.map((c) => c.to),
            ...this.deletions,
        ];
    }

    /** Writes every changed file; returns the relative paths written, created and deleted. */
    async commit() {
        const written = [];
        for (const [relative, file] of this.files) {
            if (!file.changed) continue;
            await writeFile(path.join(this.root, relative), file.text);
            written.push(relative);
        }
        // JSON files before copies, so a new language file includes the edits.
        for (const [relative, { data, original }] of this.json) {
            const text = serialize(data);
            if (text === original) continue;
            await writeFile(path.join(this.root, relative), text);
            written.push(relative);
        }
        for (const { from, to } of this.copies) {
            await mkdir(path.dirname(path.join(this.root, to)), { recursive: true });
            await copyFile(path.join(this.root, from), path.join(this.root, to));
            written.push(to);
        }
        for (const relative of this.deletions) {
            await rm(path.join(this.root, relative), { force: true });
            written.push(relative);
        }
        return written;
    }
}

// The messages files' format: 4-space JSON with a trailing newline.
const serialize = (data) => `${JSON.stringify(data, null, 4)}\n`;
