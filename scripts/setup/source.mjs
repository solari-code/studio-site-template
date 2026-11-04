/**
 * Comment-preserving edits of the config files (config/site.js, config/theme.js, config/pages.js,
 * i18n/routing.js) for the setup assistant.
 *
 * The files are edited as text, not regenerated: only the values the assistant changes are touched,
 * and the comments, blank lines and formatting around them stay as they are. Values are addressed
 * by path from an exported declaration, e.g. `siteConfig.contact.email`, `theme.colors.dark.on-brand`
 * or `pages.home.sections[2].enabled`.
 *
 *   const file = await SourceFile.read('config/site.js');
 *   file.set('siteConfig.name', 'Acme');                                 // replace one value
 *   file.assign('pages.home.sections[3].enabled', false);               // set, or add the property
 *   file.remove('theme.colors.light');                                  // drop a property and its comments
 *   file.rewriteObject('theme.colors.dark', { background: '#000', … }); // keys keep their comments
 *   file.rewriteArray('siteConfig.social', [{ label: 'X', … }]);        // unchanged items keep their text
 *   file.reorder('pages.home.sections', [0, 2, 1]);                     // entries move with their comments
 *   await file.write();
 *
 * Rules the block operations (assign, insert, remove, rewriteObject, rewriteArray, reorder) follow:
 * - a comment on the lines above an entry, and a comment after it on the same line, belong to that
 *   entry: they move with it, stay when its value changes, and go when the entry is removed;
 * - comments after the last entry of a block stay at the end of the block;
 * - blank lines between entries are kept (one at most);
 * - an entry whose new value equals its current one keeps its exact text (manual formatting survives);
 *   an expression such as `process.env.X ? … : …` never counts as equal to a value, so `set` replaces
 *   it only when asked to, and `rewriteObject` keeps it only when passed as `raw(file.source(path))`;
 * - new values are printed in the file's style: its quote character, its indentation unit, objects
 *   and arrays inline up to ~100 characters, otherwise one entry per line with trailing commas;
 * - inline blocks (`{ type: 'intro' }`) stay inline, multi-line blocks stay multi-line.
 *
 * Only plain data is handled (object and array literals, strings, numbers, booleans, null); anything
 * else is passed through as text. `raw('…')` writes an expression verbatim.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const INLINE_WIDTH = 100;
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

// A piece of source to write as-is, e.g. raw("process.env.X ? ['a'] : []").
export class Raw {
    constructor(text) { this.text = text; }
}
export const raw = (text) => new Raw(text);

// --- Scanning ---------------------------------------------------------------
// The scanner only needs to know where strings and comments are, so brackets inside them don't count.

// If `i` is at the start of a string, template literal or comment, returns the index after it; otherwise `i`.
function skipNonCode(text, i) {
    const c = text[i];
    if (c === "'" || c === '"') {
        for (let j = i + 1; j < text.length; j++) {
            if (text[j] === '\\') { j++; continue; }
            if (text[j] === c || text[j] === '\n') return j + 1;
        }
        return text.length;
    }
    if (c === '`') {
        for (let j = i + 1; j < text.length; j++) {
            if (text[j] === '\\') { j++; continue; }
            if (text[j] === '$' && text[j + 1] === '{') { j = matchBracket(text, j + 1); continue; }
            if (text[j] === '`') return j + 1;
        }
        return text.length;
    }
    if (c === '/' && text[i + 1] === '/') {
        const end = text.indexOf('\n', i);
        return end === -1 ? text.length : end;
    }
    if (c === '/' && text[i + 1] === '*') {
        const end = text.indexOf('*/', i + 2);
        return end === -1 ? text.length : end + 2;
    }
    return i;
}

const isComment = (text, i) => text[i] === '/' && (text[i + 1] === '/' || text[i + 1] === '*');
const OPEN = { '{': '}', '[': ']', '(': ')' };
const CLOSE = new Set(Object.values(OPEN));

// Index of the bracket closing the one at `open`.
export function matchBracket(text, open) {
    let depth = 0;
    for (let i = open; i < text.length;) {
        const next = skipNonCode(text, i);
        if (next !== i) { i = next; continue; }
        const c = text[i];
        if (c in OPEN) depth++;
        else if (CLOSE.has(c) && --depth === 0) return i;
        i++;
    }
    throw new Error(`Unbalanced ${text[open]} at offset ${open}`);
}

