import { toast } from 'react-toastify';

class CropService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getAll() {
    try {
      const params = {
        Fields: ['Name', 'crop_type', 'planting_date', 'expected_harvest_date', 'status', 'area', 'farm_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.fetchRecords('crop', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data?.map(crop => ({
        id: crop.Id,
        name: crop.Name,
        cropType: crop.crop_type,
        plantingDate: crop.planting_date,
        expectedHarvestDate: crop.expected_harvest_date,
        status: crop.status,
        area: crop.area,
        farmId: crop.farm_id
      })) || [];
    } catch (error) {
      console.error("Error fetching crops:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Name', 'crop_type', 'planting_date', 'expected_harvest_date', 'status', 'area', 'farm_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.getRecordById('crop', id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) return null;
      
      return {
        id: response.data.Id,
        name: response.data.Name,
        cropType: response.data.crop_type,
        plantingDate: response.data.planting_date,
        expectedHarvestDate: response.data.expected_harvest_date,
        status: response.data.status,
        area: response.data.area,
        farmId: response.data.farm_id
      };
    } catch (error) {
      console.error(`Error fetching crop with ID ${id}:`, error);
      throw error;
    }
  }

  async getByFarmId(farmId) {
    try {
      const params = {
        Fields: ['Name', 'crop_type', 'planting_date', 'expected_harvest_date', 'status', 'area', 'farm_id'],
        where: [{
          FieldName: "farm_id",
          Operator: "ExactMatch",
          Values: [farmId.toString()]
        }]
      };
      
      const response = await this.apperClient.fetchRecords('crop', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data?.map(crop => ({
        id: crop.Id,
        name: crop.Name,
        cropType: crop.crop_type,
        plantingDate: crop.planting_date,
        expectedHarvestDate: crop.expected_harvest_date,
        status: crop.status,
        area: crop.area,
        farmId: crop.farm_id
      })) || [];
    } catch (error) {
      console.error(`Error fetching crops for farm ${farmId}:`, error);
      throw error;
    }
  }

  async create(cropData) {
    try {
      const params = {
        records: [{
          Name: cropData.cropType,
          crop_type: cropData.cropType,
          planting_date: cropData.plantingDate,
          expected_harvest_date: cropData.expectedHarvestDate,
          status: cropData.status || 'Planted',
          area: parseFloat(cropData.area),
          farm_id: parseInt(cropData.farmId)
        }]
      };
      
      const response = await this.apperClient.createRecord('crop', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          const newCrop = successfulRecords[0].data;
          return {
            id: newCrop.Id,
            name: newCrop.Name,
            cropType: newCrop.crop_type,
            plantingDate: newCrop.planting_date,
            expectedHarvestDate: newCrop.expected_harvest_date,
            status: newCrop.status,
            area: newCrop.area,
            farmId: newCrop.farm_id
          };
        }
      }
      
      throw new Error('Failed to create crop');
    } catch (error) {
      console.error("Error creating crop:", error);
      throw error;
    }
  }

  async update(id, cropData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };
      
      // Only include fields that are being updated
      if (cropData.cropType !== undefined) {
        updateData.Name = cropData.cropType;
        updateData.crop_type = cropData.cropType;
      }
      if (cropData.plantingDate !== undefined) updateData.planting_date = cropData.plantingDate;
      if (cropData.expectedHarvestDate !== undefined) updateData.expected_harvest_date = cropData.expectedHarvestDate;
      if (cropData.status !== undefined) updateData.status = cropData.status;
      if (cropData.area !== undefined) updateData.area = parseFloat(cropData.area);
      if (cropData.farmId !== undefined) updateData.farm_id = parseInt(cropData.farmId);
      
      const params = {
        records: [updateData]
      };
      
      const response = await this.apperClient.updateRecord('crop', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          const updatedCrop = successfulUpdates[0].data;
          return {
            id: updatedCrop.Id,
            name: updatedCrop.Name,
            cropType: updatedCrop.crop_type,
            plantingDate: updatedCrop.planting_date,
            expectedHarvestDate: updatedCrop.expected_harvest_date,
            status: updatedCrop.status,
            area: updatedCrop.area,
            farmId: updatedCrop.farm_id
          };
        }
      }
      
      throw new Error('Failed to update crop');
    } catch (error) {
      console.error("Error updating crop:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('crop', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting crop:", error);
      throw error;
    }
  }
}

export default new CropService();