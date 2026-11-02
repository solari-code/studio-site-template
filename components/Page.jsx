import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactOverlayProvider from '@/components/ContactOverlayProvider';
import ScrollFadeProvider from '@/components/ui/ScrollFadeProvider';
import { Section } from '@/components/sections';
import { sectionId } from '@/config/pages';
import { pinnedColorMode, HERO_COLOR_MODE } from '@/config/theme';

// Generic page: header, the sections listed in config/pages.js, footer.
// `Section` looks the component up in the registry (components/sections/index.js).
export default function Page({ page }) {
    // The header floats transparently over the first section; if that is a hero pinned to a
    // colour mode (config/theme.js), the header takes the same mode while floating.
    const first = page.sections[0];
    const headerColorMode = first?.type === 'hero' ? pinnedColorMode(first.colorMode ?? HERO_COLOR_MODE) : undefined;

    return (
        <ContactOverlayProvider>
            <ScrollFadeProvider>
                <Header colorMode={headerColorMode} />
                <main>
                    {page.sections.map((section) => (
                        <Section key={sectionId(section)} config={section} />
                    ))}
                </main>
                <Footer />
            </ScrollFadeProvider>
        </ContactOverlayProvider>
    );
}
