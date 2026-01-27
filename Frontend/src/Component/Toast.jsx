import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

// Toast Context
const ToastContext = createContext(null);

// Toast types with their styles
const toastTypes = {
  success: {
    icon: FaCheckCircle,
    bgColor: 'bg-green-500',
    borderColor: 'border-green-600',
    textColor: 'text-white',
  },
  error: {
    icon: FaExclamationCircle,
    bgColor: 'bg-red-500',
    borderColor: 'border-red-600',
    textColor: 'text-white',
  },
  warning: {
    icon: FaExclamationTriangle,
    bgColor: 'bg-yellow-500',
    borderColor: 'border-yellow-600',
    textColor: 'text-white',
  },
  info: {
    icon: FaInfoCircle,
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-600',
    textColor: 'text-white',
  },
};

// Individual Toast Component
const ToastItem = ({ id, message, type, onClose }) => {
  const config = toastTypes[type] || toastTypes.info;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${config.bgColor} ${config.textColor} min-w-[300px] max-w-[400px] animate-slide-in`}
      role="alert"
    >
      <Icon className="text-xl flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
      >
        <FaTimes className="text-sm" />
      </button>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
