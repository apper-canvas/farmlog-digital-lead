import React from 'react';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import DatePicker from '@/components/atoms/DatePicker';

const FormField = ({ type = 'input', ...props }) => {
  if (type === 'select') {
    return <Select {...props} />;
  }
  
  if (type === 'date') {
    return <DatePicker {...props} />;
  }
  
  return <Input {...props} />;
};

export default FormField;