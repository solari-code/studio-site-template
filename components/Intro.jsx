import { siteConfig } from '@/config/site';

const Intro = () => (
    <section id="intro" className="py-20 lg:py-24 bg-brand-dark scroll-mt-16">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight max-w-4xl mx-auto fade-in">
                Hello. This is <span className="bg-gradient-to-r from-brand-magenta  to-brand-blue text-transparent bg-clip-text">{siteConfig.name}</span>.
                <br />
                An independent studio for web design & development.
            </h2>
            <p className="text-2xl text-brand-gray mt-4 fade-in">
                I help small businesses look good and work well online.
                <br />
                From a first landing page to a full web app.
            </p>
        </div>
    </section>
);

export default Intro;