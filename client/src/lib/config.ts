// Environment configuration for client
const getApiUrl = () => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
        // Use environment variable if available
        if (process.env.NEXT_PUBLIC_API_URL) {
            return process.env.NEXT_PUBLIC_API_URL;
        }

        // Fallback based on current hostname
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Use environment variable or default to port 3000 for Docker
            return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        }

        // For production deployments
        return `https://${hostname.replace('www.', '')}`;
    }

    // Server-side fallback
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export const config = {
    apiUrl: getApiUrl(),
    environment: process.env.NEXT_PUBLIC_ENV || 'local',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
};
