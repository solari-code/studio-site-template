import createNextIntlPlugin from 'next-intl/plugin';
import { siteConfig } from './config/site.js';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Remote image hosts are configured in config/site.js
        remotePatterns: siteConfig.images.remotePatterns,
    },
};

export default withNextIntl(nextConfig);
