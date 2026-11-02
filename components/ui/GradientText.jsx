"use client";

import { useState, useEffect, useRef } from 'react';
import { theme, gradientVar } from '@/config/theme';
import { useColorMode } from '@/components/ColorModeProvider';

// Interpolates between two `{ r, g, b }` colours, e.g. factor 0.5 between black and white -> 'rgb(128, 128, 128)'
const interpolateColor = (rgb1, rgb2, factor) => {
    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));

    return `rgb(${r}, ${g}, ${b})`;
};

// Reads the `--color-<token>: r g b` variables of a gradient's stops as they apply to `element`.
const readGradient = (element, name) => {
    const style = getComputedStyle(element);
    return theme.gradients[name].map((token) => {
        const [r, g, b] = style.getPropertyValue(`--color-${token}`).trim().split(/\s+/).map(Number);
        return { r, g, b };
    });
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
    // Colour stops of both gradients, read from the CSS variables once the element is mounted
    // and again whenever the colour mode changes.
    const [stops, setStops] = useState(null);
    const { mode } = useColorMode();

    useEffect(() => {
        if (!textRef.current) return;
        setStops({ from: readGradient(textRef.current, from), to: readGradient(textRef.current, to) });
    }, [from, to, mode]);

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
    // Until the variables have been read (server render, first paint) the `from` gradient is
    // used as is, which is exactly what progress 0 would produce.
    let backgroundImage = gradientVar(from);
    if (stops && progress > 0) {
        const [startColor1, endColor1] = stops.from;
        const [startColor2, endColor2] = stops.to;
        const currentStartColor = interpolateColor(startColor1, startColor2, progress);
        const currentEndColor = interpolateColor(endColor1, endColor2, progress);
        backgroundImage = `linear-gradient(to right, ${currentStartColor}, ${currentEndColor})`;
    }

    const gradientStyle = {
        backgroundImage,
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
