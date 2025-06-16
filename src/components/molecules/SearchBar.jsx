import React from 'react';
import Input from '@/components/atoms/Input';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className = '',
  ...props 
}) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      icon="Search"
      className={className}
      {...props}
    />
  );
};

export default SearchBar;