// Index of the first `char` at bracket depth 0 in [from, to), outside strings and comments, or -1.
function indexAtDepth0(text, char, from, to) {
    for (let i = from; i < to;) {
        const next = skipNonCode(text, i);
        if (next !== i) { i = next; continue; }
        const c = text[i];
        if (c in OPEN) { i = matchBracket(text, i) + 1; continue; }
        if (c === char) return i;
        i++;
    }
    return -1;
}

// Index of the `;` or newline that ends the expression starting at `from` (brackets, strings and
// comments are skipped, so a multi-line call or literal counts as one expression).
function endOfExpression(text, from) {
    for (let i = from; i < text.length;) {
        if (isComment(text, i)) return i;
        const next = skipNonCode(text, i);
        if (next !== i) { i = next; continue; }
        const c = text[i];
        if (c in OPEN) { i = matchBracket(text, i) + 1; continue; }
        if (c === ';' || c === '\n') return i;
        i++;
    }
    return text.length;
}

const lineStart = (text, i) => text.lastIndexOf('\n', i - 1) + 1;
const lineIndent = (text, i) => /^[ \t]*/.exec(text.slice(lineStart(text, i), i))[0];

// --- Blocks -------------------------------------------------------------------
// An object or array literal split into its entries, each with the comments that belong to it.

/**
 * Parses the block (object or array literal) opening at `open` into
 *   { kind, open, close, multiline, indent, closeIndent, entries, tail, tailBlankBefore }
 * with entries { leading, blankBefore, key, keyText, text, valueStart, valueEnd, trailing, trailingGap }
 * (`key` is null for array items; `text` is `keyText: value` or the item; positions are absolute).
 */
export function parseBlock(text, open) {
    if (!(text[open] in OPEN) || text[open] === '(') throw new Error(`Expected an object or array at offset ${open}`);
    const close = matchBracket(text, open);
    const kind = text[open] === '{' ? 'object' : 'array';
    const entries = [];
    let previous = null;     // the last entry, to attach a same-line trailing comment
    let afterComma = -1;     // position after the previous entry's comma (for the trailing gap)
    let sameLine = false;    // no newline since the previous entry ended
    let leading = [];
    let blankBefore = false;
    let newlines = 0;        // newlines since the last comment or entry
    let leadingStart = -1;

    for (let i = open + 1; i < close;) {
        const c = text[i];
        if (c === '\n') { newlines++; sameLine = false; i++; continue; }
        if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }

        if (isComment(text, i)) {
            const end = skipNonCode(text, i);
            const comment = text.slice(i, end).trimEnd();
            if (previous && sameLine && !previous.trailing) {
                previous.trailing = comment;
                previous.trailingGap = text.slice(afterComma, i);
            } else {
                if (leading.length === 0) { blankBefore = newlines >= 2; leadingStart = i; }
                leading.push(comment);
            }
            i = end;
            newlines = 0;
            continue;
        }

        // An entry: code up to the next comma at depth 0 (or the end of the block).
        if (leading.length === 0) { blankBefore = newlines >= 2; leadingStart = i; }
        let comma = indexAtDepth0(text, ',', i, close);
        const end = comma === -1 ? close : comma;
        let entryEnd = end;
        while (entryEnd > i && /\s/.test(text[entryEnd - 1])) entryEnd--;
        // A comment between the value and its comma (`value // note\n,`) counts as trailing.
        let trailing = null;
        const body = text.slice(i, entryEnd);
        const entry = { leading, blankBefore, leadingStart, start: i, end: entryEnd, text: body, key: null, keyText: null, valueStart: i, valueEnd: entryEnd, trailing, trailingGap: ' ' };
        if (kind === 'object') {
            const colon = indexAtDepth0(text, ':', i, entryEnd);
            if (colon !== -1) {
                entry.keyText = text.slice(i, colon).trim();
                entry.key = unquoteKey(entry.keyText);
                let v = colon + 1;
                while (v < entryEnd && /\s/.test(text[v])) v++;
                entry.valueStart = v;
            }
        }
        entries.push(entry);
        previous = entry;
        afterComma = comma === -1 ? entryEnd : comma + 1;
        i = afterComma;
        sameLine = true;
        leading = [];
        blankBefore = false;
        newlines = 0;
    }

    const multiline = text.slice(open + 1, close).includes('\n');
    const firstStart = entries[0]?.leadingStart ?? (leading.length ? leadingStart : -1);
    const indent = multiline && firstStart !== -1 ? lineIndent(text, firstStart) : null;
    return {
        kind, open, close, multiline,
        indent,
        // for an inline block, the indent of its line (used if it has to become multi-line)
        closeIndent: multiline ? lineIndent(text, close) : lineIndent(text, open),
        entries,
        tail: leading,
        tailBlankBefore: leading.length ? blankBefore : false,
    };
}

