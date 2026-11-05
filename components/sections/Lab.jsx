import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import AnimatedCTAButton from '@/components/ui/AnimatedButton';
import LabCard from '@/components/lab/LabCard';
import { pages, isEnabled } from '@/config/pages';
import { featuredLabProjects } from '@/config/lab';

// Homepage teaser for the lab: title, text, the featured projects from config/lab.js (at most `limit`)
// and a button to /lab. Texts from `Lab` (title, text, cta); the cards' texts from `Lab.projects.<id>`.
// Phones show only the first card, tablets the first two, desktops all of them (up to `limit`).
// Renders nothing while the lab page is switched off, so it never links to a missing page.
const Lab = ({ id = 'lab', namespace = 'Lab', limit = 3 }) => {
    const t = useTranslations(namespace);
    if (!isEnabled(pages.lab)) return null;
    const projects = featuredLabProjects().slice(0, limit);

    return (
        <section id={id} className="py-20 lg:py-28 bg-background scroll-mt-16">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 fade-in">
                    <h2 className="text-3xl lg:text-4xl font-bold text-contrast">
                        {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-highlight text-transparent bg-clip-text">{chunks}</span> })}
                    </h2>
                    <p className="text-lg text-muted mt-2 max-w-2xl mx-auto">{t('text')}</p>
                </div>

                {projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <div key={project.id} className={`fade-in ${visibility(index)}`}>
                                <LabCard project={project} headingLevel="h3" />
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center fade-in">
                    <Link href={pages.lab.path} className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50">
                        <AnimatedCTAButton className="font-medium">{t('cta')}</AnimatedCTAButton>
                    </Link>
                </div>
            </div>
        </section>
    );
};

// Which cards show per screen size: the first always, the second from md (tablets), the rest from lg.
const visibility = (index) => (index === 0 ? '' : index === 1 ? 'hidden md:block' : 'hidden lg:block');

export default Lab;
