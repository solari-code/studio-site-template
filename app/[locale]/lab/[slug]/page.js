import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import SiteShell from '@/components/SiteShell';
import ProjectDetail from '@/components/lab/ProjectDetail';
import { landingComponents } from '@/components/lab/landings';
import { loadProjectContent } from '@/components/lab/content';
import { labProjectsWithPage, labProjectPath } from '@/config/lab';
import { pageMetadata } from '@/i18n/metadata';

// The page of a lab project, /lab/<id> (config/lab.js): its own landing page (`detail: 'landing'`,
// components/lab/landings/) or the project page template filled from markdown (`detail: 'markdown'`).
// Every page is prerendered per language; any other id (unknown, switched off, card only) is a 404.
export const dynamicParams = false;

const findProject = (slug) => labProjectsWithPage().find((project) => project.id === slug);

export function generateStaticParams() {
    return labProjectsWithPage().map((project) => ({ slug: project.id }));
}

// Title and description are the card's texts (`Lab.projects.<id>`); the link preview shows the project's image if it has one.
export async function generateMetadata({ params }) {
    const { locale, slug } = await params;
    const project = findProject(slug);
    if (!project) return {};
    return pageMetadata(locale, { path: labProjectPath(project), metadata: `Lab.projects.${project.id}`, previewImage: project.image });
}

export default async function LabProjectPage({ params }) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const project = findProject(slug);
    if (!project) notFound();

    if (project.detail === 'landing') {
        const Landing = landingComponents[project.id];
        if (!Landing) {
            throw new Error(`Lab project "${project.id}" has detail: 'landing' in config/lab.js, but no landing page is registered under that id in components/lab/landings/index.jsx.`);
        }
        return (
            <SiteShell>
                <Landing project={project} />
            </SiteShell>
        );
    }

    const content = await loadProjectContent(project.id, locale);
    return (
        <SiteShell>
            <ProjectDetail project={project} content={content} />
        </SiteShell>
    );
}
