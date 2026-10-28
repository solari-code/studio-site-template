"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
    const t = useTranslations('Nav');
    const tHeader = useTranslations('Header');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Effect to handle background change on scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Effect to prevent body scroll when the mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    // Function to handle link clicks and close the menu
    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    // Section anchors on the homepage; `Link` adds the language prefix automatically.
    const navLinks = [
        { href: "/#services", text: t('services') },
        { href: "/#work", text: t('work') },
        { href: "/#process", text: t('process') },
        { href: "/#about", text: t('about') },
        { href: "/#contact", text: t('contact') },
    ];

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled || isMenuOpen ? 'bg-brand-dark/70 backdrop-blur-lg border-white/10' : 'bg-transparent border-transparent'}`}>
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center space-x-3" onClick={() => isMenuOpen && setIsMenuOpen(false)}>
                            <Logo className="h-8 w-auto text-white" />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} className="text-brand-light hover:text-brand-magenta transition-colors duration-300">
                                    {link.text}
                                </Link>
                            ))}
                            <LanguageSwitcher variant="compact" className="ml-2" />
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? tHeader('closeMenu') : tHeader('openMenu')} aria-expanded={isMenuOpen} className="z-50 text-brand-light focus:outline-none">
                                {isMenuOpen ? (
                                    // Close (X) icon
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                ) : (
                                    // Hamburger icon
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`md:hidden fixed inset-0 z-40 bg-brand-dark/95 backdrop-blur-xl transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <nav className="flex flex-col items-center justify-center h-full text-center">
                    {navLinks.map((link, index) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={handleLinkClick}
                            className={`block py-4 text-2xl hover:text-white text-brand-light transition-all duration-500 ease-out ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                            style={{ transitionDelay: `${150 + index * 75}ms` }}
                        >
                            {link.text}
                        </Link>
                    ))}
                    <div
                        className={`mt-8 transition-all duration-500 ease-out ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                        style={{ transitionDelay: `${150 + navLinks.length * 75}ms` }}
                    >
                        <LanguageSwitcher variant="menu" />
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Header;