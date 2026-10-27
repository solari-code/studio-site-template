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

export default nextConfig;
