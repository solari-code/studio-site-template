"use client";

import { useState, useEffect, useRef } from 'react';
import { theme, gradientColors, hexToRgb } from '@/config/theme';

// Interpolates between two hex colours, e.g. interpolateColor('#000000', '#ffffff', 0.5) -> 'rgb(128, 128, 128)'
const interpolateColor = (color1, color2, factor) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));

    return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Text with a gradient that blends from one named gradient into another while the
 * element scrolls into view. Gradient names refer to `theme.gradients` in config/theme.js;
 * the defaults come from `theme.scrollGradient`.
 */
const ScrollAwareGradient = ({
    from = theme.scrollGradient.from,
    to = theme.scrollGradient.to,
    children
}) => {
    const textRef = useRef(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!textRef.current) return;

            const { top } = textRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const animationStartPoint = viewportHeight * 0.8;
            const animationEndPoint = viewportHeight * 0.5;
            const animationDistance = animationStartPoint - animationEndPoint;
            const distanceScrolledInZone = animationStartPoint - top;
            let scrollProgress = distanceScrolledInZone / animationDistance;
            scrollProgress = Math.max(0, Math.min(1, scrollProgress));

            setProgress(scrollProgress);
        };

        const onScroll = () => window.requestAnimationFrame(handleScroll);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Blend the start and end colours of both gradients according to the scroll progress.
    const [startColor1, endColor1] = gradientColors(from);
    const [startColor2, endColor2] = gradientColors(to);
    const currentStartColor = interpolateColor(startColor1, startColor2, progress);
    const currentEndColor = interpolateColor(endColor1, endColor2, progress);

    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${currentStartColor}, ${currentEndColor})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        transition: 'color 0.1s ease-out', // Smooths the transition when scrolling fast
    };

    return (
        <span ref={textRef} style={gradientStyle}>
            {children}
        </span>
    );
};


export default ScrollAwareGradient
