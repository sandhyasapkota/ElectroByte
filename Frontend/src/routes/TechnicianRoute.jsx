import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from '../Component/Loading';

/**
 * TechnicianRoute - For routes that require technician or admin role
 * Redirects to login if not authenticated
 * Redirects to home if authenticated but not technician/admin
 */
const TechnicianRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, isTechnician, isAdmin } = useAuth();

  // Show loading while checking auth state
  if (isLoading) {
    return <PageLoader />;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Not a technician or admin, redirect to home
  if (!isTechnician() && !isAdmin()) {
    return <Navigate to="/home" replace />;
  }

  // Is technician or admin, render the route
  return children;
};

export default TechnicianRoute;
