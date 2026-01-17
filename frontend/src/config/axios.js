/**
 * Axios Instance Configuration
 * Centralized Axios instance with interceptors for requests and responses
 */

import axios from 'axios';
import { API_BASE_URL } from './api';

// ✅ Create Axios instance with base configuration
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage if available
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');

            // Add token to headers if it exists
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Log request in development
            console.log('📤 API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                fullURL: `${config.baseURL}${config.url}`,
            });
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// ✅ Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Log response in development
        if (typeof window !== 'undefined') {
            console.log('📥 API Response:', {
                status: response.status,
                url: response.config.url,
            });
        }

        return response;
    },
    (error) => {
        // Handle errors globally
        if (error.response) {
            // Server responded with error status
            console.error('❌ API Error:', {
                status: error.response.status,
                message: error.response.data?.message || error.message,
                url: error.config?.url,
                fullURL: error.config?.baseURL + error.config?.url,
            });

            // Handle 401 - Unauthorized
            if (error.response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('token');
                // Optionally redirect to login
                // window.location.href = '/login';
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('❌ Network Error:', error.message);
        } else {
            // Something else happened
            console.error('❌ Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
