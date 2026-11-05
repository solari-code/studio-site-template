import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { pages } from '@/config/pages';

// "All projects": the way back from a lab project page (template or landing) to /lab. Text from `Lab.Detail.back`.
export default function BackLink({ className = '' }) {
    const t = useTranslations('Lab.Detail');
    return (
        <Link href={pages.lab.path} className={`group inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-contrast transition-colors ${className}`}>
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            {t('back')}
        </Link>
    );
}
