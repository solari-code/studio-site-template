import { useTranslations } from 'next-intl';
import { FlaskConical } from 'lucide-react';
import LabCard from '@/components/lab/LabCard';
import { radialGlow } from '@/components/ui/glow';
import { enabledLabProjects } from '@/config/lab';

// The /lab page: heading and all lab projects as cards. The projects come from config/lab.js,
// not from the section entry, since the homepage's lab section and the project pages use them too.
// Texts: badge, title and text from `Lab.Overview`; the cards' texts from `Lab.projects.<id>`.
const LabProjects = ({ id = 'lab-projects', namespace = 'Lab.Overview' }) => {
    const t = useTranslations(namespace);
    const projects = enabledLabProjects();

    return (
        <section id={id} className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28 scroll-mt-16">
            {/* Background glow, as on the starter page */}
            <div className="md:hidden absolute top-[calc(-10%-200px)] left-1/2 -translate-x-1/2 w-[1300px] h-[900px] pointer-events-none" style={{ background: radialGlow('accent', [0.08, 0.075, 0.062, 0.046, 0.03, 0.017, 0.008, 0.004, 0.002], { shape: 'ellipse at center' }) }} />
            <div className="hidden md:block absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-contrast/5 border border-contrast/10 text-accent text-xs font-bold mb-8 uppercase tracking-widest">
                        <FlaskConical size={14} />
                        {t('badge')}
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-contrast leading-tight">
                        {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-highlight text-transparent bg-clip-text">{chunks}</span> })}
                    </h1>
                    <p className="text-lg text-muted mt-6">{t('text')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <div key={project.id} className="fade-in">
                            <LabCard project={project} headingLevel="h2" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LabProjects;
