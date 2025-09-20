import axios from "axios";

// Use environment variable for API URL or fallback
const BASE_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
        ? "https://your-backend-url.vercel.app/api/v1/"
        : "http://localhost:4444/api/v1/");

export const publicRequest = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
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
