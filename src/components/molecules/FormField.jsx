import React from 'react';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';

const FormField = ({ type = 'input', ...props }) => {
  if (type === 'select') {
    return <Select {...props} />;
  }
  
  return <Input {...props} />;
};

export default FormField;