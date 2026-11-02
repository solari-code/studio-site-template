"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { wrap } from 'popmotion';
import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';

import { requireProp } from './requireProp';
import { getIcon } from '@/config/icons';

const GithubIcon = getIcon('github');

const variants = {
    enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 }),
};
const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

// Projects come from config/pages.js: `projects: [{ id, image, liveUrl?, githubUrl? }]`.
// Title, description, tags and the optional quote/client live in messages under `Work.projects.<id>`.
const Work = ({ id = 'work', namespace = 'Work', projects = requireProp('work', 'projects', "[{ id: 'widgets', image: '/images/work/project-1.png' }, ...]") }) => {
    const t = useTranslations(namespace);
    const workData = projects;
    const [[page, direction], setPage] = useState([0, 0]);
    const workIndex = wrap(0, workData.length, page);

    // Merge the static project data with its translated texts
    const currentWork = {
        ...workData[workIndex],
        ...t.raw(`projects.${workData[workIndex].id}`),
    };
    // `{name}` in the quote is the studio name from config
    if (currentWork.quote) currentWork.quote = t(`projects.${currentWork.id}.quote`, { name: siteConfig.name });

    const paginate = (newDirection) => {
        setPage([page + newDirection, newDirection]);
    };

    const showSlide = (index) => {
        const newDirection = index > page ? 1 : -1;
        setPage([index, newDirection]);
    }

    const SlideContent = ({ item }) => (
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            <div className="md:w-1/2">
                <Image priority src={item.image} alt={item.title} width={800} height={600} draggable={false} className="rounded-lg shadow-2xl object-cover" />
            </div>
            <div className="md:w-1/2">
                <h3 className="text-3xl font-bold text-contrast mb-4">{item.title}</h3>
                <p className="text-muted mb-6">{item.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                    {item.tags.map(tag => <span key={tag} className="bg-accent/10 text-accent text-sm font-medium px-3 py-1 rounded-full">{tag}</span>)}
                </div>
                {item.quote && (<blockquote className="border-l-4 border-secondary pl-4 italic text-muted">{item.quote}</blockquote>)}
                {item.client && (<p className="text-contrast font-semibold mt-4">- {item.client}</p>)}
                {item.liveUrl && (
                    <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted hover:text-contrast transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {t('viewLive')}
                    </a>
                )}
                {item.githubUrl && (
                    <div className="mt-4">
                        <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted hover:text-contrast transition-colors">
                            <GithubIcon className="w-5 h-5" />
                            {t('viewGithub')}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <section id={id} className="py-20 lg:py-28 bg-background scroll-mt-16">

            {/* Preload */}
            <div className='hidden'>
                {workData.map(work => <Image key={work.image} priority={true} src={work.image} alt={t(`projects.${work.id}.title`)} width={800} height={600} />)}
            </div>

            <div className="container mx-auto px-6">
                <div className="text-center mb-16 fade-in">
                    <h2 className="text-3xl lg:text-4xl font-bold text-contrast">
                        {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-highlight text-transparent bg-clip-text">{chunks}</span> })}
                    </h2>
                    <p className="text-lg text-muted mt-2 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="relative bg-surface rounded-xl border border-contrast/10 overflow-hidden fade-in">

                    <div className="p-8 md:p-12 opacity-0 pointer-events-none">
                        <SlideContent item={currentWork} />
                    </div>

                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={page}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = swipePower(offset.x, velocity.x);
                                if (swipe < -swipeConfidenceThreshold) { paginate(1); }
                                else if (swipe > swipeConfidenceThreshold) { paginate(-1); }
                            }}
                            className="absolute top-0 left-0 w-full p-8 md:p-12"
                        >
                            <SlideContent item={currentWork} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex justify-center mt-8 space-x-4 items-center">
                    <button onClick={() => paginate(-1)} aria-label={t('previous')} className="bg-background p-2 rounded-full text-contrast hover:bg-secondary hover:text-on-brand transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex space-x-2">
                        {workData.map((_, index) => (
                            <button key={index} onClick={() => showSlide(index)} aria-label={t('goTo', { number: index + 1 })} className={`w-3 h-3 rounded-full transition-colors ${workIndex === index ? 'bg-foreground' : 'bg-muted/50 hover:bg-muted'}`}></button>
                        ))}
                    </div>
                    <button onClick={() => paginate(1)} aria-label={t('next')} className="bg-background p-2 rounded-full text-contrast hover:bg-secondary hover:text-on-brand transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Work;