import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import BackLink from '@/components/lab/BackLink';
import Markdown from '@/components/lab/Markdown';
import ProjectLinkButtons from '@/components/lab/ProjectLinkButtons';
import { radialGlow } from '@/components/ui/glow';

/**
 * The templated page of a lab project (`detail: 'markdown'` in config/lab.js), /lab/<id>.
 * Title, description and tags come from the card's texts (`Lab.projects.<id>`), the links and the
 * optional image from config/lab.js, the body from content/lab/<id>/<language>.md.
 *
 * `content` is `{ markdown, locale }` (see components/lab/content.js). When the text had to fall back to
 * the default language, a short note says so and the text is marked with its language (`lang`).
 */
export default function ProjectDetail({ project, content }) {
    const t = useTranslations('Lab');
    const locale = useLocale();
    const title = t(`projects.${project.id}.title`);
    const tags = t.raw(`projects.${project.id}.tags`) ?? [];
    const isFallback = content.locale !== locale;

    return (
        <article className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
            {/* Background glow, as on /lab */}
            <div className="md:hidden absolute top-[calc(-10%-200px)] left-1/2 -translate-x-1/2 w-[1300px] h-[900px] pointer-events-none" style={{ background: radialGlow('accent', [0.08, 0.075, 0.062, 0.046, 0.03, 0.017, 0.008, 0.004, 0.002], { shape: 'ellipse at center' }) }} />
            <div className="hidden md:block absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative container mx-auto px-6">
                <header className="max-w-3xl mx-auto">
                    <BackLink />
                    <h1 className="mt-10 text-4xl md:text-5xl font-bold text-contrast leading-tight">{title}</h1>
                    <p className="mt-6 text-lg md:text-xl text-muted leading-relaxed">{t(`projects.${project.id}.description`)}</p>

                    {tags.length > 0 && (
                        <ul className="mt-8 flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <li key={tag} className="bg-accent/10 text-accent text-sm font-medium px-3 py-1 rounded-full">{tag}</li>
                            ))}
                        </ul>
                    )}

                    <ProjectLinkButtons project={project} className="mt-8" />
                </header>

                {project.image && (
                    <div className="relative max-w-3xl mx-auto mt-14 aspect-[16/10] overflow-hidden rounded-2xl border border-contrast/10">
                        <Image src={project.image} alt="" fill priority sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
                    </div>
                )}

                <div className="max-w-3xl mx-auto mt-14">
                    {isFallback && (
                        <p className="mb-10 rounded-xl border border-contrast/10 bg-contrast/[0.03] px-5 py-4 text-sm text-muted">
                            {t('Detail.untranslated', { language: languageName(content.locale, locale) })}
                        </p>
                    )}
                    <div lang={isFallback ? content.locale : undefined}>
                        <Markdown>{content.markdown}</Markdown>
                    </div>

                    <div className="mt-16 pt-8 border-t border-contrast/10">
                        <BackLink />
                    </div>
                </div>
            </div>
        </article>
    );
}

// Name of a language in the visitor's language, e.g. ('en', 'de') -> "Englisch".
function languageName(code, inLocale) {
    try {
        return new Intl.DisplayNames([inLocale], { type: 'language' }).of(code) ?? code;
    } catch {
        return code;
    }
}