function unquoteKey(keyText) {
    const m = /^(['"])(.*)\1$/.exec(keyText);
    return m ? m[2] : keyText;
}

// --- Printing -----------------------------------------------------------------

function quoteString(value, quote) {
    const escaped = value.replace(/\\/g, '\\\\').replace(new RegExp(quote, 'g'), `\\${quote}`).replace(/\n/g, '\\n');
    return `${quote}${escaped}${quote}`;
}

function printKey(key, quote) {
    return IDENTIFIER.test(key) ? key : quoteString(key, quote);
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Raw);

/**
 * Source text of a value, in the file's style. `indent` is the indentation of the line the value
 * starts on; nested lines are indented one `unit` deeper. Inline when it fits into INLINE_WIDTH.
 */
export function printValue(value, { quote = "'", indent = '', unit = '    ', forceMultiline = false } = {}) {
    if (value instanceof Raw) return value.text;
    if (typeof value === 'string') return quoteString(value, quote);
    if (typeof value === 'number' || typeof value === 'boolean' || value === null) return String(value);
    if (value === undefined) throw new Error('Cannot print undefined');
    if (typeof value !== 'object') throw new Error(`Cannot print a ${typeof value}`);

    const entries = Array.isArray(value)
        ? value.map((item) => [null, item])
        : Object.entries(value).filter(([, v]) => v !== undefined);
    const [openChar, closeChar] = Array.isArray(value) ? ['[', ']'] : ['{', '}'];
    if (entries.length === 0) return `${openChar}${closeChar}`;

    const printEntry = (key, v, opts) => (key === null ? '' : `${printKey(key, quote)}: `) + printValue(v, opts);

    if (!forceMultiline) {
        const inline = entries.map(([k, v]) => printEntry(k, v, { quote, indent, unit })).join(', ');
        const fits = !inline.includes('\n') && indent.length + inline.length + 4 <= INLINE_WIDTH;
        if (fits) return Array.isArray(value) ? `${openChar}${inline}${closeChar}` : `${openChar} ${inline} ${closeChar}`;
    }
    const inner = indent + unit;
    const lines = entries.map(([k, v]) => `${inner}${printEntry(k, v, { quote, indent: inner, unit })},`);
    return `${openChar}\n${lines.join('\n')}\n${indent}${closeChar}`;
}

// Re-assembles a parsed block from (possibly modified) entries. Entries are { leading, blankBefore,
// text, trailing, trailingGap }; `text` is the complete entry (`key: value` or the item).
function printBlock(block, entries, { unit }) {
    const [openChar, closeChar] = block.kind === 'object' ? ['{', '}'] : ['[', ']'];
    const hasComments = entries.some((e) => e.leading?.length || e.trailing) || block.tail.length > 0;
    const multiline = block.multiline || hasComments || entries.some((e) => e.text.includes('\n'));

    if (!multiline) {
        if (entries.length === 0) return `${openChar}${closeChar}`;
        const inline = entries.map((e) => e.text).join(', ');
        return block.kind === 'object' ? `{ ${inline} }` : `[${inline}]`;
    }

    const closeIndent = block.closeIndent;
    const indent = block.indent ?? closeIndent + unit;
    let out = `${openChar}\n`;
    entries.forEach((entry, index) => {
        if (index > 0 && entry.blankBefore) out += '\n';
        for (const comment of entry.leading ?? []) out += `${indent}${comment}\n`;
        out += `${indent}${entry.text},${entry.trailing ? `${entry.trailingGap ?? ' '}${entry.trailing}` : ''}\n`;
    });
    if (block.tail.length) {
        if (entries.length > 0 && block.tailBlankBefore) out += '\n';
        for (const comment of block.tail) out += `${indent}${comment}\n`;
    }
    return `${out}${closeIndent}${closeChar}`;
}

// The spaces before a trailing comment after the entry grew by `delta` characters: aligned comments
// (two or more spaces) stay in their column where possible, a single space stays a single space.
function alignedGap(gap, delta) {
    if (!gap || gap.length < 2 || /[^ ]/.test(gap)) return gap;
    return ' '.repeat(Math.max(1, gap.length - delta));
}

// --- Values ---------------------------------------------------------------------

// The value a literal stands for, or { ok: false } when the text is not plain data. It is evaluated
// in an empty context, so an expression that refers to anything (`process.env.X ? … : …`,
// `hasColorModeToggle ? … : …`) fails and is left alone by the edits.
export function evaluate(text) {
    try {
        const value = runInNewContext(`(${text})`, Object.create(null), { timeout: 100 });
        return { ok: true, value: plain(value) };
    } catch {
        return { ok: false };
    }
}

// Values from the vm context belong to another realm (`Array.isArray` works, `instanceof` doesn't);
// copies them into ordinary objects and arrays of this realm.
function plain(value) {
    if (Array.isArray(value)) return value.map(plain);
    if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]));
    return value;
}

