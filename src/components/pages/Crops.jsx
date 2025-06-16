import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import SkeletonLoader from "@/components/molecules/SkeletonLoader";
import ErrorState from "@/components/molecules/ErrorState";
import EmptyState from "@/components/molecules/EmptyState";
import { cropService, farmService } from "@/services";

// CropForm Component
const CropForm = ({ isOpen, onClose, onSubmit, farms, loading }) => {
  const [formData, setFormData] = useState({
    farmId: '',
    cropType: '',
    area: '',
    plantingDate: '',
    expectedHarvestDate: ''
  });
  const [formErrors, setFormErrors] = useState({});

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
        area: parseFloat(formData.area),
        status: 'Planted'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      farmId: '',
      cropType: '',
      area: '',
      plantingDate: '',
      expectedHarvestDate: ''
    });
    setFormErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const farmOptions = [
    { value: '', label: 'Select a farm' },
    ...farms.map(farm => ({ value: farm.id, label: farm.name }))
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
            <h2 className="text-xl font-semibold text-gray-900">Add New Crop</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
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

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
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
                {loading ? 'Adding...' : 'Add Crop'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Crops = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [farmFilter, setFarmFilter] = useState('');
  const [showCropForm, setShowCropForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);
      setCrops(cropsData);
      setFarms(farmsData);
    } catch (err) {
      setError(err.message || 'Failed to load crops');
      toast.error('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.cropType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || crop.status === statusFilter;
    const matchesFarm = !farmFilter || crop.farmId === farmFilter;
    
    return matchesSearch && matchesStatus && matchesFarm;
  });

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'planted': return 'info';
      case 'growing': return 'warning';
      case 'ready to harvest': return 'success';
      case 'harvested': return 'default';
      default: return 'default';
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Planted', label: 'Planted' },
    { value: 'Growing', label: 'Growing' },
    { value: 'Ready to Harvest', label: 'Ready to Harvest' },
    { value: 'Harvested', label: 'Harvested' }
  ];

  const farmOptions = [
    { value: '', label: 'All Farms' },
    ...farms.map(farm => ({ value: farm.id, label: farm.name }))
  ];

  const handleStatusUpdate = async (cropId, newStatus) => {
    try {
      const updatedCrop = await cropService.update(cropId, { status: newStatus });
      setCrops(prev => prev.map(crop => 
        crop.id === cropId ? updatedCrop : crop
      ));
      toast.success('Crop status updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update crop status');
    }
};

  const handleAddCrop = async (cropData) => {
    setFormLoading(true);
    try {
      const newCrop = await cropService.create(cropData);
      setCrops(prev => [...prev, newCrop]);
      setShowCropForm(false);
      toast.success('Crop added successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to add crop');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <SkeletonLoader count={1} type="table" />
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
        initial={{
            opacity: 0,
            y: -20
        }}
        animate={{
            opacity: 1,
            y: 0
        }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Crops</h1>
            <p className="text-gray-600 mt-1">Track all your crops across different farms
                          </p>
        </div>
        <Button
            variant="primary"
            onClick={() => setShowCropForm(true)}
            className="mt-4 sm:mt-0">
            <ApperIcon name="Plus" size={20} className="mr-2" />Add New Crop
                    </Button>
    </motion.div>
    {/* Filters */}
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
        className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search crops..."
            className="flex-1 max-w-md" />
        <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={statusOptions}
            className="w-full sm:w-48" />
        <Select
            value={farmFilter}
            onChange={e => setFarmFilter(e.target.value)}
            options={farmOptions}
            className="w-full sm:w-48" />
    </motion.div>
    {/* Crops List */}
    {filteredCrops.length === 0 ? searchTerm || statusFilter || farmFilter ? <EmptyState
        title="No crops found"
        description="No crops match your current filters. Try adjusting your search criteria."
        icon="Search" /> : <EmptyState
        title="No crops planted yet"
        description="Start tracking your agricultural production by adding crop information."
        actionLabel="Go to Farms"
        onAction={() => window.location.href = "/farms"}
        icon="Sprout" /> : <motion.div
        initial={{
            opacity: 0
        }}
        animate={{
            opacity: 1
        }}
        transition={{
            delay: 0.2
        }}>
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop
                                                    </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm
                                                    </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area
                                                    </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planted
                                                    </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Harvest
                                                    </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status
                                                    </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions
                                                    </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCrops.map((crop, index) => <motion.tr
                            key={crop.id}
                            initial={{
                                opacity: 0,
                                x: -20
                            }}
                            animate={{
                                opacity: 1,
                                x: 0
                            }}
                            transition={{
                                delay: index * 0.05
}}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/crops/${crop.id}`)}
                            >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div
                                        className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                                        <ApperIcon name="Sprout" size={20} className="text-secondary" />
                                    </div>
                                    <div className="font-medium text-gray-900 break-words">{crop.cropType}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 break-words">
                                {getFarmName(crop.farmId)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {crop.area}acres
                                                      </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {format(new Date(crop.plantingDate), "MMM d, yyyy")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {format(new Date(crop.expectedHarvestDate), "MMM d, yyyy")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={getStatusColor(crop.status)}>
                                    {crop.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                    {crop.status === "Growing" && <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleStatusUpdate(crop.id, "Ready to Harvest")}>Mark Ready
                                                                    </Button>}
                                    {crop.status === "Ready to Harvest" && <Button
                                        size="sm"
                                        variant="success"
                                        onClick={() => handleStatusUpdate(crop.id, "Harvested")}>Harvested
                                                                    </Button>}
                                </div>
                            </td>
                        </motion.tr>)}
                    </tbody>
                </table>
            </div>
        </Card>
</motion.div>}
    
    {/* Crop Form Modal */}
    <CropForm
      isOpen={showCropForm}
      onClose={() => setShowCropForm(false)}
      onSubmit={handleAddCrop}
      farms={farms}
      loading={formLoading}
    />
  </div>
  );
};

export default Crops;