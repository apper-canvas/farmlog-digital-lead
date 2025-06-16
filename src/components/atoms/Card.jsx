import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  padding = 'p-6',
  ...props 
}) => {
  const baseClasses = `bg-white rounded-lg shadow-md border border-gray-100 transition-all duration-200 ${padding}`;
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  const cardClasses = `${baseClasses} ${hoverClasses} ${className}`;

  if (onClick) {
    return (
      <motion.div
        whileHover={hover ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
        whileTap={{ scale: 0.98 }}
        className={cardClasses}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;