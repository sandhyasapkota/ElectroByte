/**
 * Storage utility for handling both localStorage and sessionStorage
 * based on user's "Remember Me" preference
 */

const REMEMBER_KEY = 'remember_me';

// Check if user chose "Remember Me"
export const isRemembered = () => {
  return localStorage.getItem(REMEMBER_KEY) === 'true';
};

// Set remember me preference
export const setRememberMe = (value) => {
  if (value) {
    localStorage.setItem(REMEMBER_KEY, 'true');
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
};

// Get the appropriate storage based on remember me preference
export const getStorage = () => {
  return isRemembered() ? localStorage : sessionStorage;
};

// Get token from the appropriate storage
export const getToken = () => {
  // Check localStorage first (for remembered users)
  const localToken = localStorage.getItem('access_token');
  if (localToken) return localToken;
  
  // Fall back to sessionStorage
  return sessionStorage.getItem('access_token');
};

// Get user from the appropriate storage
export const getUser = () => {
  // Check localStorage first (for remembered users)
  const localUser = localStorage.getItem('user');
  if (localUser) return JSON.parse(localUser);
  
  // Fall back to sessionStorage
  const sessionUser = sessionStorage.getItem('user');
  return sessionUser ? JSON.parse(sessionUser) : null;
};

// Save auth data to the appropriate storage
export const saveAuth = (token, user, remember = false) => {
  setRememberMe(remember);
  const storage = remember ? localStorage : sessionStorage;
  
  storage.setItem('access_token', token);
  storage.setItem('user', JSON.stringify(user));
};

// Update user in the appropriate storage
export const updateStoredUser = (user) => {
  const storage = getStorage();
  storage.setItem('user', JSON.stringify(user));
};

// Clear auth from both storages
export const clearAuth = () => {
  // Clear from both to ensure complete logout
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('user');
};

export default {
  isRemembered,
  setRememberMe,
  getStorage,
  getToken,
  getUser,
  saveAuth,
  updateStoredUser,
  clearAuth,
};
