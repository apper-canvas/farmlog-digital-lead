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
import FarmForm from '@/components/organisms/FarmForm';
import { farmService, cropService, expenseService } from '@/services';
const FarmDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  useEffect(() => {
    loadFarmData();
  }, [id]);

  const loadFarmData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [farmData, cropsData, expensesData] = await Promise.all([
        farmService.getById(id),
        cropService.getByFarmId(id),
        expenseService.getByFarmId(id)
      ]);
      
if (!farmData) {
        setError('Farm not found');
        return;
      }
      
      setFarm(farmData);
      setCrops(cropsData);
      setExpenses(expensesData);
    } catch (err) {
      setError(err.message || 'Failed to load farm details');
      toast.error('Failed to load farm details');
    } finally {
      setLoading(false);
    }
  };

const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleSaveFarm = (savedFarm) => {
    setFarm(savedFarm);
    setShowEditForm(false);
    toast.success('Farm updated successfully');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      return;
    }

    try {
      await farmService.delete(id);
      toast.success('Farm deleted successfully');
      navigate('/farms');
    } catch (error) {
      toast.error(error.message || 'Failed to delete farm');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'planted': return 'info';
      case 'growing': return 'warning';
      case 'ready to harvest': return 'success';
      case 'harvested': return 'default';
      default: return 'default';
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

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const activeCrops = crops.filter(crop => crop.status !== 'Harvested').length;

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
        <SkeletonLoader count={3} />
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
            onClick={() => navigate('/farms')}
            className="mr-4"
          >
            Back to Farms
          </Button>
        </div>
        <ErrorState message={error} onRetry={loadFarmData} />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            icon="ArrowLeft"
            onClick={() => navigate('/farms')}
            className="mr-4"
          >
            Back to Farms
          </Button>
        </div>
        <EmptyState
          title="Farm not found"
          description="The farm you're looking for doesn't exist or has been deleted."
          actionLabel="Back to Farms"
          onAction={() => navigate('/farms')}
          icon="MapPin"
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
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
            onClick={() => navigate('/farms')}
            className="mr-4"
          >
            Back to Farms
          </Button>
          <div>
<h1 className="text-2xl font-display font-bold text-gray-900">{farm?.name}</h1>
            <p className="text-gray-600 mt-1">Farm details and management</p>
          </div>
        </div>
        
<div className="flex space-x-3">
          <Button
            variant="outline"
            icon="Edit"
            onClick={handleEdit}
            className="text-black"
          >
            Edit Farm
          </Button>
          <Button
            variant="outline"
            icon="Trash2"
            onClick={handleDelete}
            className="text-black hover:bg-error/10 border-error/20"
          >
            Delete Farm
          </Button>
        </div>
      </motion.div>

      {/* Farm Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
      >
        <Card>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="MapPin" size={24} className="text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg">Farm Details</h3>
          </div>
          <div className="space-y-3">
<div>
              <span className="text-sm text-gray-600">Location</span>
              <p className="font-medium">{farm?.location || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Size</span>
              <p className="font-medium">{farm?.size ? `${farm.size} acres` : 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Created</span>
              <p className="font-medium">
                {farm?.createdAt ? format(new Date(farm.createdAt), 'MMM d, yyyy') : 'Not available'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="Sprout" size={24} className="text-secondary" />
            </div>
            <h3 className="font-display font-semibold text-lg">Crops</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Crops</span>
              <Badge variant="primary">{crops.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <Badge variant="success">{activeCrops}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Harvested</span>
              <Badge variant="default">{crops.length - activeCrops}</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="Receipt" size={24} className="text-warning" />
            </div>
            <h3 className="font-display font-semibold text-lg">Expenses</h3>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Total Expenses</span>
              <p className="text-2xl font-bold text-primary">${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Records</span>
              <Badge variant="warning">{expenses.length}</Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Crops Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Crops</h3>
            <Button
              variant="primary"
              size="sm"
              icon="Plus"
              onClick={() => navigate('/crops')}
            >
              Add Crop
            </Button>
          </div>
          
          {crops.length === 0 ? (
            <EmptyState
              title="No crops planted"
              description="Start tracking crops for this farm."
              actionLabel="Add First Crop"
              onAction={() => navigate('/crops')}
              icon="Sprout"
            />
          ) : (
            <div className="space-y-3">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/crops/${crop.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Sprout" size={20} className="text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{crop.cropType}</h4>
                        <p className="text-sm text-gray-600">{crop.area} acres</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
<div className="text-right">
                        <p className="text-sm text-gray-600">Planted</p>
                        <p className="text-sm font-medium">
                          {crop?.plantingDate ? format(new Date(crop.plantingDate), 'MMM d, yyyy') : 'Not set'}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(crop?.status)}>
                        {crop?.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Recent Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Recent Expenses</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/expenses')}
            >
              View All
            </Button>
          </div>
          
          {expenses.length === 0 ? (
            <EmptyState
              title="No expenses recorded"
              description="Start tracking expenses for this farm."
              actionLabel="Add Expense"
              onAction={() => navigate('/expenses')}
              icon="Receipt"
            />
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/expenses/${expense.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        getCategoryColor(expense.category) === 'primary' ? 'bg-primary/10' :
                        getCategoryColor(expense.category) === 'secondary' ? 'bg-secondary/10' :
                        getCategoryColor(expense.category) === 'success' ? 'bg-success/10' :
                        getCategoryColor(expense.category) === 'warning' ? 'bg-warning/10' :
                        getCategoryColor(expense.category) === 'accent' ? 'bg-accent/10' :
                        getCategoryColor(expense.category) === 'info' ? 'bg-info/10' :
                        'bg-gray-100'
                      }`}>
                        <ApperIcon name="Receipt" size={20} className={
                          getCategoryColor(expense.category) === 'primary' ? 'text-primary' :
                          getCategoryColor(expense.category) === 'secondary' ? 'text-secondary' :
                          getCategoryColor(expense.category) === 'success' ? 'text-success' :
                          getCategoryColor(expense.category) === 'warning' ? 'text-warning' :
                          getCategoryColor(expense.category) === 'accent' ? 'text-accent' :
                          getCategoryColor(expense.category) === 'info' ? 'text-info' :
                          'text-gray-500'
                        } />
                      </div>
<div>
                        <h4 className="font-medium text-gray-900">{expense.description}</h4>
                        <p className="text-sm text-gray-600">{format(new Date(expense.date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${expense.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {expenses.length > 5 && (
                <div className="text-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/expenses')}
                  >
                    View {expenses.length - 5} more expenses
                  </Button>
                </div>
              )}
</div>
          )}
        </Card>
      </motion.div>

      {/* Edit Farm Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <FarmForm
            farm={farm}
            onSave={handleSaveFarm}
            onCancel={() => setShowEditForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default FarmDetails;