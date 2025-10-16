// Environment configuration for client
const getApiUrl = () => {
    // Always use environment variable if available (Railway will set this)
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Check if we're in the browser
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Local development fallback
            return 'http://localhost:3000';
        }

        // For production deployments, don't use hostname - use environment variable
        console.warn('NEXT_PUBLIC_API_URL not set in production environment');
        return 'http://localhost:3000'; // Fallback
    }

    // Server-side fallback
    return 'http://localhost:3000';
};

export const config = {
    apiUrl: getApiUrl(),
    environment: process.env.NEXT_PUBLIC_ENV || 'local',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
};
