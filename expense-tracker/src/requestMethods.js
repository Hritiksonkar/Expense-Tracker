import axios from "axios";

// Get environment variables with fallbacks
const getApiUrl = () => {
    // Check for explicit environment variables
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Fallback based on mode
    if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
        return "https://expense-tracker-i7fh.onrender.com/api/v1/";
    }

    return "http://localhost:4444/api/v1/";
};

const BASE_URL = getApiUrl();

console.log('API Base URL:', BASE_URL); // Debug log

export const publicRequest = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor for debugging
publicRequest.interceptors.request.use(
    (config) => {
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

// Add response interceptor for error handling
publicRequest.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            console.error('Cannot connect to server. Please ensure the backend is running.');
        }

        // Log deployment-specific errors
        if (error.response?.status === 404) {
            console.error('API endpoint not found:', error.config?.url);
        }

        return Promise.reject(error);
    }
);
