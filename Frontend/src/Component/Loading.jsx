import React from 'react';
import { FaLaptop } from 'react-icons/fa';

// Full page loading spinner for lazy loading
export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaLaptop className="text-blue-600 text-lg" />
          </div>
        </div>
        <p className="mt-4 text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
};

// Inline loading spinner for buttons and small areas
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-white/30 rounded-full animate-spin border-t-white ${className}`}
    />
  );
};

// Button loading state
export const ButtonLoader = ({ text = 'Loading...' }) => {
  return (
    <span className="flex items-center justify-center gap-2">
      <Spinner size="sm" />
      {text}
    </span>
  );
};

// Content loading skeleton
export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClass = 'animate-pulse bg-gray-200';
  
  const variants = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return <div className={`${baseClass} ${variants[variant]} ${className}`} />;
};

// Card skeleton for product/item loading
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
      <Skeleton className="w-full h-48" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
    </div>
  );
};

export default PageLoader;
