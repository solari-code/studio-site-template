"use client";

import Logo from '@/components/Logo';
import AnimatedCTAButton from '@/components/ui/AnimatedButton';
import HeroBackground from './HeroBackground';
import { motion } from "framer-motion"
import { useTranslations } from 'next-intl';
import { withAlpha } from '@/config/theme';

/**
 * Options in config/pages.js:
 *   background  video / image / gradient / colour, see HeroBackground.jsx; omit for none
 *   overlay     tint between background and content: { color: 'background', opacity: 0.5 } (default), or false
 *   logo        show the logo above the title (default true)
 *   ctaHref     where the button scrolls to (default '#intro')
 */
const Hero = ({ id = 'hero', namespace = 'Hero', background, overlay = { color: 'background', opacity: 0.5 }, logo = true, ctaHref = '#intro' }) => {
    const t = useTranslations(namespace);

    const heroText = t('title');
    // Array.from splits by code point, so characters outside the basic plane stay intact
    const heroChars = Array.from(heroText);

    return (
        <section id={id} className="relative h-screen w-full">
            <div className="hero-background w-full h-full absolute">
                <HeroBackground background={background} alt={t('backgroundAlt')} />
            </div>
            {overlay && (
                <div className="absolute inset-0 z-10" style={{ backgroundColor: withAlpha(overlay.color ?? 'background', overlay.opacity ?? 0.5) }}></div>
            )}
            <div className="relative h-full w-full flex flex-col items-center justify-center text-center z-20 px-6">

                {logo && (
                <motion.div className="inline-block"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.5, duration: 1,
                        type: "spring",
                        stiffness: 50,
                        damping: 7,
                    }}>
                    <Logo className="hero-logo-animated h-28 md:h-40 w-auto text-contrast mb-8" />
                </motion.div>
                )}

                <h1 className="hero-title whitespace-nowrap text-3xl md:text-5xl text-contrast leading-tight">
                    {heroChars.map((char, index) => (
                        <motion.p
                            key={index}
                            initial={{ y: 0, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                delay: index * 0.02 + 1,
                                type: "spring",
                                stiffness: 150,
                                damping: 25,
                            }}
                            className="inline-block">
                            {char === " " ? "\u00A0" : char}
                        </motion.p>
                    ))}
                </h1>

                <motion.div className="inline-block mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 1.5 + heroChars.length * 0.05,
                        duration: 1,
                        type: "keyframes",
                        stiffness: 150,
                        damping: 25,
                    }}>
                    <a href={ctaHref}><AnimatedCTAButton className='font-medium'>{t('cta')}</AnimatedCTAButton></a>
                </motion.div>

            </div>
        </section>
    );
};

export default Hero;