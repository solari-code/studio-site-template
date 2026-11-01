"use client";

// Section registry: maps the `type` used in config/pages.js to a component.
// To add a section type, create the component and register it below.
//
// Sections that pull in heavy libraries (Hero and Work use framer-motion) are loaded with
// next/dynamic, so pages without them don't ship that code. They are still rendered on the
// server (SSR). Everything else is imported statically: one small shared chunk is cheaper
// than a request per section.
//
// Every section receives `id` (anchor) and `namespace` (messages namespace, may be
// undefined to use the component's default), plus any other keys from its config entry.
import dynamic from 'next/dynamic';
import { sectionId } from '@/config/pages';
import Intro from './Intro';
import Services from './Services';
import Process from './Process';
import Lab from './Lab';
import About from './About';
import Contact from './Contact';
import StarterPackageHero from './starter-package/StarterPackageHero';
import StarterPackageWhoIsThisFor from './starter-package/StarterPackageWhoIsThisFor';
import StarterPackagePricing from './starter-package/StarterPackagePricing';
import StarterPackageRoadmap from './starter-package/StarterPackageRoadmap';
import StarterPackageFaq from './starter-package/StarterPackageFaq';
import StarterPackageContact from './starter-package/StarterPackageContact';
import StarterPackageTechSpecs from './starter-package/StarterPackageTechSpecs';

export const sectionComponents = {
    // Homepage
    hero: dynamic(() => import('./Hero')), // framer-motion
    intro: Intro,
    services: Services,
    work: dynamic(() => import('./Work')), // framer-motion, popmotion
    process: Process,
    lab: Lab,
    about: About,
    contact: Contact,

    // Starter offer page
    'starter-hero': StarterPackageHero,
    'starter-who-is-this-for': StarterPackageWhoIsThisFor,
    'starter-pricing': StarterPackagePricing,
    'starter-roadmap': StarterPackageRoadmap,
    'starter-faq': StarterPackageFaq,
    'starter-contact': StarterPackageContact,
    'starter-tech-specs': StarterPackageTechSpecs,
};

export const sectionTypes = Object.keys(sectionComponents);

// Renders one section from its config entry (see Page.jsx). Unknown types fail loudly at build time.
export function Section({ config }) {
    const { type, nav, ...props } = config;
    const Component = sectionComponents[type];
    if (!Component) {
        throw new Error(`Unknown section type "${type}" in config/pages.js. Available: ${sectionTypes.join(', ')}`);
    }
    return <Component {...props} id={sectionId(config)} />;
}
