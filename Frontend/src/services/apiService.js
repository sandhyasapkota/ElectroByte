import axiosInstance, { uploadRequest } from '../lib/axios';

// ====================================
// Auth APIs
// ====================================
export const authAPI = {
  register: (data) => axiosInstance.post('/register', data),
  login: (data) => axiosInstance.post('/login', data),
  verifyEmail: (token) => axiosInstance.get(`/verify-email/${token}`),
  resendVerification: (email) => axiosInstance.post('/resend-verification', { email }),
  forgotPassword: (email) => axiosInstance.post('/forgot-password', { email }),
  resetPassword: (token, password) => axiosInstance.post(`/reset-password/${token}`, { password }),
  init: () => axiosInstance.get('/init'),
  getProfile: () => axiosInstance.get('/profile'),
  updateProfile: (data) => axiosInstance.put('/profile', data),
  changePassword: (data) => axiosInstance.put('/change-password', data),
};

// ====================================
// Product APIs
// ====================================
export const productAPI = {
  getAll: () => axiosInstance.get('/products'),
  getById: (id) => axiosInstance.get(`/products/${id}`),
  search: (query) => axiosInstance.get(`/products?search=${query}`),
  create: (formData) => uploadRequest('/products', formData, 'POST'),
  update: (id, formData) => uploadRequest(`/products/${id}`, formData, 'PUT'),
  delete: (id) => axiosInstance.delete(`/products/${id}`),
  updateStock: (id, stock_quantity, action = 'set') => 
    axiosInstance.put(`/products/${id}/stock`, { stock_quantity, action }),
  addImages: (id, formData) => uploadRequest(`/products/${id}/images`, formData, 'POST'),
  deleteImage: (productId, imageId) => 
    axiosInstance.delete(`/products/${productId}/images/${imageId}`),
  setPrimaryImage: (productId, imageId) => 
    axiosInstance.put(`/products/${productId}/images/${imageId}/primary`),
};

// ====================================
// Category APIs
// ====================================
export const categoryAPI = {
  getAll: () => axiosInstance.get('/categories'),
  getById: (id) => axiosInstance.get(`/categories/${id}`),
  create: (data) => axiosInstance.post('/categories', data),
  update: (id, data) => axiosInstance.put(`/categories/${id}`, data),
  delete: (id) => axiosInstance.delete(`/categories/${id}`),
};

// ====================================
// Brand APIs
// ====================================
export const brandAPI = {
  getAll: () => axiosInstance.get('/brands'),
  create: (data) => axiosInstance.post('/brands', data),
  update: (id, data) => axiosInstance.put(`/brands/${id}`, data),
  delete: (id) => axiosInstance.delete(`/brands/${id}`),
};

// ====================================
// Cart APIs
// ====================================
export const cartAPI = {
  get: () => axiosInstance.get('/cart'),
  add: (productId, quantity = 1) => axiosInstance.post('/cart', { productId, quantity }),
  addToCart: (productId, quantity = 1) => axiosInstance.post('/cart', { productId, quantity }),
  update: (id, quantity) => axiosInstance.put(`/cart/${id}`, { quantity }),
  remove: (id) => axiosInstance.delete(`/cart/${id}`),
  clear: () => axiosInstance.delete('/cart'),
};

// ====================================
// Order APIs
// ====================================
export const orderAPI = {
  create: (data) => axiosInstance.post('/orders', data),
  getMyOrders: () => axiosInstance.get('/orders/my-orders'),
  getById: (id) => axiosInstance.get(`/orders/${id}`),
  cancel: (id) => axiosInstance.put(`/orders/${id}/cancel`),
  getAllOrders: () => axiosInstance.get('/orders'),
  updateStatus: (id, status) => axiosInstance.put(`/orders/${id}/status`, { status }),
};

// ====================================
// Address APIs
// ====================================
export const addressAPI = {
  getAll: () => axiosInstance.get('/addresses'),
  add: (data) => axiosInstance.post('/addresses', data),
  update: (id, data) => axiosInstance.put(`/addresses/${id}`, data),
  delete: (id) => axiosInstance.delete(`/addresses/${id}`),
};

