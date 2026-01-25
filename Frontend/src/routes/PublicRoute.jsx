import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from '../Component/Loading';

/**
 * PublicRoute - For routes that should only be accessible when NOT logged in
 * Examples: Login, Signup, Forgot Password
 * Redirects to home/dashboard if user is already authenticated
 */
const PublicRoute = ({ children, redirectTo = '/home' }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (isLoading) {
    return <PageLoader />;
  }

  // If authenticated, redirect based on role
  if (isAuthenticated && user) {
    // Check if there's a redirect location from previous navigation
    const from = location.state?.from?.pathname;
    
    if (from) {
      return <Navigate to={from} replace />;
    }

    // Redirect based on user role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'technician') {
      return <Navigate to="/technician" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  // Not authenticated, render the public route
  return children;
};

export default PublicRoute;
