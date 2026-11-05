import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactOverlayProvider from '@/components/ContactOverlayProvider';
import ScrollFadeProvider from '@/components/ui/ScrollFadeProvider';

// The frame around a regular page's content: contact overlay, scroll fade-ins, header, <main>, footer.
// Used by Page (pages built from sections) and by pages with their own content, like the lab's project pages.
// `headerColorMode` pins the floating header to a colour mode (see Header.jsx).
export default function SiteShell({ headerColorMode, children }) {
    return (
        <ContactOverlayProvider>
            <ScrollFadeProvider>
                <Header colorMode={headerColorMode} />
                <main>{children}</main>
                <Footer />
            </ScrollFadeProvider>
        </ContactOverlayProvider>
    );
}
