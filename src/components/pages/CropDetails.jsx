import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import { cropService, farmService } from '@/services';

const CropDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    loadCropData();
  }, [id]);

  const loadCropData = async () => {
    setLoading(true);
    setError(null);
    try {
      const cropData = await cropService.getById(id);
      
      if (!cropData) {
        setError('Crop not found');
        return;
      }
      
      setCrop(cropData);
      
      // Load farm data if farmId exists
      if (cropData.farmId) {
        const farmData = await farmService.getById(cropData.farmId);
        setFarm(farmData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load crop details');
      toast.error('Failed to load crop details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setStatusLoading(true);
    try {
      const updatedCrop = await cropService.update(id, { status: newStatus });
      setCrop(updatedCrop);
      toast.success(`Crop status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update crop status');
    } finally {
      setStatusLoading(false);
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

  const getProgressPercentage = () => {
    if (!crop) return 0;
    
    const plantingDate = new Date(crop.plantingDate);
    const harvestDate = new Date(crop.expectedHarvestDate);
    const today = new Date();
    
    const totalDays = differenceInDays(harvestDate, plantingDate);
    const daysPassed = differenceInDays(today, plantingDate);
    
    const percentage = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);
    return Math.round(percentage);
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
            onClick={() => navigate('/crops')}
            className="mr-4"
          >
            Back to Crops
          </Button>
        </div>
        <ErrorState message={error} onRetry={loadCropData} />
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            icon="ArrowLeft"
            onClick={() => navigate('/crops')}
            className="mr-4"
          >
            Back to Crops
          </Button>
        </div>
        <EmptyState
          title="Crop not found"
          description="The crop you're looking for doesn't exist or has been deleted."
          actionLabel="Back to Crops"
          onAction={() => navigate('/crops')}
          icon="Sprout"
        />
      </div>
    );
  }

  const progressPercentage = getProgressPercentage();

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
            onClick={() => navigate('/crops')}
            className="mr-4"
          >
            Back to Crops
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">{crop.cropType}</h1>
            <p className="text-gray-600 mt-1">Crop details and management</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={getStatusColor(crop.status)} className="text-sm">
            {crop.status}
          </Badge>
          {crop.status === 'Growing' && (
            <Button
              variant="secondary"
              icon="CheckCircle"
              onClick={() => handleStatusUpdate('Ready to Harvest')}
              disabled={statusLoading}
              loading={statusLoading}
            >
              Mark Ready
            </Button>
          )}
          {crop.status === 'Ready to Harvest' && (
            <Button
              variant="success"
              icon="CheckCircle2"
              onClick={() => handleStatusUpdate('Harvested')}
              disabled={statusLoading}
              loading={statusLoading}
            >
              Mark Harvested
            </Button>
          )}
        </div>
      </motion.div>

      {/* Crop Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
      >
        <Card>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="Sprout" size={24} className="text-secondary" />
            </div>
            <h3 className="font-display font-semibold text-lg">Crop Details</h3>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Crop Type</span>
              <p className="font-medium">{crop.cropType}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Area</span>
              <p className="font-medium">{crop.area} acres</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Status</span>
              <div className="mt-1">
                <Badge variant={getStatusColor(crop.status)}>
                  {crop.status}
                </Badge>
              </div>
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
          <div className="space-y-3">
            {farm ? (
              <>
                <div>
                  <span className="text-sm text-gray-600">Farm Name</span>
                  <p 
                    className="font-medium text-primary cursor-pointer hover:underline"
                    onClick={() => navigate(`/farms/${farm.id}`)}
                  >
                    {farm.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Location</span>
                  <p className="font-medium">{farm.location}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Farm Size</span>
                  <p className="font-medium">{farm.size} acres</p>
                </div>
              </>
            ) : (
              <div className="text-gray-500">
                <p>Farm information not available</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="Calendar" size={24} className="text-success" />
            </div>
            <h3 className="font-display font-semibold text-lg">Timeline</h3>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Planted</span>
              <p className="font-medium">{format(new Date(crop.plantingDate), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Expected Harvest</span>
              <p className="font-medium">{format(new Date(crop.expectedHarvestDate), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Progress</span>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Growth Progress</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Growth Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="font-display font-semibold text-lg mb-6">Growth Timeline</h3>
          <div className="relative">
            <div className="flex items-center justify-between">
              {/* Planted */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  crop.status !== 'Planted' ? 'bg-success text-white' : 'bg-info text-white'
                }`}>
                  <ApperIcon name="Seed" size={20} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Planted</p>
                  <p className="text-xs text-gray-600">{format(new Date(crop.plantingDate), 'MMM d')}</p>
                </div>
              </div>

              {/* Growing */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  ['Growing', 'Ready to Harvest', 'Harvested'].includes(crop.status) 
                    ? 'bg-success text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <ApperIcon name="Sprout" size={20} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Growing</p>
                  <p className="text-xs text-gray-600">In progress</p>
                </div>
              </div>

              {/* Ready to Harvest */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  ['Ready to Harvest', 'Harvested'].includes(crop.status)
                    ? 'bg-success text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <ApperIcon name="CheckCircle" size={20} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Ready</p>
                  <p className="text-xs text-gray-600">To harvest</p>
                </div>
              </div>

              {/* Harvested */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  crop.status === 'Harvested'
                    ? 'bg-success text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <ApperIcon name="CheckCircle2" size={20} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Harvested</p>
                  <p className="text-xs text-gray-600">Complete</p>
                </div>
              </div>
            </div>

            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 -z-10">
              <div 
                className="h-full bg-success transition-all duration-300"
                style={{ 
                  width: crop.status === 'Planted' ? '0%' :
                         crop.status === 'Growing' ? '33%' :
                         crop.status === 'Ready to Harvest' ? '66%' :
                         crop.status === 'Harvested' ? '100%' : '0%'
                }}
              ></div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default CropDetails;