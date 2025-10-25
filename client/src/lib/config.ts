// Environment configuration for client
const getApiUrl = () => {
    // Debug logging
    console.log('Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        isBrowser: typeof window !== 'undefined',
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side'
    });

    // Always use environment variable if available (Railway sets this)
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log('Using NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
        // Ensure no trailing slash to avoid double slashes
        const url = process.env.NEXT_PUBLIC_API_URL;
        return url.endsWith('/') ? url.slice(0, -1) : url;
    }

    // Check if we're in the browser
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            console.log('Using localhost fallback for development');
            return 'http://localhost:3001/api';
        }

        // Production fallback - use Railway server URL
        console.log('Production environment detected, using Railway server URL fallback');
        return 'https://eventorove-production.up.railway.app/api';
    }

    // Server-side rendering fallback
    console.log('Server-side rendering, using Railway server URL fallback');
    return 'https://eventorove-production.up.railway.app/api';
};

const apiUrl = getApiUrl();
console.log('Final API URL:', apiUrl);

export const config = {
    apiUrl,
    environment: process.env.NEXT_PUBLIC_ENV || 'local',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
};
