import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';

const TaskCard = ({ task, farm, crop, onToggleComplete, onEdit, onDelete, onView }) => {
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${task.completed ? 'opacity-75' : ''} ${isOverdue ? 'border-l-4 border-l-error' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task.id);
              }}
              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                task.completed
                  ? 'bg-success border-success text-white'
                  : 'border-gray-300 hover:border-success'
              }`}
            >
              {task.completed && <ApperIcon name="Check" size={12} />}
            </button>
            
            <button
              onClick={() => onView && onView(task)}
              className="flex-1 min-w-0 text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
            >
              <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h4>
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <ApperIcon name="MapPin" size={14} className="mr-1" />
                  <span>{farm?.name || 'Unknown Farm'}</span>
                </div>
                
                {crop && (
                  <div className="flex items-center">
                    <ApperIcon name="Sprout" size={14} className="mr-1" />
                    <span>{crop.cropType}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3 mt-3">
                <div className="flex items-center text-sm">
                  <ApperIcon name="Calendar" size={14} className="mr-1 text-gray-400" />
                  <span className={isOverdue && !task.completed ? 'text-error font-medium' : 'text-gray-600'}>
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                  {isOverdue && !task.completed && (
                    <Badge variant="error" size="xs" className="ml-2">Overdue</Badge>
                  )}
                </div>
                
                <Badge variant={getPriorityColor(task.priority)} size="xs">
                  {task.priority}
                </Badge>
              </div>
            </button>
          </div>
          
          <div className="flex space-x-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              icon="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              icon="Trash2"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="text-error hover:bg-error/10"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TaskCard;