import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { differenceInDays, format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import SkeletonLoader from "@/components/molecules/SkeletonLoader";
import ErrorState from "@/components/molecules/ErrorState";
import EmptyState from "@/components/molecules/EmptyState";
import FormField from "@/components/molecules/FormField";
import { cropService, farmService } from "@/services";
// CropEditForm Component
const CropEditForm = ({ isOpen, onClose, onSubmit, crop, farms, loading }) => {
  const [formData, setFormData] = useState({
    farmId: crop?.farmId || '',
    cropType: crop?.cropType || '',
    area: crop?.area || '',
    plantingDate: crop?.plantingDate || '',
    expectedHarvestDate: crop?.expectedHarvestDate || '',
    status: crop?.status || 'Planted'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (crop) {
      setFormData({
        farmId: crop.farmId || '',
        cropType: crop.cropType || '',
        area: crop.area || '',
        plantingDate: crop.plantingDate || '',
        expectedHarvestDate: crop.expectedHarvestDate || '',
        status: crop.status || 'Planted'
      });
    }
  }, [crop]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.farmId) errors.farmId = 'Please select a farm';
    if (!formData.cropType.trim()) errors.cropType = 'Crop type is required';
    if (!formData.area || formData.area <= 0) errors.area = 'Area must be greater than 0';
    if (!formData.plantingDate) errors.plantingDate = 'Planting date is required';
    if (!formData.expectedHarvestDate) errors.expectedHarvestDate = 'Expected harvest date is required';
    
    if (formData.plantingDate && formData.expectedHarvestDate) {
      if (new Date(formData.expectedHarvestDate) <= new Date(formData.plantingDate)) {
        errors.expectedHarvestDate = 'Harvest date must be after planting date';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        area: parseFloat(formData.area)
      });
    }
  };

  if (!isOpen) return null;

  const farmOptions = [
    { value: '', label: 'Select a farm' },
    ...farms.map(farm => ({ value: farm.id, label: farm.name }))
  ];

  const statusOptions = [
    { value: 'Planted', label: 'Planted' },
    { value: 'Growing', label: 'Growing' },
    { value: 'Ready to Harvest', label: 'Ready to Harvest' },
    { value: 'Harvested', label: 'Harvested' }
  ];

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
            <h2 className="text-xl font-semibold text-gray-900">Edit Crop</h2>
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
              type="text"
              label="Crop Type"
              value={formData.cropType}
              onChange={(e) => handleInputChange('cropType', e.target.value)}
              placeholder="e.g. Corn, Wheat, Tomatoes"
              error={formErrors.cropType}
              required
            />

            <FormField
              type="number"
              label="Area (acres)"
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              error={formErrors.area}
              required
            />

            <FormField
              type="date"
              label="Planting Date"
              value={formData.plantingDate}
              onChange={(e) => handleInputChange('plantingDate', e.target.value)}
              error={formErrors.plantingDate}
              required
            />

            <FormField
              type="date"
              label="Expected Harvest Date"
              value={formData.expectedHarvestDate}
              onChange={(e) => handleInputChange('expectedHarvestDate', e.target.value)}
              error={formErrors.expectedHarvestDate}
              required
            />

            <FormField
              type="select"
              label="Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              options={statusOptions}
              error={formErrors.status}
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
                {loading ? 'Updating...' : 'Update Crop'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const CropDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [farm, setFarm] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  useEffect(() => {
    loadCropData();
  }, [id]);

const loadCropData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cropData, farmsData] = await Promise.all([
        cropService.getById(id),
        farmService.getAll()
      ]);
      
      if (!cropData) {
        setError('Crop not found');
        return;
      }
      
      setCrop(cropData);
      setFarms(farmsData);
      
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

  const handleEditCrop = async (cropData) => {
    setEditLoading(true);
    try {
      const updatedCrop = await cropService.update(id, cropData);
      setCrop(updatedCrop);
      setShowEditForm(false);
      toast.success('Crop updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update crop');
    } finally {
      setEditLoading(false);
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
    if (!crop?.plantingDate || !crop?.expectedHarvestDate) return 0;
    
    try {
      const plantingDate = new Date(crop.plantingDate);
      const harvestDate = new Date(crop.expectedHarvestDate);
      const today = new Date();
      
      // Validate dates
      if (isNaN(plantingDate.getTime()) || isNaN(harvestDate.getTime())) return 0;
      
      const totalDays = differenceInDays(harvestDate, plantingDate);
      const daysPassed = differenceInDays(today, plantingDate);
      
      if (totalDays <= 0) return 0;
      
      const percentage = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);
      return Math.round(percentage);
    } catch (error) {
      console.error('Error calculating progress percentage:', error);
      return 0;
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
        initial={{
            opacity: 0,
            y: -20
        }}
        animate={{
            opacity: 1,
            y: 0
        }}
        className="flex items-center justify-between mb-6">
        <div className="flex items-center">
            <Button
                variant="ghost"
                icon="ArrowLeft"
                onClick={() => navigate("/crops")}
                className="mr-4">Back to Crops
                          </Button>
            <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">{crop?.cropType}</h1>
                <p className="text-gray-600 mt-1">Crop details and management</p>
            </div>
        </div>
        <div className="flex items-center space-x-3">
            <Badge variant={getStatusColor(crop.status)} className="text-sm">
{crop?.status}
        </Badge>
        <Button variant="outline" icon="Edit" onClick={() => setShowEditForm(true)} className="text-black">Edit Crop
                      </Button>
        {crop.status === "Growing" && <Button
                variant="secondary"
                icon="CheckCircle"
                onClick={() => handleStatusUpdate("Ready to Harvest")}
                disabled={statusLoading}
                loading={statusLoading}>Mark Ready
                            </Button>}
            {crop.status === "Ready to Harvest" && <Button
                variant="success"
                icon="CheckCircle2"
                onClick={() => handleStatusUpdate("Harvested")}
                disabled={statusLoading}
                loading={statusLoading}>Mark Harvested
                            </Button>}
        </div>
    </motion.div>
    {/* Crop Information */}
    <motion.div
        initial={{
            opacity: 0,
            y: 20
        }}
        animate={{
            opacity: 1,
            y: 0
        }}
        transition={{
            delay: 0.1
        }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
            <div className="flex items-center mb-4">
                <div
                    className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                    <ApperIcon name="Sprout" size={24} className="text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-lg">Crop Details</h3>
            </div>
            <div className="space-y-3">
                <div>
                    <span className="text-sm text-gray-600">Crop Type</span>
                    <p className="font-medium">{crop?.cropType}</p>
                </div>
                <div>
                    <span className="text-sm text-gray-600">Area</span>
                    <p className="font-medium">{crop?.area}acres</p>
                </div>
                <div>
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="mt-1">
                        <Badge variant={getStatusColor(crop.status)}>
                            {crop?.status}
                        </Badge>
                    </div>
                </div>
            </div>
        </Card>
        <Card>
            <div className="flex items-center mb-4">
                <div
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <ApperIcon name="MapPin" size={24} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg">Farm Information</h3>
            </div>
            <div className="space-y-3">
                {farm ? <>
                    <div>
                        <span className="text-sm text-gray-600">Farm Name</span>
                        <p
                            className="font-medium text-primary cursor-pointer hover:underline"
                            onClick={() => navigate(`/farms/${farm.id}`)}>
                            {farm.name}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Location</span>
                        <p className="font-medium">{farm.location}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Farm Size</span>
                        <p className="font-medium">{farm.size}acres</p>
                    </div>
                </> : <div className="text-gray-500">
                    <p>Farm information not available</p>
                </div>}
            </div>
        </Card>
        <Card>
            <div className="flex items-center mb-4">
                <div
                    className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mr-3">
                    <ApperIcon name="Calendar" size={24} className="text-success" />
                </div>
                <h3 className="font-display font-semibold text-lg">Timeline</h3>
            </div>
            <div className="space-y-3">
                <div>
                    <span className="text-sm text-gray-600">Planted</span>
                    <p className="font-medium">
                        {crop?.plantingDate ? format(new Date(crop.plantingDate), "MMM d, yyyy") : "Not set"}
                    </p>
                </div>
                <div>
                    <span className="text-sm text-gray-600">Expected Harvest</span>
                    <p className="font-medium">
                        {crop?.expectedHarvestDate ? format(new Date(crop.expectedHarvestDate), "MMM d, yyyy") : "Not set"}
                    </p>
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
                                style={{
                                    width: `${progressPercentage}%`
                                }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    </motion.div>
    {/* Growth Timeline */}
    <motion.div
        initial={{
            opacity: 0,
            y: 20
        }}
        animate={{
            opacity: 1,
            y: 0
        }}
        transition={{
            delay: 0.2
        }}>
        <Card>
            <h3 className="font-display font-semibold text-lg mb-6">Growth Timeline</h3>
            <div className="relative">
                <div className="flex items-center justify-between">
                    {/* Planted */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${crop?.status !== "Planted" ? "bg-success text-white" : "bg-info text-white"}`}>
                            <ApperIcon name="Seed" size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">Planted</p>
                            <p className="text-xs text-gray-600">
                                {crop?.plantingDate ? format(new Date(crop.plantingDate), "MMM d") : "Not set"}
                            </p>
                        </div>
                    </div>
                    {/* Growing */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${["Growing", "Ready to Harvest", "Harvested"].includes(crop.status) ? "bg-success text-white" : "bg-gray-200 text-gray-400"}`}>
                            <ApperIcon name="Sprout" size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">Growing</p>
                            <p className="text-xs text-gray-600">In progress</p>
                        </div>
                    </div>
                    {/* Ready to Harvest */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${["Ready to Harvest", "Harvested"].includes(crop.status) ? "bg-success text-white" : "bg-gray-200 text-gray-400"}`}>
                            <ApperIcon name="CheckCircle" size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">Ready</p>
                            <p className="text-xs text-gray-600">To harvest</p>
                        </div>
                    </div>
                    {/* Harvested */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${crop.status === "Harvested" ? "bg-success text-white" : "bg-gray-200 text-gray-400"}`}>
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
                            width: crop.status === "Planted" ? "0%" : crop.status === "Growing" ? "33%" : crop.status === "Ready to Harvest" ? "66%" : crop.status === "Harvested" ? "100%" : "0%"
}}></div>
                </div>
            </div>
        </Card>
    </motion.div>
      {/* Edit Crop Form Modal */}
      <CropEditForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleEditCrop}
        crop={crop}
        farms={farms}
        loading={editLoading}
      />
    </div>
  );
};

export default CropDetails;