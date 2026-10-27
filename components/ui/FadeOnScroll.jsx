'use client';
import useScrollReveal from '@/hooks/useScrollReveal';

export default function FadeOnScroll({ children, className = '' }) {
    const [ref, isVisible] = useScrollReveal();

    return (
        <div
            ref={ref}
            className={`
        opacity-0 translate-y-5 transition-all duration-2000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}