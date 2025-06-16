import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import { farmService } from '@/services';

const FarmForm = ({ farm, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: farm?.name || '',
    size: farm?.size || '',
    location: farm?.location || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Farm name is required';
    }
    
    if (!formData.size || formData.size <= 0) {
      newErrors.size = 'Farm size must be greater than 0';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const farmData = {
        ...formData,
        size: parseFloat(formData.size)
      };

      let savedFarm;
      if (farm) {
        savedFarm = await farmService.update(farm.id, farmData);
        toast.success('Farm updated successfully');
      } else {
        savedFarm = await farmService.create(farmData);
        toast.success('Farm created successfully');
      }

      onSave(savedFarm);
    } catch (error) {
      toast.error(error.message || 'Failed to save farm');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
    >
      <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
        {farm ? 'Edit Farm' : 'Add New Farm'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Farm Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          icon="MapPin"
        />

        <FormField
          label="Size (acres)"
          name="size"
          type="number"
          value={formData.size}
          onChange={handleChange}
          error={errors.size}
          required
          icon="Maximize"
          min="0"
          step="0.1"
        />

        <FormField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          error={errors.location}
          required
          icon="MapPin"
        />

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            {farm ? 'Update Farm' : 'Create Farm'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default FarmForm;