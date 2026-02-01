import axios from "axios";

const normalizeBaseUrl = (url) => {
    if (!url) return url;
    return String(url).trim().replace(/\/+$/, '');
};

// Get environment variables with fallbacks
const getApiUrl = () => {
    // Check for explicit environment variables
    if (import.meta.env.VITE_API_URL) {
        return normalizeBaseUrl(import.meta.env.VITE_API_URL);
    }

    // Fallback based on mode
    if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
        // Prefer configuring `VITE_API_URL` in your hosting environment.
        // As a safe default, try same-origin (works when you proxy /api/v1 to the backend).
        return "/api/v1";
    }

    return "http://localhost:4444/api/v1";
};

const BASE_URL = getApiUrl();

export const publicRequest = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // Increased timeout for production
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    validateStatus: function (status) {
        // Treat 4xx as errors so callers can handle them in catch blocks.
        return status >= 200 && status < 400;
    }
});

// Add retry interceptor
const retryRequest = (error) => {
    const { config } = error;

    if (!config || !config.retry) {
        return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;

    if (config.__retryCount >= config.retry) {
        return Promise.reject(error);
    }

    config.__retryCount += 1;

    const delay = config.retryDelay || 1000;
    return new Promise(resolve => {
        setTimeout(() => resolve(publicRequest(config)), delay * config.__retryCount);
    });
};

// Add request interceptor for debugging and retry logic
publicRequest.interceptors.request.use(
    (config) => {
        // Add retry configuration
        config.retry = config.retry || 2;
        config.retryDelay = config.retryDelay || 1000;

        if (import.meta.env.DEV) {
            console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Enhanced response interceptor for error handling
publicRequest.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle different types of errors
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout occurred');
        } else if (error.code === 'ERR_NETWORK') {
            console.error('Network error occurred. Server may be starting up.');
        } else if (error.response?.status === 502) {
            console.error('Bad Gateway - Server may be restarting');
        } else if (error.response?.status === 503) {
            console.error('Service Unavailable - Server temporarily down');
        } else if (error.response?.status === 404) {
            console.error('API endpoint not found:', error.config?.url);
        }

        // Try to retry the request
        if (error.code === 'ERR_NETWORK' ||
            error.code === 'ECONNABORTED' ||
            error.response?.status >= 500) {
            return retryRequest(error);
        }

        return Promise.reject(error);
    }
);
