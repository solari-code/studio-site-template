import { withAlpha } from '@/config/theme';

/**
 * Soft radial glow as a CSS background, used on mobile where a blurred element would be too expensive.
 * `alphas` lists the opacity at 0%, 10%, 20%, … (one entry per `step`), ending in full transparency at 100%.
 *
 *   style={{ background: radialGlow('secondary', [0.045, 0.042, 0.035, 0.026, 0.017, 0.009, 0.005, 0.002]) }}
 */
export function radialGlow(token, alphas, { shape = 'circle at center', step = 10 } = {}) {
    const stops = alphas.map((alpha, i) => `${withAlpha(token, alpha)} ${i * step}%`);
    return `radial-gradient(${shape}, ${stops.join(', ')}, transparent 100%)`;
}
