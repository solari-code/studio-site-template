"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { wrap } from 'popmotion';
import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';

// Images and links per project. Title, description, tags and the optional
// quote/client live in messages under `Work.projects.<id>`.
const workData = [
    { id: "widgets", image: "/images/work/project-1.png", githubUrl: "https://github.com/" },
    { id: "ceramics", image: "/images/work/project-2.png", liveUrl: "https://example.com/" },
    { id: "roastery", image: "/images/work/project-3.png" },
    { id: "yoga", image: "/images/work/project-4.png", liveUrl: "https://example.com/" },
];

const allImages = workData.map(work => work.image)

const variants = {
    enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 }),
};
const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const Work = () => {
    const t = useTranslations('Work');
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
                <h3 className="text-3xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-brand-gray mb-6">{item.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                    {item.tags.map(tag => <span key={tag} className="bg-cyan-500/10 text-cyan-400 text-sm font-medium px-3 py-1 rounded-full">{tag}</span>)}
                </div>
                {item.quote && (<blockquote className="border-l-4 border-brand-magenta pl-4 italic text-brand-gray">{item.quote}</blockquote>)}
                {item.client && (<p className="text-white font-semibold mt-4">- {item.client}</p>)}
                {item.liveUrl && (
                    <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-gray hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {t('viewLive')}
                    </a>
                )}
                {item.githubUrl && (
                    <div className="mt-4">
                        <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-gray hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            {t('viewGithub')}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <section id="work" className="py-20 lg:py-28 bg-brand-dark scroll-mt-16">

            {/* Preload */}
            <div className='hidden'>
                {workData.map(work => <Image key={work.image} priority={true} src={work.image} alt={t(`projects.${work.id}.title`)} width={800} height={600} />)}
            </div>

            <div className="container mx-auto px-6">
                <div className="text-center mb-16 fade-in">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white">
                        {t.rich('title', { highlight: (chunks) => <span className="bg-gradient-to-r from-brand-magenta to-pink-500 text-transparent bg-clip-text">{chunks}</span> })}
                    </h2>
                    <p className="text-lg text-brand-gray mt-2 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="relative bg-brand-surface rounded-xl border border-white/10 overflow-hidden fade-in">

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
                    <button onClick={() => paginate(-1)} aria-label={t('previous')} className="bg-brand-dark p-2 rounded-full text-white hover:bg-brand-magenta transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex space-x-2">
                        {workData.map((_, index) => (
                            <button key={index} onClick={() => showSlide(index)} aria-label={t('goTo', { number: index + 1 })} className={`w-3 h-3 rounded-full transition-colors ${workIndex === index ? 'bg-brand-light' : 'bg-brand-gray/50 hover:bg-brand-gray'}`}></button>
                        ))}
                    </div>
                    <button onClick={() => paginate(1)} aria-label={t('next')} className="bg-brand-dark p-2 rounded-full text-white hover:bg-brand-magenta transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Work;