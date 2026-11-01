import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactOverlayProvider from '@/components/ContactOverlayProvider';
import ScrollFadeProvider from '@/components/ui/ScrollFadeProvider';
import { Section } from '@/components/sections';
import { sectionId } from '@/config/pages';

// Generic page: header, the sections listed in config/pages.js, footer.
// `Section` looks the component up in the registry (components/sections/index.js).
export default function Page({ page }) {
    return (
        <ContactOverlayProvider>
            <ScrollFadeProvider>
                <Header />
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
