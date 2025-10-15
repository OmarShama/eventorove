/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://mononestnext_server:3000/api/:path*',
            },
        ];
    },
};

export default nextConfig;


