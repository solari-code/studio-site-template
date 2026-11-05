import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import ColorModeSwitcher from './ColorModeSwitcher';
import { siteConfig } from '@/config/site';
import { footerNav, legalNav } from '@/config/pages';
import { getIcon } from '@/config/icons';

const Footer = () => {
    const t = useTranslations('Nav');

    const year = new Date().getFullYear();

    return (
        <footer className="bg-background text-contrast border-t border-contrast/10">
            <div className="container mx-auto px-6 py-16 text-center">
                <Link href="/" className="inline-block mb-8">
                    <Logo className="h-16 w-auto text-contrast" />
                </Link>
                {/* Generated from the `nav` entries in config/pages.js (footer: true) */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
                    {footerNav().map((item) => (
                        <Link key={item.href} href={item.href} className="whitespace-nowrap text-muted hover:text-contrast transition-colors">{t(item.label)}</Link>
                    ))}
                </div>
                {/* Social links from config/site.js; icons from config/icons.js */}
                <div className="flex justify-center space-x-6 mb-8">
                    {siteConfig.social.map((item) => {
                        const Icon = getIcon(item.icon);
                        return (
                            <a key={item.url} target='_blank' href={item.url} aria-label={item.label} className="text-muted hover:text-contrast transition-colors">
                                <Icon className="w-6 h-6" />
                            </a>
                        );
                    })}
                </div>
                <div className="text-muted text-sm space-y-1">
                    <p><a href={`mailto:${siteConfig.contact.email}`} className="hover:text-contrast transition-colors">{siteConfig.contact.email}</a></p>
                    {/* Pages with `nav.footer: 'legal'` in config/pages.js */}
                    <div className="flex justify-center space-x-4">
                        {legalNav().map((item) => (
                            <Link key={item.href} href={item.href} className="hover:text-contrast transition-colors">{t(item.label)}</Link>
                        ))}
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
                        <LanguageSwitcher variant="links" />
                        <ColorModeSwitcher variant="links" />
                    </div>
                    <p>&copy; {year} {siteConfig.name}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;