export function deepEqual(a, b) {
    if (a === b) return true;
    if (a instanceof Raw || b instanceof Raw) return a instanceof Raw && b instanceof Raw && a.text === b.text;
    if (Array.isArray(a) || Array.isArray(b)) {
        return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
    }
    if (isPlainObject(a) && isPlainObject(b)) {
        const keysA = Object.keys(a).filter((k) => a[k] !== undefined);
        const keysB = Object.keys(b).filter((k) => b[k] !== undefined);
        return keysA.length === keysB.length && keysA.every((k) => deepEqual(a[k], b[k]));
    }
    return false;
}

// --- Paths ----------------------------------------------------------------------

// 'pages.home.sections[2].enabled' -> ['pages', 'home', 'sections', 2, 'enabled']
export function parsePath(path) {
    if (Array.isArray(path)) return path;
    const segments = [];
    for (const part of path.split('.')) {
        const m = /^([^[\]]*)((?:\[\d+\])*)$/.exec(part);
        if (!m) throw new Error(`Invalid path "${path}"`);
        if (m[1]) segments.push(m[1]);
        for (const index of m[2].matchAll(/\[(\d+)\]/g)) segments.push(Number(index[1]));
    }
    return segments;
}

const formatPath = (segments) => segments.map((s, i) => (typeof s === 'number' ? `[${s}]` : i ? `.${s}` : s)).join('');

// --- Files ----------------------------------------------------------------------

export class SourceFile {
    constructor(text, { path = null, quote, unit } = {}) {
        this.path = path;
        this.text = text;
        this.original = text;
        this.quote = quote ?? detectQuote(text);
        this.unit = unit ?? detectIndentUnit(text);
    }

    static async read(path, options = {}) {
        return new SourceFile(await readFile(path, 'utf8'), { ...options, path });
    }

    async write(path = this.path) {
        if (!path) throw new Error('No file path to write to');
        await writeFile(path, this.text);
    }

    toString() { return this.text; }

    /** True once an edit changed the text. */
    get changed() { return this.text !== this.original; }

    // --- queries

    /** Range of a top-level declaration `[export] const NAME = …;`: { start, end, valueStart, valueEnd }. */
    declaration(name) {
        const re = new RegExp(`^[ \\t]*(?:export\\s+)?(?:const|let|var)\\s+${name}\\s*=\\s*`, 'm');
        const m = re.exec(this.text);
        if (!m) throw new Error(`${this.where()}: no declaration of "${name}"`);
        const valueStart = m.index + m[0].length;
        let valueEnd = endOfExpression(this.text, valueStart);
        const end = this.text[valueEnd] === ';' ? valueEnd + 1 : valueEnd;
        while (valueEnd > valueStart && /\s/.test(this.text[valueEnd - 1])) valueEnd--;
        return { start: m.index, end, valueStart, valueEnd };
    }

    /** Absolute range { start, end } of the value at `path`. Throws when the path doesn't exist. */
    locate(path) {
        const segments = parsePath(path);
        const { valueStart, valueEnd } = this.declaration(segments[0]);
        let range = { start: valueStart, end: valueEnd };
        for (let i = 1; i < segments.length; i++) {
            const entry = this.entryAt(range, segments[i], segments.slice(0, i));
            range = { start: entry.valueStart, end: entry.valueEnd };
        }
        return range;
    }

