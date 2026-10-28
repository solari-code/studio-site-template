import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Logo from '@/components/Logo';
import AnimatedCTAButton from './ui/AnimatedButton';

// Simple header for the Impressum and privacy pages: logo plus a way back to the homepage.
const LegalHeader = () => {
    const t = useTranslations('Legal');

    return (
        <header className="bg-brand-surface border-b border-white/10">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-3">
                    <Logo className="h-8 w-auto text-white" />
                </Link>
                <Link href="/">
                    <AnimatedCTAButton className="text-white font-medium">{t('backHome')}</AnimatedCTAButton>
                </Link>
            </div>
        </header>
    );
};

export default LegalHeader;
