import axios from 'axios';
import { getToken, clearAuth } from './storage';
import { API_BASE_URL } from './config';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      // Handle token expiration
      if (status === 401) {
        // Clear auth data from both storages
        clearAuth();
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      // Handle forbidden access
      if (status === 403) {
        return Promise.reject(new Error('You do not have permission to access this resource.'));
      }

      // Handle not found
      if (status === 404) {
        return Promise.reject(new Error(data?.message || 'Resource not found.'));
      }

      // Handle server errors
      if (status >= 500) {
        return Promise.reject(new Error('Server error. Please try again later.'));
      }

      // Return API error message
      return Promise.reject(new Error(data?.error || data?.message || 'Request failed'));
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please check your connection.'));
    }

    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check if the server is running.'));
    }

    return Promise.reject(error);
  }
);

// Helper for FormData uploads (no Content-Type header - let browser set it)
export const uploadRequest = async (endpoint, formData, method = 'POST') => {
  const token = getToken();
  
  const config = {
    method,
    url: endpoint,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    const response = await axiosInstance.request(config);
    return response;
  } catch (error) {
    throw error;
  }
};

// Export default axios instance
export default axiosInstance;

// Named exports for common HTTP methods
export const api = {
  get: (url, config) => axiosInstance.get(url, config),
  post: (url, data, config) => axiosInstance.post(url, data, config),
  put: (url, data, config) => axiosInstance.put(url, data, config),
  patch: (url, data, config) => axiosInstance.patch(url, data, config),
  delete: (url, config) => axiosInstance.delete(url, config),
};
