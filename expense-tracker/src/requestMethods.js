import axios from "axios";

// Use environment variable for API URL or fallback to localhost with new port
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4445/api/v1/";

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
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
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
        if (error.code === 'ECONNREFUSED') {
            console.error('Cannot connect to server. Please ensure the backend is running.');
        }
        return Promise.reject(error);
    }
);
