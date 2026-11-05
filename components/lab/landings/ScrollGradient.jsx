import { useTranslations } from 'next-intl';
import { Palette, Feather, Type } from 'lucide-react';
import BackLink from '@/components/lab/BackLink';
import ProjectLinkButtons from '@/components/lab/ProjectLinkButtons';
import { CodeBlock } from '@/components/lab/Markdown';
import ScrollAwareGradient from '@/components/ui/GradientText';
import AnimatedCTAButton from '@/components/ui/AnimatedButton';
import { radialGlow } from '@/components/ui/glow';

/**
 * Example landing page of a lab project (`detail: 'landing'` in config/lab.js): /lab/scroll-gradient.
 * A landing page is a free-form component registered in ./index.jsx; it gets its `project` entry
 * (links, image) and renders inside the site's header and footer. Title and description for search
 * engines come from the card's texts (`Lab.projects.<id>`), everything on the page from its own
 * namespace, here `LabLandings.scroll-gradient`.
 *
 * The live demo uses the site's own ScrollAwareGradient (components/ui/GradientText.jsx) with the
 * theme's gradients; code examples are highlighted while the page is built (CodeBlock).
 */

const highlight = (chunks) => <span className="bg-gradient-highlight text-transparent bg-clip-text">{chunks}</span>;

const features = [
    { id: 'themeAware', Icon: Palette },
    { id: 'tiny', Icon: Feather },
    { id: 'plainText', Icon: Type },
];

// Props of the (example) package; names and defaults are code, the descriptions are translated.
const props = [
    { name: 'from', type: 'string[]', default: null },
    { name: 'to', type: 'string[]', default: null },
    { name: 'start', type: 'number', default: '0.8' },
    { name: 'end', type: 'number', default: '0.5' },
    { name: 'as', type: 'string', default: "'span'" },
];

const usage = `import { ScrollGradient } from 'scroll-gradient';

export function Heading() {
    return (
        <h2>
            Ideas,{' '}
            <ScrollGradient from={['#d946ef', '#ec4899']} to={['#3081f7', '#22d3ee']}>
                built to last
            </ScrollGradient>
        </h2>
    );
}`;

export default function ScrollGradientLanding({ project }) {
    const t = useTranslations('LabLandings.scroll-gradient');

    return (
        <>
            {/* Hero */}
            <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
                <div className="md:hidden absolute top-[calc(-10%-200px)] left-1/2 -translate-x-1/2 w-[1300px] h-[900px] pointer-events-none" style={{ background: radialGlow('secondary', [0.08, 0.075, 0.062, 0.046, 0.03, 0.017, 0.008, 0.004, 0.002], { shape: 'ellipse at center' }) }} />
                <div className="hidden md:block absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <BackLink />
                    </div>
                    <div className="max-w-4xl mx-auto mt-12 text-center">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-contrast/5 border border-contrast/10 text-accent text-xs font-bold mb-8 uppercase tracking-widest">
                            {t('badge')}
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-contrast leading-tight">{t.rich('title', { highlight })}</h1>
                        <p className="mt-8 text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">{t('subtitle')}</p>

                        <div className="mt-10 inline-flex items-center gap-3 rounded-xl border border-contrast/10 bg-surface px-5 py-3 font-mono text-sm text-contrast">
                            <span className="text-muted select-none" aria-hidden="true">$</span>
                            <code>npm install scroll-gradient</code>
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a href="#demo" className="rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50">
                                <AnimatedCTAButton className="font-medium">{t('demoCta')}</AnimatedCTAButton>
                            </a>
                            <ProjectLinkButtons project={project} className="justify-center" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Live demo: every line blends while it scrolls towards the middle of the viewport */}
            <section id="demo" className="py-20 lg:py-28 bg-surface scroll-mt-16">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-contrast">{t('demo.title')}</h2>
                    <p className="text-lg text-muted mt-4 max-w-2xl mx-auto">{t('demo.text')}</p>
                    <div className="mt-20 lg:mt-28 space-y-24 lg:space-y-32">
                        {t.raw('demo.lines').map((line) => (
                            <p key={line} className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                <ScrollAwareGradient>{line}</ScrollAwareGradient>
                            </p>
                        ))}
                    </div>
                    <p className="mt-20 lg:mt-28 text-sm text-muted max-w-xl mx-auto">{t('demo.caption')}</p>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 lg:py-28">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl lg:text-4xl font-bold text-contrast text-center mb-16">{t('features.title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map(({ id, Icon }) => (
                            <div key={id} className="fade-in bg-contrast/[0.03] p-8 rounded-2xl border border-contrast/10">
                                <div className="p-3 bg-contrast/5 rounded-xl text-accent w-fit mb-6"><Icon className="h-7 w-7" strokeWidth={1.5} /></div>
                                <h3 className="text-xl font-bold text-contrast mb-2">{t(`features.items.${id}.title`)}</h3>
                                <p className="text-muted">{t(`features.items.${id}.text`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Usage and props */}
            <section className="py-20 lg:py-28 bg-surface">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl lg:text-4xl font-bold text-contrast">{t('usage.title')}</h2>
                        <p className="text-lg text-muted mt-4 mb-8">{t('usage.text')}</p>
                        {/* On this surface-coloured section, the code block takes the page background (like the table below). */}
                        <div className="[&_pre]:bg-background">
                            <CodeBlock language="jsx">{usage}</CodeBlock>
                        </div>

                        <h2 className="text-3xl lg:text-4xl font-bold text-contrast mt-20 mb-8">{t('props.title')}</h2>
                        <div className="overflow-x-auto rounded-xl border border-contrast/10 bg-background">
                            <table className="w-full min-w-[36rem] text-left text-sm">
                                <thead className="bg-contrast/[0.04] text-contrast">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">{t('props.columns.prop')}</th>
                                        <th className="px-4 py-3 font-semibold">{t('props.columns.default')}</th>
                                        <th className="px-4 py-3 font-semibold">{t('props.columns.description')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.map((prop) => (
                                        <tr key={prop.name}>
                                            <td className="border-t border-contrast/10 px-4 py-3 align-top whitespace-nowrap">
                                                <code className="font-mono text-contrast">{prop.name}</code>
                                                <span className="ml-2 font-mono text-xs text-muted">{prop.type}</span>
                                            </td>
                                            <td className="border-t border-contrast/10 px-4 py-3 align-top whitespace-nowrap">
                                                {prop.default ? <code className="font-mono text-muted">{prop.default}</code> : <span className="text-xs font-bold uppercase tracking-widest text-accent">{t('props.required')}</span>}
                                            </td>
                                            <td className="border-t border-contrast/10 px-4 py-3 align-top text-foreground/90">{t(`props.items.${prop.name}`)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing call to action */}
            <section className="py-20 lg:py-28">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-contrast">{t('cta.title')}</h2>
                    <p className="text-lg text-muted mt-4 max-w-xl mx-auto">{t('cta.text')}</p>
                    <ProjectLinkButtons project={project} className="mt-8 justify-center" />
                    <BackLink className="mt-12" />
                </div>
            </section>
        </>
    );
}
