import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from '../Component/Loading';

/**
 * AdminRoute - For routes that require admin role
 * Redirects to login if not authenticated
 * Redirects to home if authenticated but not admin
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, isAdmin } = useAuth();

  // Show loading while checking auth state
  if (isLoading) {
    return <PageLoader />;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Not an admin, redirect to home
  if (!isAdmin()) {
    return <Navigate to="/home" replace />;
  }

  // Is admin, render the route
  return children;
};

export default AdminRoute;
