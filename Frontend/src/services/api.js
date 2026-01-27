import { getToken as getStorageToken } from '../lib/storage';
import { API_BASE_URL } from '../lib/config';

// Get token from storage (checks both localStorage and sessionStorage)
const getToken = () => getStorageToken();

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server error: Invalid response from server');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }
    
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

// FormData upload helper (for file uploads)
const uploadRequest = async (endpoint, formData, method = 'POST') => {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server error: Backend is not responding. Please make sure the backend server is running on port 5000.');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Upload failed');
    }
    
    return data;
  } catch (error) {
    if (error.message.includes('Unexpected token')) {
      throw new Error('Server error: Backend is not responding. Please make sure the backend server is running on port 5000.');
    }
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  register: (data) => apiRequest('/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/login', { method: 'POST', body: JSON.stringify(data) }),
  verifyEmail: (token) => apiRequest(`/verify-email/${token}`, { method: 'GET' }),
  resendVerification: (email) => apiRequest('/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  forgotPassword: (email) => apiRequest('/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => apiRequest(`/reset-password/${token}`, { method: 'POST', body: JSON.stringify({ password }) }),
  init: () => apiRequest('/init'),
  getProfile: () => apiRequest('/profile'),
  updateProfile: (data) => apiRequest('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => apiRequest('/change-password', { method: 'PUT', body: JSON.stringify(data) }),
};

// Product APIs
export const productAPI = {
  getAll: () => apiRequest('/products'),
  getById: (id) => apiRequest(`/products/${id}`),
  search: (query) => apiRequest(`/products?search=${query}`),
  create: (formData) => uploadRequest('/products', formData, 'POST'),
  update: (id, formData) => uploadRequest(`/products/${id}`, formData, 'PUT'),
  delete: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
  updateStock: (id, stock_quantity, action = 'set') => apiRequest(`/products/${id}/stock`, { 
    method: 'PUT', 
    body: JSON.stringify({ stock_quantity, action }) 
  }),
  addImages: (id, formData) => uploadRequest(`/products/${id}/images`, formData, 'POST'),
  deleteImage: (productId, imageId) => apiRequest(`/products/${productId}/images/${imageId}`, { method: 'DELETE' }),
  setPrimaryImage: (productId, imageId) => apiRequest(`/products/${productId}/images/${imageId}/primary`, { method: 'PUT' }),
};

// Category APIs
export const categoryAPI = {
  getAll: () => apiRequest('/categories'),
  getById: (id) => apiRequest(`/categories/${id}`),
};

// Brand APIs
export const brandAPI = {
  getAll: () => apiRequest('/brands'),
};

// Cart APIs
export const cartAPI = {
  get: () => apiRequest('/cart'),
  add: (productId, quantity = 1) => apiRequest('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  addToCart: (productId, quantity = 1) => apiRequest('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  update: (id, quantity) => apiRequest(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  remove: (id) => apiRequest(`/cart/${id}`, { method: 'DELETE' }),
  clear: () => apiRequest('/cart', { method: 'DELETE' }),
};

// Order APIs
export const orderAPI = {
  create: (data) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => apiRequest('/orders/my-orders'),
  getById: (id) => apiRequest(`/orders/${id}`),
  cancel: (id) => apiRequest(`/orders/${id}/cancel`, { method: 'PUT' }),
  getAllOrders: () => apiRequest('/orders'),
  updateStatus: (id, status, estimatedDeliveryDate) => apiRequest(`/orders/${id}/status`, { 
    method: 'PUT', 
    body: JSON.stringify({ status, estimatedDeliveryDate }) 
  }),
};

// Address APIs
export const addressAPI = {
  getAll: () => apiRequest('/addresses'),
  add: (data) => apiRequest('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/addresses/${id}`, { method: 'DELETE' }),
};

// Appointment APIs
export const appointmentAPI = {
  book: (data) => apiRequest('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  getMyAppointments: () => apiRequest('/appointments/my-appointments'),
  getSlotAvailability: (date) => apiRequest(`/appointments/slot-availability?date=${date}`),
  edit: (id, data) => apiRequest(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancel: (id) => apiRequest(`/appointments/${id}/cancel`, { method: 'PUT' }),
  getRepairStatus: (token) => apiRequest(`/appointments/repair/${token}`),
  getRepairHistory: () => apiRequest('/appointments/repair-history'),
  getAllAppointments: () => apiRequest('/appointments'),
  assignTechnician: (repairId, technicianId) => apiRequest('/appointments/assign-technician', { method: 'POST', body: JSON.stringify({ repairId, technicianId }) }),
  updateStatus: (id, status) => apiRequest(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  // Technician endpoints
  getTechnicianJobs: () => apiRequest('/appointments/technician/jobs'),
  updateRepairStatus: (id, data) => apiRequest(`/appointments/repair/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Ticket/Support APIs
export const ticketAPI = {
  create: (data) => apiRequest('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  contact: (data) => apiRequest('/tickets/contact', { method: 'POST', body: JSON.stringify(data) }),
  getMyTickets: () => apiRequest('/tickets/my-tickets'),
  getById: (id) => apiRequest(`/tickets/${id}`),
  addReply: (id, message) => apiRequest(`/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),
  getAllTickets: () => apiRequest('/tickets'),
  reply: (id, adminReply) => apiRequest(`/tickets/${id}/reply`, { method: 'PUT', body: JSON.stringify({ adminReply }) }),
  updateStatus: (id, status) => apiRequest(`/tickets/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// FAQ APIs
export const faqAPI = {
  getAll: (category) => apiRequest(`/faqs${category ? `?category=${category}` : ''}`),
  create: (data) => apiRequest('/faqs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/faqs/${id}`, { method: 'DELETE' }),
};

// Feedback APIs
export const feedbackAPI = {
  create: (data) => apiRequest('/feedback', { method: 'POST', body: JSON.stringify(data) }),
  getProductRatings: (productId) => apiRequest(`/feedback/product/${productId}`),
  getMyReviews: () => apiRequest('/feedback/my-reviews'),
  deleteReview: (id) => apiRequest(`/feedback/${id}`, { method: 'DELETE' }),
};

// Wishlist APIs
export const wishlistAPI = {
  get: () => apiRequest('/wishlist'),
  add: (productId) => apiRequest('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  remove: (productId) => apiRequest(`/wishlist/${productId}`, { method: 'DELETE' }),
  toggle: (productId) => apiRequest('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }),
  check: (productId) => apiRequest(`/wishlist/check/${productId}`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => apiRequest('/admin/dashboard'),
  getAllUsers: () => apiRequest('/admin/users'),
  getUsers: (search, role) => apiRequest(`/admin/users?${search ? `search=${search}&` : ''}${role ? `role=${role}` : ''}`),
  toggleUserBlock: (id) => apiRequest(`/admin/users/${id}/toggle-block`, { method: 'PUT' }),
  updateUserRole: (id, role) => apiRequest(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  promoteToTechnician: (id, data) => apiRequest(`/admin/users/${id}/promote-technician`, { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
  getAllTechnicians: () => apiRequest('/admin/technicians'),
  getTechnicians: () => apiRequest('/admin/technicians'),
  createTechnician: (data) => apiRequest('/admin/technicians', { method: 'POST', body: JSON.stringify(data) }),
  updateTechnician: (id, data) => apiRequest(`/admin/technicians/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTechnician: (id) => apiRequest(`/admin/technicians/${id}`, { method: 'DELETE' }),
};

// User APIs
export const userAPI = {
  getProfile: () => apiRequest('/profile'),
  updateProfile: (data) => apiRequest('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  uploadProfileImage: (formData) => uploadRequest('/users/upload-image', formData, 'POST'),
  changePassword: (data) => apiRequest('/change-password', { method: 'PUT', body: JSON.stringify(data) }),
};

// Utility functions - token storage is handled by AuthContext/storage utility
export { getToken };
export const isLoggedIn = () => !!getToken();

export default apiRequest;
