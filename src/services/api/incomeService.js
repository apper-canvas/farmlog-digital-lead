import { toast } from 'react-toastify';

class IncomeService {
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
        Fields: ['Name', 'Source', 'Amount', 'Date', 'Description', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.fetchRecords('Income', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data?.map(income => ({
        id: income.Id,
        source: income.Source,
        amount: income.Amount,
        date: income.Date,
        description: income.Description || income.Name,
        tags: income.Tags
      })) || [];
    } catch (error) {
      console.error("Error fetching income:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Name', 'Source', 'Amount', 'Date', 'Description', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.getRecordById('Income', id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) return null;
      
      return {
        id: response.data.Id,
        source: response.data.Source,
        amount: response.data.Amount,
        date: response.data.Date,
        description: response.data.Description || response.data.Name,
        tags: response.data.Tags
      };
    } catch (error) {
      console.error(`Error fetching income with ID ${id}:`, error);
      throw error;
    }
  }

  async create(incomeData) {
    try {
      const params = {
        records: [{
          Name: incomeData.description,
          Source: incomeData.source,
          Amount: parseFloat(incomeData.amount),
          Date: incomeData.date,
          Description: incomeData.description
        }]
      };
      
      const response = await this.apperClient.createRecord('Income', params);
      
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
          const newIncome = successfulRecords[0].data;
          return {
            id: newIncome.Id,
            source: newIncome.Source,
            amount: newIncome.Amount,
            date: newIncome.Date,
            description: newIncome.Description
          };
        }
      }
      
      throw new Error('Failed to create income');
    } catch (error) {
      console.error("Error creating income:", error);
      throw error;
    }
  }

  async update(id, incomeData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };
      
      // Only include fields that are being updated
      if (incomeData.description !== undefined) {
        updateData.Name = incomeData.description;
        updateData.Description = incomeData.description;
      }
      if (incomeData.source !== undefined) updateData.Source = incomeData.source;
      if (incomeData.amount !== undefined) updateData.Amount = parseFloat(incomeData.amount);
      if (incomeData.date !== undefined) updateData.Date = incomeData.date;
      
      const params = {
        records: [updateData]
      };
      
      const response = await this.apperClient.updateRecord('Income', params);
      
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
          const updatedIncome = successfulUpdates[0].data;
          return {
            id: updatedIncome.Id,
            source: updatedIncome.Source,
            amount: updatedIncome.Amount,
            date: updatedIncome.Date,
            description: updatedIncome.Description
          };
        }
      }
      
      throw new Error('Failed to update income');
    } catch (error) {
      console.error("Error updating income:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('Income', params);
      
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
      console.error("Error deleting income:", error);
      throw error;
    }
  }
}

export default new IncomeService();