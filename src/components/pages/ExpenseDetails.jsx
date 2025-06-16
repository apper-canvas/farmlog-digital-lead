import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import FormField from '@/components/molecules/FormField';
import { expenseService, farmService } from '@/services';
// ExpenseEditForm Component
const ExpenseEditForm = ({ isOpen, onClose, onSubmit, expense, farms, loading }) => {
  const [formData, setFormData] = useState({
    farmId: expense?.farmId || '',
    amount: expense?.amount || '',
    category: expense?.category || '',
    date: expense?.date || '',
    description: expense?.description || ''
  });
  const [formErrors, setFormErrors] = useState({});

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
    if (expense) {
      setFormData({
        farmId: expense.farmId || '',
        amount: expense.amount || '',
        category: expense.category || '',
        date: expense.date || '',
        description: expense.description || ''
      });
    }
  }, [expense]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.farmId) errors.farmId = 'Please select a farm';
    if (!formData.amount || formData.amount <= 0) errors.amount = 'Amount must be greater than 0';
    if (!formData.category) errors.category = 'Please select a category';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.description.trim()) errors.description = 'Description is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
      });
    }
  };

  if (!isOpen) return null;

  const farmOptions = [
    { value: '', label: 'Select a farm' },
    ...farms.map(farm => ({ value: farm.id, label: farm.name }))
  ];

  const categoryOptions = categories.map(category => ({ value: category, label: category }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Expense</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              type="select"
              label="Farm"
              value={formData.farmId}
              onChange={(e) => handleInputChange('farmId', e.target.value)}
              options={farmOptions}
              error={formErrors.farmId}
              required
            />

            <FormField
              type="number"
              label="Amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              error={formErrors.amount}
              required
            />

            <FormField
              type="select"
              label="Category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              options={categoryOptions}
              error={formErrors.category}
              required
            />

            <FormField
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              error={formErrors.date}
              required
            />

            <FormField
              type="text"
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter expense description"
              error={formErrors.description}
              required
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
                loading={loading}
              >
                {loading ? 'Updating...' : 'Update Expense'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [farm, setFarm] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadExpenseData();
  }, [id]);

const loadExpenseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expenseData, farmsData] = await Promise.all([
        expenseService.getById(id),
        farmService.getAll()
      ]);
      
      if (!expenseData) {
        setError('Expense not found');
        return;
      }
      
      setExpense(expenseData);
      setFarms(farmsData);
      
      // Load farm data if farmId exists
      if (expenseData.farmId) {
        const farmData = await farmService.getById(expenseData.farmId);
        setFarm(farmData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load expense details');
      toast.error('Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseService.delete(id);
      toast.success('Expense deleted successfully');
      navigate('/expenses');
    } catch (error) {
      toast.error(error.message || 'Failed to delete expense');
    }
};

  const handleEditExpense = async (expenseData) => {
    setEditLoading(true);
    try {
      const updatedExpense = await expenseService.update(id, expenseData);
      setExpense(updatedExpense);
      setShowEditForm(false);
      toast.success('Expense updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update expense');
    } finally {
      setEditLoading(false);
    }
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
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Seeds': return 'Sprout';
      case 'Fertilizer': return 'Droplets';
      case 'Equipment': return 'Wrench';
      case 'Labor': return 'Users';
      case 'Fuel': return 'Fuel';
      case 'Maintenance': return 'Settings';
      default: return 'Receipt';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
        <SkeletonLoader count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            icon="ArrowLeft"
            onClick={() => navigate('/expenses')}
            className="mr-4"
          >
            Back to Expenses
          </Button>
        </div>
        <ErrorState message={error} onRetry={loadExpenseData} />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            icon="ArrowLeft"
            onClick={() => navigate('/expenses')}
            className="mr-4"
          >
            Back to Expenses
          </Button>
        </div>
        <EmptyState
          title="Expense not found"
          description="The expense you're looking for doesn't exist or has been deleted."
          actionLabel="Back to Expenses"
          onAction={() => navigate('/expenses')}
          icon="Receipt"
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center">
          <Button
            variant="ghost"
            icon="ArrowLeft"
            onClick={() => navigate('/expenses')}
            className="mr-4"
          >
            Back to Expenses
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Expense Details</h1>
            <p className="text-gray-600 mt-1">View and manage expense information</p>
          </div>
        </div>
        
<div className="flex space-x-3">
          <Button
            variant="outline"
            icon="Edit"
            onClick={() => setShowEditForm(true)}
          >
            Edit Expense
          </Button>
          <Button
            variant="outline"
            icon="Trash2"
            onClick={handleDelete}
            className="text-error hover:bg-error/10 border-error/20"
          >
            Delete Expense
          </Button>
        </div>
      </motion.div>

      {/* Expense Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
      >
        <Card>
          <div className="flex items-center mb-6">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center mr-4 ${
              getCategoryColor(expense.category) === 'primary' ? 'bg-primary/10' :
              getCategoryColor(expense.category) === 'secondary' ? 'bg-secondary/10' :
              getCategoryColor(expense.category) === 'success' ? 'bg-success/10' :
              getCategoryColor(expense.category) === 'warning' ? 'bg-warning/10' :
              getCategoryColor(expense.category) === 'accent' ? 'bg-accent/10' :
              getCategoryColor(expense.category) === 'info' ? 'bg-info/10' :
              'bg-gray-100'
            }`}>
              <ApperIcon 
                name={getCategoryIcon(expense.category)} 
                size={32} 
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
            <div>
              <h3 className="font-display font-semibold text-2xl text-gray-900">
${expense?.amount?.toLocaleString()}
              </h3>
              <div className="mt-2">
                <Badge variant={getCategoryColor(expense.category)} className="text-sm">
{expense?.category}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-600">Description</span>
<p className="font-medium text-gray-900 mt-1">{expense?.description}</p>
            </div>
            <div>
<span className="text-sm text-gray-600">Date</span>
              <p className="font-medium text-gray-900 mt-1">
                {expense?.date ? format(new Date(expense.date), 'EEEE, MMMM d, yyyy') : 'Date not available'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="MapPin" size={24} className="text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg">Farm Information</h3>
          </div>
          
          <div className="space-y-4">
            {farm ? (
              <>
                <div>
                  <span className="text-sm text-gray-600">Farm Name</span>
                  <p 
                    className="font-medium text-primary cursor-pointer hover:underline mt-1"
                    onClick={() => navigate(`/farms/${farm.id}`)}
                  >
                    {farm.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Location</span>
                  <p className="font-medium text-gray-900 mt-1">{farm.location}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Farm Size</span>
                  <p className="font-medium text-gray-900 mt-1">{farm.size} acres</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/farms/${farm.id}`)}
                    className="w-full"
                  >
                    View Farm Details
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-gray-500">
                <p>Farm information not available</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="font-display font-semibold text-lg mb-4">Expense Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">
${expense?.amount?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary mb-1">
{expense?.category}
              </div>
              <div className="text-sm text-gray-600">Category</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
<div className="text-2xl font-bold text-success mb-1">
                {expense?.date ? format(new Date(expense.date), 'MMM yyyy') : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Month</div>
            </div>
          </div>
</Card>
      </motion.div>

      {/* Edit Expense Form Modal */}
      <ExpenseEditForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleEditExpense}
        expense={expense}
        farms={farms}
        loading={editLoading}
      />
    </div>
  );
};

export default ExpenseDetails;