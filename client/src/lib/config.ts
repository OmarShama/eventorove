// Environment configuration for client
const getApiUrl = () => {
    // Debug logging
    console.log('Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        isBrowser: typeof window !== 'undefined',
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side'
    });

    // Check if we're in the browser
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            console.log('Using localhost fallback for development');
            return 'http://localhost:3000';
        }

        // Production - always use Railway server URL
        console.log('Production environment detected, using Railway server URL');
        return 'https://eventorove-production.up.railway.app/api';
    }

    // Server-side rendering - use Railway server URL
    console.log('Server-side rendering, using Railway server URL');
    return 'https://eventorove-production.up.railway.app/api';
};

export const config = {
    apiUrl: getApiUrl(),
    environment: process.env.NEXT_PUBLIC_ENV || 'local',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
};
