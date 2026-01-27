// Re-export all API services
export * from './apiService';
export { default as axiosInstance } from '../lib/axios';

// Legacy exports for backward compatibility (from old api.js)
export * from './api';
