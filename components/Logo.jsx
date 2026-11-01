import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';
import LogoMark from '@/config/logo';

// Renders the logo from config/logo.jsx with its translated accessible name.
const Logo = ({ className, style }) => {
    const t = useTranslations('Logo');

    return <LogoMark className={className} style={style} label={t('label', { name: siteConfig.name })} />;
};

export default Logo;
