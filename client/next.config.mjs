/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    async rewrites() {
        // Only apply rewrites in Docker Compose environment
        // In Railway, API calls should go directly to the backend URL
        if (process.env.NODE_ENV === 'development' && process.env.DOCKER_COMPOSE === 'true') {
            return [
                {
                    source: '/api/:path*',
                    destination: 'http://eventorove_server:3000/api/:path*',
                },
            ];
        }
        return [];
    },
};

export default nextConfig;


