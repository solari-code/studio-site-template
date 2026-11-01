// The logo mark, used in the header, hero, footer, legal pages and 404 page.
// Replace the SVG below with your own logo. Keep `className`, `style` and `label`:
// the size comes from `className`, the colour from `currentColor`, and `label` is the
// accessible name ("<site name> logo", translated).
//
// For a bitmap logo, return <img src="/images/logo.png" alt={label} className={className} style={style} /> instead.
export default function LogoMark({ className, style, label }) {
    return (
        <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" role="img" aria-label={label}>
            <path fillRule="evenodd" d="M50 4a46 46 0 1 1 0 92a46 46 0 1 1 0-92Zm0 12a34 34 0 1 0 0 68a34 34 0 1 0 0-68Z" />
            <circle cx="50" cy="50" r="13" />
        </svg>
    );
}