// ====================================
// Appointment APIs
// ====================================
export const appointmentAPI = {
  book: (data) => axiosInstance.post('/appointments', data),
  getMyAppointments: () => axiosInstance.get('/appointments/my-appointments'),
  getSlotAvailability: (date) => axiosInstance.get(`/appointments/slot-availability?date=${date}`),
  edit: (id, data) => axiosInstance.put(`/appointments/${id}`, data),
  cancel: (id) => axiosInstance.put(`/appointments/${id}/cancel`),
  getRepairStatus: (token) => axiosInstance.get(`/appointments/repair/${token}`),
  getRepairHistory: () => axiosInstance.get('/appointments/repair-history'),
  getAllAppointments: () => axiosInstance.get('/appointments'),
  assignTechnician: (repairId, technicianId) => 
    axiosInstance.post('/appointments/assign-technician', { repairId, technicianId }),
  updateStatus: (id, status) => axiosInstance.put(`/appointments/${id}/status`, { status }),
  // Technician endpoints
  getTechnicianJobs: () => axiosInstance.get('/appointments/technician/jobs'),
  updateRepairStatus: (id, data) => axiosInstance.put(`/appointments/repair/${id}/status`, data),
};

// ====================================
// Ticket/Support APIs
// ====================================
export const ticketAPI = {
  create: (data) => axiosInstance.post('/tickets', data),
  contact: (data) => axiosInstance.post('/tickets/contact', data),
  getMyTickets: () => axiosInstance.get('/tickets/my-tickets'),
  getById: (id) => axiosInstance.get(`/tickets/${id}`),
  addReply: (id, message) => axiosInstance.post(`/tickets/${id}/reply`, { message }),
  getAllTickets: () => axiosInstance.get('/tickets'),
  reply: (id, adminReply) => axiosInstance.put(`/tickets/${id}/reply`, { adminReply }),
  updateStatus: (id, status) => axiosInstance.put(`/tickets/${id}/status`, { status }),
};

// ====================================
// FAQ APIs
// ====================================
export const faqAPI = {
  getAll: (category) => axiosInstance.get(`/faqs${category ? `?category=${category}` : ''}`),
  create: (data) => axiosInstance.post('/faqs', data),
  update: (id, data) => axiosInstance.put(`/faqs/${id}`, data),
  delete: (id) => axiosInstance.delete(`/faqs/${id}`),
};

// ====================================
// Feedback APIs
// ====================================
export const feedbackAPI = {
  create: (data) => axiosInstance.post('/feedback', data),
  getProductRatings: (productId) => axiosInstance.get(`/feedback/product/${productId}`),
  getMyReviews: () => axiosInstance.get('/feedback/my-reviews'),
  deleteReview: (id) => axiosInstance.delete(`/feedback/${id}`),
};

// ====================================
// Wishlist APIs
// ====================================
export const wishlistAPI = {
  get: () => axiosInstance.get('/wishlist'),
  add: (productId) => axiosInstance.post('/wishlist', { productId }),
  remove: (productId) => axiosInstance.delete(`/wishlist/${productId}`),
  toggle: (productId) => axiosInstance.post('/wishlist/toggle', { productId }),
  check: (productId) => axiosInstance.get(`/wishlist/check/${productId}`),
};

// ====================================
// Admin APIs
// ====================================
export const adminAPI = {
  getDashboard: () => axiosInstance.get('/admin/dashboard'),
  getAllUsers: () => axiosInstance.get('/admin/users'),
  getUsers: (search, role) => 
    axiosInstance.get(`/admin/users?${search ? `search=${search}&` : ''}${role ? `role=${role}` : ''}`),
  toggleUserBlock: (id) => axiosInstance.put(`/admin/users/${id}/toggle-block`),
  updateUserRole: (id, role) => axiosInstance.put(`/admin/users/${id}/role`, { role }),
  promoteToTechnician: (id, data) => axiosInstance.post(`/admin/users/${id}/promote-technician`, data),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
  getAllTechnicians: () => axiosInstance.get('/admin/technicians'),
  getTechnicians: () => axiosInstance.get('/admin/technicians'),
  createTechnician: (data) => axiosInstance.post('/admin/technicians', data),
  updateTechnician: (id, data) => axiosInstance.put(`/admin/technicians/${id}`, data),
  deleteTechnician: (id) => axiosInstance.delete(`/admin/technicians/${id}`),
};

// ====================================
// User APIs
// ====================================
export const userAPI = {
  getProfile: () => axiosInstance.get('/profile'),
  updateProfile: (data) => axiosInstance.put('/users/me', data),
  uploadProfileImage: (formData) => uploadRequest('/users/upload-image', formData, 'POST'),
  changePassword: (data) => axiosInstance.put('/change-password', data),
};

// ====================================
// Utility functions - re-exported from storage utility
// ====================================
import { getToken, clearAuth } from '../lib/storage';
export { getToken };
export const removeToken = clearAuth;
export const isLoggedIn = () => !!getToken();

// Default export
export default axiosInstance;
