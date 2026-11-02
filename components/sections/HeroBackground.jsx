"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { colors, colorVar, gradientVar } from '@/config/theme';

/**
 * Background of the hero section, configured in config/pages.js via `background`:
 *
 *   { type: 'video', src, poster, mobile?: { src, poster } }   looping, muted video; the poster shows until it plays
 *   { type: 'image', src, mobile?: { src } }                   full-bleed image
 *   { type: 'gradient', gradient: 'highlight', direction? }    a named gradient from config/theme.js …
 *   { type: 'gradient', css: 'linear-gradient(…)' }            … or any CSS gradient
 *   { type: 'color', color: 'surface' }                        a colour token (or any CSS colour)
 *
 * `mobile` overrides `src`/`poster` below 768px. Omit `background` for no background at all.
 */
export default function HeroBackground({ background, alt }) {
    const isMobile = useMediaQuery('(max-width: 768px)');

    if (!background) return null;

    const media = isMobile && background.mobile ? { ...background, ...background.mobile } : background;

    switch (background.type) {
        case 'video':
            return <VideoBackground src={media.src} poster={media.poster} alt={alt} />;
        case 'image':
            return <Image alt={alt} fill priority src={media.src} className="object-cover" />;
        case 'gradient':
            return <div className="absolute inset-0" style={{ background: background.css ?? gradientVar(background.gradient, background.direction) }} />;
        case 'color':
            return <div className="absolute inset-0" style={{ background: colors[background.color] ? colorVar(background.color) : background.color }} />;
        default:
            throw new Error(`Unknown hero background type "${background.type}" in config/pages.js (use video, image, gradient or color).`);
    }
}

function VideoBackground({ src, poster, alt }) {
    const videoRef = useRef(null);
    const [isPosterVisible, setIsPosterVisible] = useState(true);

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

    }, [src]);

    return (
        <>
            <video
                key={src}
                ref={videoRef}
                autoPlay
                muted
                loop
                preload='auto'
                playsInline
                poster={poster}
                className="hero-video absolute inset-0 w-full h-full object-cover pointer-events-none"
            >
                <source src={src} type="video/mp4" />
            </video>
            {isPosterVisible && poster && (
                <Image
                    alt={alt}
                    fill
                    priority
                    src={poster}
                    className="object-cover"
                />
            )}
        </>
    );
}
