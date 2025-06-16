import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;

  return (
<div className={`relative ${className}`}>
      {label && (
        <label className={`absolute left-3 transition-all duration-200 pointer-events-none z-10 ${
          focused || hasValue 
            ? 'top-2 text-xs text-primary font-semibold' 
            : 'top-4 text-sm text-gray-700 font-medium'
        }`}>
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <ApperIcon name={icon} size={18} className="text-gray-400" />
          </div>
        )}
<input
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={(!hasValue && placeholder) ? placeholder : ''}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full ${label ? 'pt-6 pb-2' : 'py-3'} ${icon ? 'pl-11' : 'pl-3'} pr-3 border rounded-lg transition-all duration-200 bg-white ${
            error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' 
              : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
          } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error flex items-center">
          <ApperIcon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;