import React from 'react';

/**
 * Reusable form input component with validation error display
 */
export const FormInput = ({
  label,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  endIcon,
  onEndIconClick,
  register,
  name,
  ...props
}) => {
  const inputProps = register ? register(name) : { name, ...props };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        )}
        <input
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${endIcon ? 'pr-12' : 'pr-4'} py-3 border ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-200'
          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100`}
          {...inputProps}
        />
        {endIcon && (
          <button
            type="button"
            onClick={onEndIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {endIcon}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error.message || error}</p>
      )}
    </div>
  );
};

/**
 * Reusable textarea component with validation error display
 */
export const FormTextarea = ({
  label,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = '',
  rows = 4,
  register,
  name,
  ...props
}) => {
  const inputProps = register ? register(name) : { name, ...props };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-3 border ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200'
        } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 resize-none`}
        {...inputProps}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error.message || error}</p>
      )}
    </div>
  );
};

/**
 * Reusable select component with validation error display
 */
export const FormSelect = ({
  label,
  error,
  options = [],
  disabled = false,
  required = false,
  className = '',
  placeholder = 'Select...',
  register,
  name,
  ...props
}) => {
  const inputProps = register ? register(name) : { name, ...props };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        disabled={disabled}
        className={`w-full px-4 py-3 border ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200'
        } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 bg-white`}
        {...inputProps}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error.message || error}</p>
      )}
    </div>
  );
};

/**
 * Reusable submit button with loading state
 */
export const SubmitButton = ({
  children,
  isLoading = false,
  loadingText = 'Loading...',
  disabled = false,
  className = '',
  variant = 'primary',
  fullWidth = true,
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-200',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-200',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-200',
  };

  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className={`${fullWidth ? 'w-full' : ''} py-3 px-4 ${variants[variant]} font-semibold rounded-xl focus:ring-4 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Form error alert component
 */
export const FormError = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2 ${className}`}>
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
};

/**
 * Form success alert component
 */
export const FormSuccess = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm flex items-center gap-2 ${className}`}>
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
};

export default FormInput;
