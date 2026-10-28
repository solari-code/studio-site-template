"use client";

import Logo from './Logo';
import Image from 'next/image';
import AnimatedCTAButton from './ui/AnimatedButton';
import { motion } from "framer-motion"
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const Hero = () => {
    const t = useTranslations('Hero');

    const videoRef = useRef(null);
    const [isPosterVisible, setIsPosterVisible] = useState(true);

    const isMobile = useMediaQuery('(max-width: 768px)');

    const videoSrc = isMobile
        ? "/images/hero/hero_mobile_2.mp4"
        : "/images/hero/hero_loop_silent_2.mp4";

    const posterSrc = isMobile
        ? "/images/hero/hero_poster_mobile_2.jpg"
        : "/images/hero/hero_poster.jpg";

    useEffect(() => {
        const video = videoRef.current;
        setIsPosterVisible(true);

        if (!video) return

        video.play()
            .then(() => {
                setIsPosterVisible(false)
            })
            .catch(error => {
                console.warn("Autoplay was blocked", error);
            });

    }, [videoSrc]);

    const heroText = t('title');
    // Array.from splits by code point, so characters outside the basic plane stay intact
    const heroChars = Array.from(heroText);

    return (
        <section id="hero" className="relative h-screen w-full">
            <div className="hero-background w-full h-full absolute">
                <video
                    key={videoSrc}
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    preload='auto'
                    playsInline
                    poster={posterSrc}
                    className={`absolute inset-0 w-full h-full object-cover pointer-events-none `}
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
                {isPosterVisible && (
                    <Image
                        alt={t('backgroundAlt')}
                        layout="fill"
                        objectFit="cover"
                        priority
                        src={posterSrc}
                    />
                )}

            </div>
            <div className="hero-overlay absolute inset-0 z-10"></div>
            <div className="relative h-full w-full flex flex-col items-center justify-center text-center z-20 px-6">

                <motion.div className="inline-block"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.5, duration: 1,
                        type: "spring",
                        stiffness: 50,
                        damping: 7,
                    }}>
                    <Logo className="hero-logo-animated h-28 md:h-40 w-auto text-white mb-8" style={{ animationDelay: '0.2s' }} />
                </motion.div>

                <h1 className={` hero-title text-3xl md:text-5xl text-white leading-tight`}>
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
                    <a href="#intro"><AnimatedCTAButton className='font-medium'>{t('cta')}</AnimatedCTAButton></a>
                </motion.div>

            </div>
        </section>
    );
};

export default Hero;