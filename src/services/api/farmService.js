import { toast } from 'react-toastify';

class FarmService {
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
        Fields: ['Name', 'size', 'location', 'created_at', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.fetchRecords('farm', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data?.map(farm => ({
        id: farm.Id,
        name: farm.Name,
        size: farm.size,
        location: farm.location,
        createdAt: farm.created_at || farm.CreatedOn
      })) || [];
    } catch (error) {
      console.error("Error fetching farms:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Name', 'size', 'location', 'created_at', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.getRecordById('farm', id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) return null;
      
      return {
        id: response.data.Id,
        name: response.data.Name,
        size: response.data.size,
        location: response.data.location,
        createdAt: response.data.created_at || response.data.CreatedOn
      };
    } catch (error) {
      console.error(`Error fetching farm with ID ${id}:`, error);
      throw error;
    }
  }

  async create(farmData) {
    try {
      const params = {
        records: [{
          Name: farmData.name,
          size: farmData.size,
          location: farmData.location,
          created_at: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.createRecord('farm', params);
      
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
          const newFarm = successfulRecords[0].data;
          return {
            id: newFarm.Id,
            name: newFarm.Name,
            size: newFarm.size,
            location: newFarm.location,
            createdAt: newFarm.created_at
          };
        }
      }
      
      throw new Error('Failed to create farm');
    } catch (error) {
      console.error("Error creating farm:", error);
      throw error;
    }
  }

  async update(id, farmData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: farmData.name,
          size: farmData.size,
          location: farmData.location
        }]
      };
      
      const response = await this.apperClient.updateRecord('farm', params);
      
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
          const updatedFarm = successfulUpdates[0].data;
          return {
            id: updatedFarm.Id,
            name: updatedFarm.Name,
            size: updatedFarm.size,
            location: updatedFarm.location,
            createdAt: updatedFarm.created_at
          };
        }
      }
      
      throw new Error('Failed to update farm');
    } catch (error) {
      console.error("Error updating farm:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('farm', params);
      
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
      console.error("Error deleting farm:", error);
      throw error;
    }
  }
}

export default new FarmService();