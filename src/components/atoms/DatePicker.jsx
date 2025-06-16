import React, { useState, forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import 'react-datepicker/dist/react-datepicker.css';

const DatePickerInput = forwardRef(({ 
  value, 
  onClick, 
  onChange, 
  placeholder, 
  disabled, 
  error, 
  icon, 
  className 
}, ref) => (
  <div className="relative">
    {icon && (
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
        <ApperIcon name={icon} size={18} className="text-gray-400" />
      </div>
    )}
    <input
      ref={ref}
      type="text"
      value={value || ''}
      onClick={onClick}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly
      className={`w-full py-3 ${icon ? 'pl-11' : 'pl-3'} pr-10 border rounded-lg transition-all duration-200 cursor-pointer ${
        error
          ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' 
          : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
      } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-gray-400'} ${className}`}
    />
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
      <ApperIcon name="Calendar" size={18} className="text-gray-400" />
    </div>
  </div>
));

DatePickerInput.displayName = 'DatePickerInput';

const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = 'Select date...',
  error,
  helperText,
  icon,
  disabled = false,
  required = false,
  className = '',
  minDate,
  maxDate,
  dateFormat = 'yyyy-MM-dd',
  showYearDropdown = true,
  showMonthDropdown = true,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  
  // Convert string date to Date object for DatePicker
  const selectedDate = value ? new Date(value) : null;
  
  // Handle date selection
  const handleDateChange = (date) => {
    if (date) {
      // Format date as yyyy-MM-dd to maintain compatibility with existing forms
      const formattedDate = format(date, 'yyyy-MM-dd');
      onChange({ target: { value: formattedDate } });
    } else {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <ReactDatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat={dateFormat}
        placeholderText={placeholder}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        showYearDropdown={showYearDropdown}
        showMonthDropdown={showMonthDropdown}
        dropdownMode="select"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        customInput={
          <DatePickerInput
            error={error}
            icon={icon}
            disabled={disabled}
            placeholder={placeholder}
          />
        }
        popperClassName="z-50"
        popperPlacement="bottom-start"
        {...props}
      />
      
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

export default DatePicker;