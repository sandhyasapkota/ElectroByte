import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../lib/axios';
import { getToken, getUser, saveAuth, updateStoredUser, clearAuth as clearStorageAuth } from '../lib/storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initRef = useRef(false);

  // Clear auth state - synchronous, no async operations
  const clearAuth = useCallback(() => {
    clearStorageAuth();
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initRef.current) return;
    initRef.current = true;

    const initializeAuth = async () => {
      try {
        const token = getToken();
        const storedUser = getUser();

        if (!token || !storedUser) {
          setIsLoading(false);
          return;
        }

        // Set initial state from storage immediately
        setUser(storedUser);
        setIsAuthenticated(true);
        setIsLoading(false);

        // Verify token with backend in background (non-blocking)
        try {
          const response = await axiosInstance.get('/init');
          if (response?.user) {
            setUser(response.user);
            updateStoredUser(response.user);
          }
        } catch (error) {
          // Token might be invalid, clear everything
          if (error.response?.status === 401 || error.message?.includes('Session expired')) {
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      }
    };

    initializeAuth();
  }, [clearAuth]);

  // Listen for profile updates and logout events
  useEffect(() => {
    const handleProfileUpdate = () => {
      const storedUser = getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    };

    // Listen for logout events from other components
    const handleLogoutEvent = () => {
      clearAuth();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('userLogout', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('userLogout', handleLogoutEvent);
    };
  }, [clearAuth]);

  // Login with optional remember me
  const login = async (email, password, rememberMe = false) => {
    const response = await axiosInstance.post('/login', { email, password });
    
    const token = response?.data?.access_token || response?.access_token;
    const userData = response?.data?.user || response?.user;

    if (token && userData) {
      saveAuth(token, userData, rememberMe);
      setUser(userData);
      setIsAuthenticated(true);
      window.dispatchEvent(new Event('profileUpdated'));
      return userData;
    }

    throw new Error('Login failed - no token received');
  };

  const register = async (userData) => {
    const response = await axiosInstance.post('/register', userData);
    return response;
  };

  // Logout - clears state and dispatches event for other components
  const logout = useCallback(() => {
    clearAuth();
    window.dispatchEvent(new Event('userLogout'));
  }, [clearAuth]);

  const updateUser = (userData) => {
    setUser(userData);
    updateStoredUser(userData);
    window.dispatchEvent(new Event('profileUpdated'));
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is technician
  const isTechnician = () => hasRole('technician');

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isTechnician,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
