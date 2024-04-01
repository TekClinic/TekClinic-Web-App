/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    reactStrictMode: false, // React Strict Mode is off
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
