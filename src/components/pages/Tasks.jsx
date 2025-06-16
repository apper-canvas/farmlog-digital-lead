import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import Select from '@/components/atoms/Select';
import TaskCard from '@/components/organisms/TaskCard';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import FormField from '@/components/molecules/FormField';
import { taskService, farmService, cropService } from '@/services';
const TaskDetailsModal = ({ isOpen, onClose, task, farm, crop }) => {
  if (!isOpen || !task) return null;

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-gray-900">Task Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  task.completed
                    ? 'bg-success border-success text-white'
                    : 'border-gray-300'
                }`}>
                  {task.completed && <ApperIcon name="Check" size={14} />}
                </div>
                <span className={`font-medium ${task.completed ? 'text-success' : 'text-gray-600'}`}>
                  {task.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getPriorityColor(task.priority)} size="sm">
                  {task.priority} Priority
                </Badge>
                {isOverdue && !task.completed && (
                  <Badge variant="error" size="sm">Overdue</Badge>
                )}
              </div>
            </div>

            {/* Task Title */}
            <div>
              <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Farm and Crop Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm</label>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="MapPin" size={16} className="text-gray-400" />
                  <span className="text-gray-900">{farm?.name || 'Unknown Farm'}</span>
                </div>
              </div>

              {crop && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Sprout" size={16} className="text-gray-400" />
                    <span className="text-gray-900">{crop.cropType}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <div className="flex items-center space-x-2">
                <ApperIcon name="Calendar" size={16} className="text-gray-400" />
                <span className={`${isOverdue && !task.completed ? 'text-error font-medium' : 'text-gray-900'}`}>
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            {/* Created Date */}
            {task.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Clock" size={16} className="text-gray-400" />
                  <span className="text-gray-900">
                    {format(new Date(task.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t mt-6">
            <Button
              variant="primary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TaskForm = ({ isOpen, onClose, onSubmit, farms, crops }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    farmId: '',
    cropId: '',
    priority: 'Medium',
    dueDate: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    if (!formData.farmId) {
      toast.error('Please select a farm');
      return;
    }
    if (!formData.dueDate) {
      toast.error('Please select a due date');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        farmId: '',
        cropId: '',
        priority: 'Medium',
        dueDate: ''
      });
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-gray-900">Create New Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Task Title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title"
              required
            />

            <FormField
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the task (optional)"
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Farm"
                type="select"
                value={formData.farmId}
                onChange={(e) => handleInputChange('farmId', e.target.value)}
                options={[
                  { value: '', label: 'Select a farm' },
                  ...farms.map(farm => ({ value: farm.id, label: farm.name }))
                ]}
                required
              />

              <FormField
                label="Crop (Optional)"
                type="select"
                value={formData.cropId}
                onChange={(e) => handleInputChange('cropId', e.target.value)}
                options={[
                  { value: '', label: 'Select a crop' },
                  ...crops.map(crop => ({ value: crop.id, label: crop.name }))
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Priority"
                type="select"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' }
                ]}
              />

              <FormField
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                icon="Plus"
              >
                Create Task
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [farmFilter, setFarmFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);
      setTasks(tasksData);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFarm = !farmFilter || task.farmId === farmFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'completed' && task.completed) ||
      (statusFilter === 'pending' && !task.completed);
    
    return matchesSearch && matchesFarm && matchesPriority && matchesStatus;
  });

  const getFarmById = (farmId) => farms.find(farm => farm.id === farmId);
  const getCropById = (cropId) => crops.find(crop => crop.id === cropId);

  const handleToggleComplete = async (taskId) => {
    try {
      const updatedTask = await taskService.toggleComplete(taskId);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      toast.success(updatedTask.completed ? 'Task completed!' : 'Task marked as pending');
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete task');
    }
};

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.create({
        ...taskData,
        completed: false,
        createdAt: new Date().toISOString(),
        id: Date.now().toString()
      });
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created successfully');
    } catch (error) {
      throw error;
}
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const getTasksForDate = (date) => {
    return filteredTasks.filter(task => 
      isSameDay(new Date(task.dueDate), date)
    );
  };

  const farmOptions = [
    { value: '', label: 'All Farms' },
    ...farms.map(farm => ({ value: farm.id, label: farm.name }))
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  const statusOptions = [
    { value: '', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <SkeletonLoader count={5} type="list" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const renderCalendarView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold text-gray-900">
                {format(selectedDate, 'MMMM yyyy')}
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon="ChevronLeft"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon="ChevronRight"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map(day => {
                const dayTasks = getTasksForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`p-2 min-h-16 text-left border rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : isCurrentDay
                        ? 'border-secondary bg-secondary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-sm font-medium ${
                      isCurrentDay ? 'text-secondary' : 'text-gray-900'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    {dayTasks.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${
                              task.completed
                                ? 'bg-success/10 text-success'
                                : task.priority === 'High'
                                ? 'bg-error/10 text-error'
                                : 'bg-warning/10 text-warning'
                            }`}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Selected Day Tasks */}
        <div>
          <Card>
            <h3 className="font-display font-semibold text-lg mb-4">
              {format(selectedDate, 'MMM d, yyyy')}
            </h3>

            {getTasksForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Calendar" size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No tasks for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getTasksForDate(selectedDate).map(task => (
                  <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        <button
                          onClick={() => handleToggleComplete(task.id)}
                          className={`mt-1 w-4 h-4 rounded border flex items-center justify-center ${
                            task.completed
                              ? 'bg-success border-success text-white'
                              : 'border-gray-300 hover:border-success'
                          }`}
                        >
                          {task.completed && <ApperIcon name="Check" size={10} />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium ${
                            task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          } break-words`}>
                            {task.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {getFarmById(task.farmId)?.name || 'Unknown Farm'}
                          </p>
                        </div>
                      </div>
                      
                      <Badge
                        variant={
                          task.priority === 'High' ? 'error' :
                          task.priority === 'Medium' ? 'warning' : 'success'
                        }
                        size="xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          searchTerm || farmFilter || priorityFilter || statusFilter ? (
            <EmptyState
              title="No tasks found"
              description="No tasks match your current filters. Try adjusting your search criteria."
              icon="Search"
            />
          ) : (
<EmptyState
              title="No tasks yet"
              description="Create your first task to start organizing your farm work."
              actionLabel="Create Task"
              onAction={() => setShowTaskForm(true)}
              icon="CheckSquare"
            />
          )
        ) : (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
>
              <TaskCard
                task={task}
                farm={getFarmById(task.farmId)}
                crop={getCropById(task.cropId)}
                onToggleComplete={handleToggleComplete}
                onEdit={() => {/* TODO: Implement task editing */}}
                onDelete={handleDeleteTask}
                onView={handleViewTask}
              />
            </motion.div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your farming activities
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
            </button>
          </div>
          
<Button 
            variant="primary" 
            icon="Plus"
            onClick={() => setShowTaskForm(true)}
          >
            Add Task
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tasks..."
          className="flex-1 max-w-md"
        />
        
        <Select
          value={farmFilter}
          onChange={(e) => setFarmFilter(e.target.value)}
          options={farmOptions}
          className="w-full sm:w-48"
        />
        
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={priorityOptions}
          className="w-full sm:w-32"
        />
        
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
          className="w-full sm:w-32"
        />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
{viewMode === 'calendar' ? renderCalendarView() : renderListView()}
      </motion.div>

      {/* Task Creation Form */}
      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            isOpen={showTaskForm}
            onClose={() => setShowTaskForm(false)}
            onSubmit={handleCreateTask}
            farms={farms}
            crops={crops}
/>
        )}
      </AnimatePresence>

      {/* Task Details Modal */}
      <AnimatePresence>
        {showTaskDetails && (
          <TaskDetailsModal
            isOpen={showTaskDetails}
            onClose={() => setShowTaskDetails(false)}
            task={selectedTask}
            farm={selectedTask ? getFarmById(selectedTask.farmId) : null}
            crop={selectedTask ? getCropById(selectedTask.cropId) : null}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;