import { useState, useEffect, useRef } from 'react';

/**
 * A component that renders text in a default color, and then "fills"
 * the text with a gradient as the component moves through the viewport.
 * This version uses an animated background-position for a smoother effect
 * without the rendering artifacts of clip-path.
 *
 * @param {object} props
 * @param {string} props.startColor - The starting color of the base gradient.
 * @param {string} props.endColor - The ending color of the base gradient.
 * @param {string} props.textColor - The initial color of the text before the gradient fills it. Defaults to the parent's color.
 * @param {React.ReactNode} props.children - The text to apply the effect to.
 */
// const GradienText = ({ startColor, endColor, textColor = 'currentColor', children }) => {
//     // A ref to the container element to track its position on the screen.
//     const textRef = useRef(null);
//     // State to hold the scroll progress of the element within the viewport (0 to 1).
//     const [progress, setProgress] = useState(0);

//     useEffect(() => {
//         const handleScroll = () => {
//             if (!textRef.current) return;

//             const { top } = textRef.current.getBoundingClientRect();
//             const viewportHeight = window.innerHeight;

//             // --- NEUE LOGIK FÜR SCHNELLERE ANIMATION ---
//             // Wir definieren eine "Aktivierungszone" für die Animation.
//             // Die Animation startet, wenn die Oberkante des Elements am unteren Bildschirmrand ist (top = viewportHeight).
//             // Sie endet, wenn die Oberkante 60% der Bildschirmhöhe erreicht hat (top = viewportHeight * 0.6).
//             const animationStartPoint = viewportHeight;
//             const animationEndPoint = viewportHeight * 0.5;
//             const animationDistance = animationStartPoint - animationEndPoint;

//             // Berechnen, wie weit das Element innerhalb der Aktivierungszone gescrollt wurde.
//             const distanceScrolledInZone = animationStartPoint - top;

//             // Den Fortschritt als Wert zwischen 0 und 1 berechnen.
//             let scrollProgress = distanceScrolledInZone / animationDistance;

//             // Den Fortschritt auf den Bereich zwischen 0 und 1 begrenzen.
//             // Wenn das Element über der Zone ist, bleibt der Fortschritt 1 (vollständig gefärbt).
//             // Wenn es darunter ist, bleibt er 0.
//             scrollProgress = Math.max(0, Math.min(1, scrollProgress));

//             setProgress(scrollProgress);
//         };

//         // Use requestAnimationFrame for smooth, performant scroll handling.
//         const onScroll = () => {
//             window.requestAnimationFrame(handleScroll);
//         }

//         // Add the scroll event listener when the component mounts.
//         window.addEventListener('scroll', onScroll, { passive: true });

//         // Initial call to set the gradient correctly on load.
//         onScroll();

//         // Cleanup: remove the event listener when the component unmounts.
//         return () => {
//             window.removeEventListener('scroll', onScroll);
//         };
//     }, []); // Empty dependency array ensures this effect runs only on mount and unmount.

//     // The dynamic style for the gradient text.
//     const gradientStyle = {
//         // The gradient is composed of the colored part and the plain text color part.
//         // It's twice the width of the element.
//         backgroundImage: `linear-gradient(to right, ${startColor}, ${endColor} 50%, ${textColor} 50%)`,
//         backgroundSize: '200% 100%',
//         // We animate the background-position from right to left based on scroll progress.
//         // When progress is 0, we see the right half (plain text color).
//         // When progress is 1, we see the left half (the gradient).
//         backgroundPosition: `calc(100% - ${progress * 100}%) 0`,
//         WebkitBackgroundClip: 'text',
//         backgroundClip: 'text',
//         color: 'transparent',
//         // A subtle transition makes the animation smoother.
//         transition: 'background-position 0.1s ease-out',
//     };

//     return (
//         <span ref={textRef} style={gradientStyle}>
//             {children}
//         </span>
//     );
// };


// --- HILFSFUNKTION ZUR FARBINTERPOLATION ---
/**
 * Wandelt einen Hex-Farbstring (z.B. "#ff0000") in ein RGB-Objekt um.
 * @param {string} hex - Der Hex-Farbstring.
 * @returns {{r: number, g: number, b: number}}
 */
const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    // 3-stellige Hex-Farben
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
        // 6-stellige Hex-Farben
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
};

/**
 * Interpoliert zwischen zwei Farben.
 * @param {string} color1 - Die Startfarbe (Hex).
 * @param {string} color2 - Die Endfarbe (Hex).
 * @param {number} factor - Der Interpolationsfaktor (0 bis 1).
 * @returns {string} - Die resultierende Farbe als RGB-String.
 */
const interpolateColor = (color1, color2, factor) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));

    return `rgb(${r}, ${g}, ${b})`;
};


/**
 * Eine Komponente, die einen Text-Farbverlauf basierend auf der Scroll-Position
 * von einem Start-Farbverlauf zu einem End-Farbverlauf übergehen lässt.
 */
const ScrollAwareGradient = ({
    startColor1 = '#3b82f6', // Startfarbe des 1. Verlaufs
    endColor1 = '#22d3ee',   // Endfarbe des 1. Verlaufs
    startColor2 = '#a855f7', // Startfarbe des 2. Verlaufs
    endColor2 = '#ec4899',   // Endfarbe des 2. Verlaufs
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

    // Interpoliere die aktuellen Start- und Endfarben basierend auf dem Scroll-Fortschritt.
    const currentStartColor = interpolateColor(startColor1, startColor2, progress);
    const currentEndColor = interpolateColor(endColor1, endColor2, progress);

    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${currentStartColor}, ${currentEndColor})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        transition: 'color 0.1s ease-out', // Sorgt für einen weicheren Übergang bei schnellem Scrollen
    };

    return (
        <span ref={textRef} style={gradientStyle}>
            {children}
        </span>
    );
};


export default ScrollAwareGradient
