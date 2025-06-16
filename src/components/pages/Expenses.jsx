import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import { expenseService, farmService } from '@/services';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [farmFilter, setFarmFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    farmId: '',
    amount: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const categories = [
    'Seeds',
    'Fertilizer', 
    'Equipment',
    'Labor',
    'Fuel',
    'Maintenance',
    'Other'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesData, farmsData] = await Promise.all([
        expenseService.getAll(),
        farmService.getAll()
      ]);
      setExpenses(expensesData);
      setFarms(farmsData);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    const matchesFarm = !farmFilter || expense.farmId === farmFilter;
    
    // Filter by selected month
    const expenseDate = new Date(expense.date);
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const matchesMonth = isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
    
    return matchesSearch && matchesCategory && matchesFarm && matchesMonth;
  });

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Seeds': 'secondary',
      'Fertilizer': 'success',
      'Equipment': 'primary',
      'Labor': 'warning',
      'Fuel': 'accent',
      'Maintenance': 'info',
      'Other': 'default'
    };
    return colors[category] || 'default';
  };

  const monthlyTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryBreakdown = categories.map(category => {
    const categoryExpenses = filteredExpenses.filter(expense => expense.category === category);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return { category, total, count: categoryExpenses.length };
  }).filter(item => item.total > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      const newExpense = await expenseService.create(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      setShowForm(false);
      setFormData({
        farmId: '',
        amount: '',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: ''
      });
      toast.success('Expense added successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to add expense');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseService.delete(expenseId);
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      toast.success('Expense deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete expense');
    }
  };

  const farmOptions = [
    { value: '', label: 'All Farms' },
    ...farms.map(farm => ({ value: farm.id, label: farm.name }))
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(category => ({ value: category, label: category }))
  ];

  const formFarmOptions = farms.map(farm => ({ value: farm.id, label: farm.name }));
  const formCategoryOptions = categories.map(category => ({ value: category, label: category }));

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

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your farm-related expenses
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => setShowForm(true)}
          >
            Add Expense
          </Button>
        </div>
      </motion.div>

      {/* Month selector and summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6"
      >
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-gray-900">
              {format(selectedMonth, 'MMMM yyyy')} Summary
            </h2>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon="ChevronLeft"
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
              />
              <Button
                variant="ghost"
                size="sm"
                icon="ChevronRight"
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
              />
            </div>
          </div>
          
          <div className="text-3xl font-bold text-primary mb-4">
            ${monthlyTotal.toLocaleString()}
          </div>
          
          {categoryBreakdown.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryBreakdown.map(item => (
                <div key={item.category} className="text-center">
                  <Badge variant={getCategoryColor(item.category)} className="mb-2">
                    {item.category}
                  </Badge>
                  <div className="text-lg font-semibold text-gray-900">
                    ${item.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.count} expense{item.count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display font-semibold text-lg mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Expenses</span>
              <span className="font-medium">{filteredExpenses.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average</span>
              <span className="font-medium">
                ${filteredExpenses.length > 0 ? (monthlyTotal / filteredExpenses.length).toFixed(0) : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Largest</span>
              <span className="font-medium">
                ${filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map(e => e.amount)).toLocaleString() : '0'}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search expenses..."
          className="flex-1 max-w-md"
        />
        
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={categoryOptions}
          className="w-full sm:w-48"
        />
        
        <Select
          value={farmFilter}
          onChange={(e) => setFarmFilter(e.target.value)}
          options={farmOptions}
          className="w-full sm:w-48"
        />
      </motion.div>

      {/* Expenses List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filteredExpenses.length === 0 ? (
          searchTerm || categoryFilter || farmFilter ? (
            <EmptyState
              title="No expenses found"
              description="No expenses match your current filters. Try adjusting your search criteria."
              icon="Search"
            />
          ) : (
            <EmptyState
              title="No expenses for this month"
              description="Start tracking your farm expenses to get better insights into your costs."
              actionLabel="Add First Expense"
              onAction={() => setShowForm(true)}
              icon="Receipt"
            />
          )
        ) : (
          <Card>
            <div className="divide-y divide-gray-200">
              {filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        getCategoryColor(expense.category) === 'primary' ? 'bg-primary/10' :
                        getCategoryColor(expense.category) === 'secondary' ? 'bg-secondary/10' :
                        getCategoryColor(expense.category) === 'success' ? 'bg-success/10' :
                        getCategoryColor(expense.category) === 'warning' ? 'bg-warning/10' :
                        getCategoryColor(expense.category) === 'accent' ? 'bg-accent/10' :
                        getCategoryColor(expense.category) === 'info' ? 'bg-info/10' :
                        'bg-gray-100'
                      }`}>
                        <ApperIcon 
                          name={
                            expense.category === 'Seeds' ? 'Sprout' :
                            expense.category === 'Equipment' ? 'Wrench' :
                            expense.category === 'Labor' ? 'Users' :
                            expense.category === 'Fuel' ? 'Fuel' :
                            'Receipt'
                          } 
                          size={20} 
                          className={
                            getCategoryColor(expense.category) === 'primary' ? 'text-primary' :
                            getCategoryColor(expense.category) === 'secondary' ? 'text-secondary' :
                            getCategoryColor(expense.category) === 'success' ? 'text-success' :
                            getCategoryColor(expense.category) === 'warning' ? 'text-warning' :
                            getCategoryColor(expense.category) === 'accent' ? 'text-accent' :
                            getCategoryColor(expense.category) === 'info' ? 'text-info' :
                            'text-gray-500'
                          }
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 break-words">{expense.description}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{getFarmName(expense.farmId)}</span>
                          <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 ml-4">
                      <Badge variant={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ${expense.amount.toLocaleString()}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-error hover:bg-error/10"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </motion.div>

      {/* Add Expense Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
              >
                <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
                  Add New Expense
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    type="select"
                    label="Farm"
                    value={formData.farmId}
                    onChange={(e) => setFormData(prev => ({ ...prev, farmId: e.target.value }))}
                    options={formFarmOptions}
                    required
                  />

                  <FormField
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    icon="DollarSign"
                  />

                  <FormField
                    type="select"
                    label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    options={formCategoryOptions}
                    required
                  />

                  <FormField
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    icon="Calendar"
                  />

                  <FormField
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    icon="FileText"
                  />

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                      disabled={formLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={formLoading}
                      className="flex-1"
                    >
                      Add Expense
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expenses;