import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
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
        <label className={`absolute left-3 transition-all duration-200 pointer-events-none z-20 ${
          focused || hasValue 
            ? 'top-2 text-xs text-primary font-semibold' 
            : 'top-4 text-sm text-gray-700 font-medium'
        }`}>
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full appearance-none ${label ? 'pt-6 pb-2' : 'py-3'} pl-3 pr-10 border rounded-lg transition-all duration-200 ${
            error 
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' 
              : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
          } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
{...props}
        >
          <option value="" disabled hidden>
            {!hasValue ? placeholder : ''}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ApperIcon name="ChevronDown" size={18} className="text-gray-400" />
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error flex items-center">
          <ApperIcon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;