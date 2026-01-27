import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Custom hook that combines React Hook Form with Zod validation
 * @param {Object} schema - Zod schema for validation
 * @param {Object} options - Additional React Hook Form options
 * @returns {Object} - React Hook Form methods and state
 */
export const useZodForm = (schema, options = {}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty, dirtyFields, touchedFields },
    reset,
    setValue,
    getValues,
    watch,
    trigger,
    control,
    setError,
    clearErrors,
    setFocus,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange', // Validate on change for real-time feedback
    ...options,
  });

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isValid,
    isDirty,
    dirtyFields,
    touchedFields,
    reset,
    setValue,
    getValues,
    watch,
    trigger,
    control,
    setError,
    clearErrors,
    setFocus,
  };
};

/**
 * Helper component for form field with error display
 * Use with controlled inputs
 */
export const FormField = ({ 
  label, 
  error, 
  children, 
  required = false, 
  className = '',
  helpText = '' 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default useZodForm;
