import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["uploadthing.com", "utfs.io"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com"
            }
        ], // Allow Unsplash images
    },
};

export default withNextIntl(nextConfig);