    has(path) {
        try { this.locate(path); return true; } catch { return false; }
    }

    /** The current value at `path` as data, or undefined when it's not a plain literal. */
    get(path) {
        const { start, end } = this.locate(path);
        const result = evaluate(this.text.slice(start, end));
        return result.ok ? result.value : undefined;
    }

    /** Verbatim source of the value at `path`. */
    source(path) {
        const { start, end } = this.locate(path);
        return this.text.slice(start, end);
    }

    // --- edits (all return `this`)

    /** Replaces the value at `path`. No-op when the new value equals the current one. */
    set(path, value) {
        const { start, end } = this.locate(path);
        const current = evaluate(this.text.slice(start, end));
        if (current.ok && !(value instanceof Raw) && deepEqual(current.value, value)) return this;
        const replacement = this.print(value, lineIndent(this.text, start));
        // A trailing comment aligned with spaces keeps its column.
        const rest = /^(,?)( {2,})(?=\/[/*])/.exec(this.text.slice(end));
        if (rest && !replacement.includes('\n')) {
            const gap = alignedGap(rest[2], replacement.length - (end - start));
            this.splice(end + rest[1].length, end + rest[0].length, gap);
        }
        this.splice(start, end, replacement);
        return this;
    }

    /** `set`, or `insert` at the end of the parent when the property doesn't exist yet. */
    assign(path, value, options = {}) {
        const segments = parsePath(path);
        if (this.has(segments)) return this.set(segments, value);
        return this.insert(segments.slice(0, -1), segments.at(-1), value, options);
    }

    /**
     * Adds `key: value` to the object at `path` (or an item to an array, `key` = null).
     * Options: `after` / `before` (an existing key or index), `comments: { leading: [], trailing, blankBefore }`.
     */
    insert(path, key, value, { after, before, comments = {} } = {}) {
        const block = this.block(path);
        if (key !== null && block.kind === 'object' && block.entries.some((e) => e.key === key)) {
            return this.set([...parsePath(path), key], value);
        }
        const entries = [...block.entries];
        const indent = block.indent ?? block.closeIndent + this.unit;
        const text = (key === null ? '' : `${printKey(String(key), this.quote)}: `) + this.print(value, indent);
        const entry = { leading: comments.leading ?? [], blankBefore: comments.blankBefore ?? false, text, trailing: comments.trailing ?? null, trailingGap: comments.trailingGap ?? ' ' };
        let index = entries.length;
        if (after !== undefined) index = this.indexOfEntry(block, after, path) + 1;
        if (before !== undefined) index = this.indexOfEntry(block, before, path);
        entries.splice(index, 0, entry);
        return this.replaceBlock(block, entries);
    }

    /** Removes the property (or array item) at `path` together with its comments. */
    remove(path) {
        const segments = parsePath(path);
        const block = this.block(segments.slice(0, -1));
        const index = this.indexOfEntry(block, segments.at(-1), segments.slice(0, -1));
        const entries = block.entries.filter((_, i) => i !== index);
        return this.replaceBlock(block, entries);
    }

    /**
     * Replaces the entries of the object at `path` with `values` (an object; key order = new order).
     * Keys that exist keep their comments and blank line; an unchanged value keeps its exact text.
     * `comments[key]` = { leading: [], trailing, blankBefore } is used for keys that are new.
     */
    rewriteObject(path, values, { comments = {} } = {}) {
        const block = this.block(path);
        if (block.kind !== 'object') throw new Error(`${this.where()}: ${formatPath(parsePath(path))} is not an object`);
        const indent = block.indent ?? block.closeIndent + this.unit;
        const entries = Object.entries(values).filter(([, v]) => v !== undefined).map(([key, value]) => {
            const existing = block.entries.find((e) => e.key === key);
            if (existing) {
                const current = evaluate(this.text.slice(existing.valueStart, existing.valueEnd));
                const unchanged = current.ok && !(value instanceof Raw) && deepEqual(current.value, value);
                const text = unchanged ? existing.text : `${existing.keyText}: ${this.print(value, indent)}`;
                const trailingGap = unchanged ? existing.trailingGap : alignedGap(existing.trailingGap, text.length - existing.text.length);
                return { ...existing, text, trailingGap };
            }
            const c = comments[key] ?? {};
            return { leading: c.leading ?? [], blankBefore: c.blankBefore ?? false, text: `${printKey(key, this.quote)}: ${this.print(value, indent)}`, trailing: c.trailing ?? null, trailingGap: c.trailingGap ?? ' ' };
        });
        return this.replaceBlock(block, entries);
    }

    /**
     * Replaces the items of the array at `path` with `items`. An item equal to an existing one keeps
     * that item's text and comments (so reordering keeps them too); other items are printed fresh.
     */
    rewriteArray(path, items) {
        const block = this.block(path);
        if (block.kind !== 'array') throw new Error(`${this.where()}: ${formatPath(parsePath(path))} is not an array`);
        const indent = block.indent ?? block.closeIndent + this.unit;
        const unused = block.entries.map((entry) => ({ entry, value: evaluate(this.text.slice(entry.valueStart, entry.valueEnd)) }));
        const entries = items.map((item) => {
            const i = item instanceof Raw
                ? unused.findIndex(({ entry }) => entry.text === item.text)
                : unused.findIndex(({ value }) => value.ok && deepEqual(value.value, item));
            if (i !== -1) return unused.splice(i, 1)[0].entry;
            return { leading: [], blankBefore: false, text: this.print(item, indent), trailing: null, trailingGap: ' ' };
        });
        return this.replaceBlock(block, entries);
    }

    /** Reorders the entries of the block at `path`; `order` lists every current index once, in the new order. */
    reorder(path, order) {
        const block = this.block(path);
        const valid = order.length === block.entries.length && [...order].sort((a, b) => a - b).every((v, i) => v === i);
        if (!valid) throw new Error(`${this.where()}: reorder of ${formatPath(parsePath(path))} needs each index 0–${block.entries.length - 1} exactly once`);
        return this.replaceBlock(block, order.map((i) => block.entries[i]));
    }

    /** Replaces the text between `start` and `end`. For edits the helpers above don't cover. */
    splice(start, end, replacement) {
        this.text = this.text.slice(0, start) + replacement + this.text.slice(end);
        return this;
    }

    // --- internals

    print(value, indent) {
        return printValue(value, { quote: this.quote, indent, unit: this.unit });
    }

    block(path) {
        const { start } = this.locate(path);
        if (!(this.text[start] === '{' || this.text[start] === '[')) throw new Error(`${this.where()}: ${formatPath(parsePath(path))} is not an object or array`);
        return parseBlock(this.text, start);
    }

    replaceBlock(block, entries) {
        return this.splice(block.open, block.close + 1, printBlock(block, entries, { unit: this.unit }));
    }

    indexOfEntry(block, keyOrIndex, parentPath) {
        const index = block.kind === 'array' || typeof keyOrIndex === 'number'
            ? Number(keyOrIndex)
            : block.entries.findIndex((e) => e.key === keyOrIndex);
        if (!(index >= 0 && index < block.entries.length)) {
            throw new Error(`${this.where()}: ${formatPath(parsePath(parentPath))} has no ${typeof keyOrIndex === 'number' ? `item ${keyOrIndex}` : `property "${keyOrIndex}"`}`);
        }
        return index;
    }

    entryAt(range, keyOrIndex, parentPath) {
        if (!(this.text[range.start] in OPEN) || this.text[range.start] === '(') {
            throw new Error(`${this.where()}: ${formatPath(parentPath)} is not an object or array`);
        }
        const block = parseBlock(this.text, range.start);
        return block.entries[this.indexOfEntry(block, keyOrIndex, parentPath)];
    }

    where() { return this.path ?? 'source'; }
}

// The quote character most strings in the file use.
export function detectQuote(text) {
    let single = 0;
    let double = 0;
    for (let i = 0; i < text.length;) {
        const next = skipNonCode(text, i);
        if (next !== i) {
            if (text[i] === "'") single++;
            else if (text[i] === '"') double++;
            i = next;
            continue;
        }
        i++;
    }
    return double > single ? '"' : "'";
}

// The smallest indentation step used in the file's code (4 spaces in the template). Comment lines
// don't count: the ` * ` continuation lines of a doc comment are indented by one space.
export function detectIndentUnit(text) {
    let min = Infinity;
    for (const m of text.matchAll(/^( +)([^\s*/])/gm)) min = Math.min(min, m[1].length);
    if (/^\t/m.test(text)) return '\t';
    return min === Infinity ? '    ' : ' '.repeat(min);
}
