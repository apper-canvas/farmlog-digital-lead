import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { incomeService } from '@/services';

const Income = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const sources = [
    'Crop Sales',
    'Livestock Sales',
    'Equipment Rental',
    'Government Subsidies',
    'Insurance Claims',
    'Other'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const incomeData = await incomeService.getAll();
      setIncomes(incomeData);
    } catch (err) {
      setError(err.message || 'Failed to load income');
      toast.error('Failed to load income');
    } finally {
      setLoading(false);
    }
  };

  const filteredIncomes = incomes.filter(income => {
    const matchesSearch = income.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = !sourceFilter || income.source === sourceFilter;
    
    // Filter by selected month
    const incomeDate = new Date(income.date);
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const matchesMonth = isWithinInterval(incomeDate, { start: monthStart, end: monthEnd });
    
    return matchesSearch && matchesSource && matchesMonth;
  });

  const getSourceColor = (source) => {
    const colors = {
      'Crop Sales': 'success',
      'Livestock Sales': 'primary',
      'Equipment Rental': 'secondary',
      'Government Subsidies': 'info',
      'Insurance Claims': 'warning',
      'Other': 'default'
    };
    return colors[source] || 'default';
  };

  const monthlyTotal = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);

  const sourceBreakdown = sources.map(source => {
    const sourceIncomes = filteredIncomes.filter(income => income.source === source);
    const total = sourceIncomes.reduce((sum, income) => sum + income.amount, 0);
    return { source, total, count: sourceIncomes.length };
  }).filter(item => item.total > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const incomeData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      const newIncome = await incomeService.create(incomeData);
      setIncomes(prev => [newIncome, ...prev]);
      setShowForm(false);
      setFormData({
        source: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: ''
      });
      toast.success('Income added successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to add income');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) {
      return;
    }

    try {
      await incomeService.delete(incomeId);
      setIncomes(prev => prev.filter(income => income.id !== incomeId));
      toast.success('Income deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete income');
    }
  };

  const sourceOptions = [
    { value: '', label: 'All Sources' },
    ...sources.map(source => ({ value: source, label: source }))
  ];

  const formSourceOptions = sources.map(source => ({ value: source, label: source }));

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
          <h1 className="text-2xl font-display font-bold text-gray-900">Income</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your farm income sources
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => setShowForm(true)}
          >
            Add Income
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
          
          <div className="text-3xl font-bold text-success mb-4">
            ${monthlyTotal.toLocaleString()}
          </div>
          
          {sourceBreakdown.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sourceBreakdown.map(item => (
                <div key={item.source} className="text-center">
                  <Badge variant={getSourceColor(item.source)} className="mb-2">
                    {item.source}
                  </Badge>
                  <div className="text-lg font-semibold text-gray-900">
                    ${item.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.count} entr{item.count !== 1 ? 'ies' : 'y'}
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
              <span className="text-sm text-gray-600">Total Entries</span>
              <span className="font-medium">{filteredIncomes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average</span>
              <span className="font-medium">
                ${filteredIncomes.length > 0 ? (monthlyTotal / filteredIncomes.length).toFixed(0) : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Largest</span>
              <span className="font-medium">
                ${filteredIncomes.length > 0 ? Math.max(...filteredIncomes.map(i => i.amount)).toLocaleString() : '0'}
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
          placeholder="Search income entries..."
          className="flex-1 max-w-md"
        />
        
        <Select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          options={sourceOptions}
          className="w-full sm:w-48"
        />
      </motion.div>

      {/* Income List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filteredIncomes.length === 0 ? (
          searchTerm || sourceFilter ? (
            <EmptyState
              title="No income found"
              description="No income entries match your current filters. Try adjusting your search criteria."
              icon="Search"
            />
          ) : (
            <EmptyState
              title="No income for this month"
              description="Start tracking your farm income to get better insights into your revenue."
              actionLabel="Add First Income"
              onAction={() => setShowForm(true)}
              icon="TrendingUp"
            />
          )
        ) : (
          <Card>
            <div className="divide-y divide-gray-200">
              {filteredIncomes.map((income, index) => (
                <motion.div
                  key={income.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/income/${income.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        getSourceColor(income.source) === 'success' ? 'bg-success/10' :
                        getSourceColor(income.source) === 'primary' ? 'bg-primary/10' :
                        getSourceColor(income.source) === 'secondary' ? 'bg-secondary/10' :
                        getSourceColor(income.source) === 'info' ? 'bg-info/10' :
                        getSourceColor(income.source) === 'warning' ? 'bg-warning/10' :
                        'bg-gray-100'
                      }`}>
                        <ApperIcon 
                          name={
                            income.source === 'Crop Sales' ? 'Sprout' :
                            income.source === 'Livestock Sales' ? 'Heart' :
                            income.source === 'Equipment Rental' ? 'Truck' :
                            income.source === 'Government Subsidies' ? 'Building' :
                            income.source === 'Insurance Claims' ? 'Shield' :
                            'TrendingUp'
                          } 
                          size={20} 
                          className={
                            getSourceColor(income.source) === 'success' ? 'text-success' :
                            getSourceColor(income.source) === 'primary' ? 'text-primary' :
                            getSourceColor(income.source) === 'secondary' ? 'text-secondary' :
                            getSourceColor(income.source) === 'info' ? 'text-info' :
                            getSourceColor(income.source) === 'warning' ? 'text-warning' :
                            'text-gray-500'
                          }
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 break-words">{income.description}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{income.source}</span>
                          <span>{format(new Date(income.date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 ml-4">
                      <Badge variant={getSourceColor(income.source)}>
                        {income.source}
                      </Badge>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-success">
                          +${income.amount.toLocaleString()}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteIncome(income.id);
                        }}
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

      {/* Add Income Form Modal */}
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
                  Add New Income
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    type="select"
                    label="Source"
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    options={formSourceOptions}
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
                      Add Income
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

export default Income;