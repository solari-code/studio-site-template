// Icon registry: the names that can be used in config/pages.js (e.g. `icon: 'rocket'`).
//
// Two kinds of entries:
// - custom inline SVGs defined here via `svgIcon(path)` (24x24 viewBox, stroked with currentColor),
// - icons from lucide-react (https://lucide.dev): import them above and register them below.
//   Lucide icons are imported one by one so only the registered ones end up in the bundle.
import {
    Rocket,
    Target,
    Zap,
    User,
    Sparkles,
    Lightbulb,
    CreditCard,
    RefreshCw,
    ClipboardList,
    ExternalLink,
} from 'lucide-react';

// Custom icon from one or more SVG path definitions. Accepts `className`, `size` and `strokeWidth`
// like a lucide icon, so the two kinds are interchangeable in config.
const svgIcon = (...paths) => {
    const Icon = ({ className, size, strokeWidth = 1.5 }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {paths.map((d) => (
                <path key={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d={d} />
            ))}
        </svg>
    );
    return Icon;
};

// Filled icon (brand marks): one or more SVG paths filled with currentColor.
const filledIcon = (...paths) => {
    const Icon = ({ className, size }) => (
        <svg className={className} width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
            {paths.map((d) => <path key={d} d={d} />)}
        </svg>
    );
    return Icon;
};

export const icons = {
    // Brand marks (footer social links, project links)
    linkedin: filledIcon('M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'),
    github: filledIcon('M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'),
    instagram: filledIcon('M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.012-3.584.07-4.85c.148-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44c0-.795-.645-1.44-1.441-1.44z'),
    npm: filledIcon('M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z'),

    // Custom SVGs (used by the services section)
    code: svgIcon('M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'),
    devices: svgIcon('M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'),
    bolt: svgIcon('M13 10V3L4 14h7v7l9-11h-7z'),
    pencil: svgIcon('M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z'),

    // lucide-react
    rocket: Rocket,
    target: Target,
    zap: Zap,
    user: User,
    sparkles: Sparkles,
    lightbulb: Lightbulb,
    'credit-card': CreditCard,
    'refresh-cw': RefreshCw,
    'clipboard-list': ClipboardList,
    'external-link': ExternalLink, // lab project links (demo, website)
};

export function getIcon(name) {
    const icon = icons[name];
    if (!icon) {
        throw new Error(`Unknown icon "${name}". Register it in config/icons.js (available: ${Object.keys(icons).join(', ')}).`);
    }
    return icon;
}
