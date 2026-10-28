import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Logo from '@/components/Logo';
import AnimatedCTAButton from '@/components/ui/AnimatedButton';

export default function NotFound() {
    const t = useTranslations('NotFound');

    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <Link href="/" className="inline-block mb-10">
                <Logo className="h-16 w-auto text-white" />
            </Link>
            <span className="inline-block py-1 px-3 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-6">
                404
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{t('title')}</h1>
            <p className="text-lg text-brand-gray max-w-md mb-10">{t('description')}</p>
            <Link href="/">
                <AnimatedCTAButton className="font-medium">{t('backHome')}</AnimatedCTAButton>
            </Link>
        </main>
    );
}
