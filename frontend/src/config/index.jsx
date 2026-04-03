/**
 * Main Configuration Export
 * Central export point for all configuration
 */

// ✅ Import centralized Axios instance
import axiosInstance from './axios';
import API_CONFIG, { API_BASE_URL, ENV, mediaUrl } from './api';

// ✅ Export Axios instance as clientServer (for backward compatibility)
export const clientServer = axiosInstance;

// ✅ Export API configuration
export const BASE_URL = API_BASE_URL;
export const API_ENVIRONMENT = ENV;
export { mediaUrl };

// ✅ Default export
export default {
  clientServer,
  BASE_URL,
  API_ENVIRONMENT,
  API_CONFIG,
  mediaUrl,
};