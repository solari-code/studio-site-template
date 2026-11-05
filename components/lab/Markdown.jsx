import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Link } from '@/i18n/navigation';

/**
 * Renders the markdown of a lab project page on the server; no JavaScript reaches the browser.
 *
 * - GitHub-flavoured markdown: tables, task lists, strikethrough, autolinks (remark-gfm).
 * - Code blocks with a language (```js) are highlighted while the page is built (rehype-highlight);
 *   the token colours come from the theme (see "Code highlighting" in app/globals.css), so they
 *   follow the palette and the colour mode.
 * - Raw HTML in the markdown is ignored, so a content file can't inject markup or scripts.
 * - The page title is the page's only h1: a `#` heading in the markdown is shown as an h2.
 * - Links starting with / get the language prefix (/lab/x -> /de/lab/x); external links open in a new tab.
 */
export default function Markdown({ children }) {
    return (
        <div className="text-foreground/90 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components} skipHtml>
                {children}
            </ReactMarkdown>
        </div>
    );
}

// Element -> styled element. `node` (the syntax tree node) is passed by react-markdown and dropped here.
const components = {
    h1: ({ node, ...props }) => <h2 className="text-2xl md:text-3xl font-bold text-contrast mt-14 mb-5 first:mt-0" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-2xl md:text-3xl font-bold text-contrast mt-14 mb-5 first:mt-0" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-xl font-semibold text-contrast mt-10 mb-4 first:mt-0" {...props} />,
    h4: ({ node, ...props }) => <h4 className="text-lg font-semibold text-contrast mt-8 mb-3 first:mt-0" {...props} />,
    p: ({ node, ...props }) => <p className="my-5 first:mt-0" {...props} />,
    a: ({ node, href = '', ...props }) => {
        const className = 'text-secondary underline decoration-secondary/40 underline-offset-4 hover:decoration-secondary transition-colors';
        if (href.startsWith('/')) return <Link href={href} className={className} {...props} />;
        if (/^https?:\/\//.test(href)) return <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props} />;
        return <a href={href} className={className} {...props} />;
    },
    strong: ({ node, ...props }) => <strong className="font-semibold text-contrast" {...props} />,
    ul: ({ node, className, ...props }) => (
        // Task lists (- [ ] / - [x]) get no bullets, their checkboxes mark the items.
        <ul className={`my-5 space-y-2 ${className?.includes('contains-task-list') ? 'list-none' : 'pl-6 list-disc marker:text-accent'}`} {...props} />
    ),
    ol: ({ node, ...props }) => <ol className="my-5 space-y-2 pl-6 list-decimal marker:text-muted" {...props} />,
    // A task list item keeps its text inline (inline code, links) with the checkbox in a hanging indent.
    li: ({ node, className, ...props }) => <li className={className?.includes('task-list-item') ? 'relative pl-7' : 'pl-1'} {...props} />,
    input: ({ node, ...props }) => <input {...props} className="absolute left-0 top-1.5 h-4 w-4 accent-accent" />,
    blockquote: ({ node, ...props }) => <blockquote className="my-6 border-l-4 border-secondary pl-5 text-muted italic" {...props} />,
    hr: ({ node, ...props }) => <hr className="my-12 border-contrast/10" {...props} />,
    // Inline code; inside a code block, the <pre> below resets these styles.
    code: ({ node, className = '', ...props }) => <code className={`${className} rounded-md bg-contrast/[0.07] px-1.5 py-0.5 font-mono text-[0.9em] text-contrast`} {...props} />,
    pre: ({ node, ...props }) => (
        <pre
            className="my-6 overflow-x-auto rounded-xl border border-contrast/10 bg-surface p-5 text-sm leading-relaxed [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[1em] [&>code]:text-foreground"
            {...props}
        />
    ),
    // On phones a table keeps a readable minimum width and scrolls sideways.
    table: ({ node, ...props }) => (
        <div className="my-6 overflow-x-auto rounded-xl border border-contrast/10">
            <table className="w-full min-w-[32rem] text-left text-sm" {...props} />
        </div>
    ),
    thead: ({ node, ...props }) => <thead className="bg-contrast/[0.04] text-contrast" {...props} />,
    th: ({ node, ...props }) => <th className="px-4 py-3 font-semibold" {...props} />,
    // Code in a cell (option names, values) doesn't wrap at its hyphens; a wide table scrolls instead.
    td: ({ node, ...props }) => <td className="border-t border-contrast/10 px-4 py-3 align-top [&_code]:whitespace-nowrap" {...props} />,
    // Markdown images have no known size, so next/image can't be used; they load lazily.
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    img: ({ node, ...props }) => <img loading="lazy" className="my-8 w-full rounded-xl border border-contrast/10" {...props} />,
};

/**
 * One highlighted code block outside of markdown, e.g. a usage example on a landing page:
 *   <CodeBlock language="jsx">{code}</CodeBlock>
 * Same rendering as a fenced block in a markdown file (server-side highlighting, theme colours).
 */
export function CodeBlock({ language = '', children }) {
    const code = String(children).replace(/\n$/, '');
    // The fence is longer than any run of backticks in the code, so the code can't close it early.
    const fence = '`'.repeat(Math.max(3, ...[...code.matchAll(/`+/g)].map((m) => m[0].length + 1)));
    return <Markdown>{`${fence}${language}\n${code}\n${fence}`}</Markdown>;
}
