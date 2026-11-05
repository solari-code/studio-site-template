import { useTranslations } from 'next-intl';
import { getIcon } from '@/config/icons';
import { projectLinks } from '@/config/lab';

// A project's external links (config/lab.js) as pill buttons, used on the project pages. Texts from `Lab.links.<type>`.
export default function ProjectLinkButtons({ project, className = '' }) {
    const t = useTranslations('Lab.links');
    const links = projectLinks(project);
    if (links.length === 0) return null;

    return (
        <ul className={`flex flex-wrap gap-3 ${className}`}>
            {links.map(({ type, url, icon }) => {
                const Icon = getIcon(icon);
                return (
                    <li key={type}>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-contrast/10 bg-contrast/5 px-4 py-2 text-sm font-medium text-contrast hover:bg-contrast/10 hover:border-contrast/20 transition-colors">
                            <Icon className="w-4 h-4" />
                            {t(type)}
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}
