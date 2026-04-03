/**
 * API Configuration - FIXED VERSION
 * Centralized configuration for API endpoints and settings
 */

// ✅ Get API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090';

// ✅ Environment
const ENV = process.env.NEXT_PUBLIC_ENV || 'development';

// ✅ API Configuration
export const API_CONFIG = {
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
};

/**
 * Resolve stored media path: full Cloudinary/CDN URL, or legacy filename served from API origin.
 */
export function mediaUrl(stored) {
    if (!stored) return '';
    const s = String(stored).trim();
    if (/^https?:\/\//i.test(s)) return s;
    const base = (API_BASE_URL || '').replace(/\/$/, '');
    return `${base}/${s.replace(/^\//, '')}`;
}

// ✅ Export individual values
export { API_BASE_URL, ENV };

// ✅ Log configuration (always log to help debug)
if (typeof window !== 'undefined') {
    console.log('🔧 API Configuration Loaded:', {
        baseURL: API_BASE_URL,
        environment: ENV,
        envVarValue: process.env.NEXT_PUBLIC_API_BASE_URL,
    });
}

export default API_CONFIG;
