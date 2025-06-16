import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';

const FarmCard = ({ farm, onEdit, onDelete, onView, cropsCount = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
>
      <Card hover onClick={onView && farm?.id ? onView : undefined} className="h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="MapPin" size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-gray-900">{farm.name}</h3>
              <p className="text-sm text-gray-600">{farm.location}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(farm);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="Trash2"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(farm.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-error hover:bg-error/10"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Farm Size</span>
            <span className="font-medium">{farm.size} acres</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Active Crops</span>
            <Badge variant="primary">{cropsCount}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Created</span>
            <span className="text-sm text-gray-500">
              {new Date(farm.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Activity" size={16} className="mr-2" />
            <span>View details and manage crops</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FarmCard;