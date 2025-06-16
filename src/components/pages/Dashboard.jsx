import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import StatsCard from '@/components/molecules/StatsCard';
import WeatherWidget from '@/components/organisms/WeatherWidget';
import TaskCard from '@/components/organisms/TaskCard';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import { farmService, cropService, taskService, expenseService } from '@/services';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    farms: 0,
    crops: 0,
    pendingTasks: 0,
    monthlyExpenses: 0
  });
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [farms, setFarms] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [farmsData, cropsData, tasksData, expensesData] = await Promise.all([
          farmService.getAll(),
          cropService.getAll(),
          taskService.getAll(),
          expenseService.getAll()
        ]);

        setFarms(farmsData);

        // Calculate stats
        const pendingTasks = tasksData.filter(task => !task.completed);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = expensesData
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
          })
          .reduce((sum, expense) => sum + expense.amount, 0);

        setStats({
          farms: farmsData.length,
          crops: cropsData.length,
          pendingTasks: pendingTasks.length,
          monthlyExpenses
        });

        // Get upcoming tasks (next 7 days)
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = pendingTasks
          .filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate >= now && taskDate <= nextWeek;
          })
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5);

        setUpcomingTasks(upcoming);

        // Get recent expenses (last 5)
        const recent = expensesData
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        setRecentExpenses(recent);

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleTaskToggle = async (taskId) => {
    try {
      const updatedTask = await taskService.toggleComplete(taskId);
      setUpcomingTasks(prev => 
        prev.map(task => 
          task.id === taskId ? updatedTask : task
        ).filter(task => !task.completed)
      );
      setStats(prev => ({
        ...prev,
        pendingTasks: prev.pendingTasks - (updatedTask.completed ? 1 : -1)
      }));
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const getFarmById = (farmId) => farms.find(farm => farm.id === farmId);

  const getTaskTimeLabel = (dueDate) => {
    const date = new Date(dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader count={4} type="card" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={2} />
          <SkeletonLoader count={1} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Farm Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening on your farms today.
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => navigate('/farms')}
          >
            Add Farm
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Farms"
          value={stats.farms}
          icon="MapPin"
          color="primary"
        />
        <StatsCard
          title="Active Crops"
          value={stats.crops}
          icon="Sprout"
          color="secondary"
        />
        <StatsCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon="CheckSquare"
          color="warning"
        />
        <StatsCard
          title="Monthly Expenses"
          value={`$${stats.monthlyExpenses.toLocaleString()}`}
          icon="Receipt"
          color="accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold text-gray-900">
                Upcoming Tasks
              </h2>
              <Button
                variant="ghost"
                size="sm"
                icon="ArrowRight"
                onClick={() => navigate('/tasks')}
              >
                View All
              </Button>
            </div>

            {upcomingTasks.length === 0 ? (
              <EmptyState
                title="No upcoming tasks"
                description="All caught up! Create new tasks to keep your farm organized."
                actionLabel="Create Task"
                onAction={() => navigate('/tasks')}
                icon="CheckSquare"
              />
            ) : (
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => handleTaskToggle(task.id)}
                      className="w-5 h-5 rounded border-2 border-gray-300 hover:border-success transition-colors flex items-center justify-center"
                    >
                      {task.completed && <ApperIcon name="Check" size={12} className="text-success" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 break-words">{task.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>{getFarmById(task.farmId)?.name || 'Unknown Farm'}</span>
                        <span className="text-primary font-medium">
                          {getTaskTimeLabel(task.dueDate)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      task.priority === 'High' ? 'bg-error/10 text-error' :
                      task.priority === 'Medium' ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Weather Widget */}
        <div className="space-y-6">
          <WeatherWidget />
          
          {/* Recent Expenses */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Recent Expenses</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="ArrowRight"
                onClick={() => navigate('/expenses')}
              >
                View All
              </Button>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Receipt" size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No expenses recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 break-words">
                        {expense.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {expense.category} • {format(new Date(expense.date), 'MMM d')}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 ml-4">
                      ${expense.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;