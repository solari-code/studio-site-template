import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, FlaskConical } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getIcon } from '@/config/icons';
import { hasProjectPage, labProjectPath, projectLinks } from '@/config/lab';

/**
 * One lab project as a card (config/lab.js), used on /lab and in the homepage's lab section.
 * Texts come from `Lab.projects.<id>` (title, description, tags), link texts from `Lab.links.<type>`.
 *
 * A project with a page of its own (`detail`) is clickable as a whole: the title link is stretched
 * over the card, and the external links sit above it, so no link is nested in another. A project
 * without a page is the same card without the link. Without an `image`, a neutral cover keeps the
 * cards of a row aligned.
 *
 * `headingLevel` is the card title's element: 'h2' on /lab (below the page's h1), 'h3' in a section.
 */
export default function LabCard({ project, headingLevel: Heading = 'h3' }) {
    const t = useTranslations('Lab');
    const title = t(`projects.${project.id}.title`);
    const tags = t.raw(`projects.${project.id}.tags`) ?? [];
    const links = projectLinks(project);
    const hasPage = hasProjectPage(project);

    return (
        <article className={`group relative h-full flex flex-col overflow-hidden rounded-2xl border border-contrast/10 bg-contrast/[0.03] transition-all duration-300 ${hasPage ? 'md:hover:bg-contrast/[0.06] md:hover:border-contrast/20 md:hover:-translate-y-1' : ''}`}>
            <div className="relative aspect-[16/10] overflow-hidden border-b border-contrast/10">
                {project.image ? (
                    <Image
                        src={project.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className={`object-cover transition-transform duration-500 ${hasPage ? 'md:group-hover:scale-[1.03]' : ''}`}
                    />
                ) : (
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundImage: 'radial-gradient(rgb(var(--color-contrast) / 0.12) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
                    >
                        <span className="p-4 rounded-2xl bg-background border border-contrast/10 text-accent">
                            <FlaskConical className="h-8 w-8" strokeWidth={1.5} />
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-6 lg:p-8">
                <Heading className="text-xl font-bold text-contrast mb-2">
                    {hasPage ? (
                        <Link
                            href={labProjectPath(project)}
                            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-accent/60"
                        >
                            {title}
                        </Link>
                    ) : title}
                </Heading>
                <p className="text-muted mb-6">{t(`projects.${project.id}.description`)}</p>

                {tags.length > 0 && (
                    <ul className="flex flex-wrap gap-2 mb-6">
                        {tags.map((tag) => (
                            <li key={tag} className="bg-accent/10 text-accent text-sm font-medium px-3 py-1 rounded-full">{tag}</li>
                        ))}
                    </ul>
                )}

                {(links.length > 0 || hasPage) && (
                    <div className="mt-auto pt-5 border-t border-contrast/10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                        {links.length > 0 && (
                            <ul className="relative z-10 flex flex-wrap gap-x-5 gap-y-2">
                                {links.map(({ type, url, icon }) => {
                                    const Icon = getIcon(icon);
                                    return (
                                        <li key={type}>
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted hover:text-contrast transition-colors">
                                                <Icon className="w-4 h-4" />
                                                <span><span className="sr-only">{title}: </span>{t(`links.${type}`)}</span>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        {/* Visual cue only: the stretched title link is what screen readers and keyboards use. */}
                        {hasPage && (
                            <span aria-hidden="true" className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                                {t('viewProject')}
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 md:group-hover:translate-x-1" />
                            </span>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
