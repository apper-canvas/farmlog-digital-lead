import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import FarmCard from '@/components/organisms/FarmCard';
import FarmForm from '@/components/organisms/FarmForm';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import { farmService, cropService } from '@/services';

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [farmsData, cropsData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll()
      ]);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError(err.message || 'Failed to load farms');
      toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const filteredFarms = farms.filter(farm =>
    farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCropsCount = (farmId) => {
    return crops.filter(crop => crop.farmId === farmId).length;
  };

  const handleCreateFarm = () => {
    setSelectedFarm(null);
    setShowForm(true);
  };

  const handleEditFarm = (farm) => {
    setSelectedFarm(farm);
    setShowForm(true);
  };

  const handleDeleteFarm = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      return;
    }

    try {
      await farmService.delete(farmId);
      setFarms(prev => prev.filter(farm => farm.id !== farmId));
      setCrops(prev => prev.filter(crop => crop.farmId !== farmId));
      toast.success('Farm deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete farm');
    }
  };

  const handleSaveFarm = (savedFarm) => {
    if (selectedFarm) {
      setFarms(prev => prev.map(farm => 
        farm.id === savedFarm.id ? savedFarm : farm
      ));
    } else {
      setFarms(prev => [...prev, savedFarm]);
    }
    setShowForm(false);
    setSelectedFarm(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedFarm(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <SkeletonLoader count={6} />
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
          <h1 className="text-2xl font-display font-bold text-gray-900">Farms</h1>
          <p className="text-gray-600 mt-1">
            Manage your farms and track their basic information
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            icon="Plus"
            onClick={handleCreateFarm}
          >
            Add Farm
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search farms by name or location..."
          className="max-w-md"
        />
      </motion.div>

      {/* Farms Grid */}
      {filteredFarms.length === 0 ? (
        searchTerm ? (
          <EmptyState
            title="No farms found"
            description={`No farms match your search for "${searchTerm}"`}
            icon="Search"
          />
        ) : (
          <EmptyState
            title="No farms yet"
            description="Start by adding your first farm to begin tracking your agricultural operations."
            actionLabel="Add Your First Farm"
            onAction={handleCreateFarm}
            icon="MapPin"
          />
        )
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredFarms.map((farm, index) => (
            <motion.div
              key={farm.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FarmCard
                farm={farm}
                cropsCount={getCropsCount(farm.id)}
                onEdit={handleEditFarm}
                onDelete={handleDeleteFarm}
                onView={() => {/* TODO: Navigate to farm details */}}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Farm Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={handleCancelForm}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <FarmForm
                  farm={selectedFarm}
                  onSave={handleSaveFarm}
                  onCancel={handleCancelForm}
                />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Farms;