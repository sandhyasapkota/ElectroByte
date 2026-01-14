import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from '../Component/Loading';

/**
 * PrivateRoute - For routes that require authentication
 * Redirects to login if user is not authenticated
 * Stores the attempted location for redirect after login
 * Technicians are redirected to their dashboard (they can't access user pages)
 */
const PrivateRoute = ({ children, roles = [], allowTechnician = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (isLoading) {
    return <PageLoader />;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Technicians can only access technician routes, not user routes
  if (user?.role === 'technician' && !allowTechnician) {
    return <Navigate to="/technician" replace />;
  }

  // Check role-based access if roles are specified
  if (roles.length > 0 && user) {
    const hasRequiredRole = roles.includes(user.role);
    
    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to home
      return <Navigate to="/home" replace />;
    }
  }

  // Authenticated and has required role (if specified), render the route
  return children;
};

export default PrivateRoute;
