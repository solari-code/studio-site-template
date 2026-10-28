"use client"

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import Work from '@/components/Work';
import Services from '@/components/Services';
import Process from '@/components/Process';
import Lab from '@/components/Lab';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ContactOverlay from '@/components/ContactOverlay';

import { useState } from 'react';
import useScrollFadeIn from '@/hooks/useFadeOnScroll';

export default function HomePage() {

  // Contact overlay
  const [overlayIsOpen, setOverlayIsOpen] = useState(false);
  const handleOpenOverlay = () => setOverlayIsOpen(true);
  const handleCloseOverlay = () => setOverlayIsOpen(false);

  useScrollFadeIn()

  return (
    <>
      <Header />
      <main>
        <Hero onOpenOverlay={handleOpenOverlay} />
        <Intro />
        <Services />
        <Work />
        {/* <Lab /> */}
        <Process />

        <About />
        <Contact onOpenOverlay={handleOpenOverlay} />
        <ContactOverlay isOpen={overlayIsOpen} onClose={handleCloseOverlay} />
      </main>
      <Footer />
    </>
  );
}