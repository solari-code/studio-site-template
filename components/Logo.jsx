import { siteConfig } from '@/config/site';

// Placeholder mark (ring + dot). Swap the SVG for your own logo.
const Logo = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" role="img" aria-label={`${siteConfig.name} logo`}>
        <path fillRule="evenodd" d="M50 4a46 46 0 1 1 0 92a46 46 0 1 1 0-92Zm0 12a34 34 0 1 0 0 68a34 34 0 1 0 0-68Z" />
        <circle cx="50" cy="50" r="13" />
    </svg>
);

export default Logo;
