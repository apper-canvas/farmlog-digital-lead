import { toast } from 'react-toastify';

class ExpenseService {
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
        Fields: ['Name', 'amount', 'category', 'date', 'description', 'farm_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.fetchRecords('expense', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
return response.data?.map(expense => ({
        id: expense.Id,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        description: expense.description || expense.Name,
        farmId: expense.farm_id,
        tags: expense.Tags
      })) || [];
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Name', 'amount', 'category', 'date', 'description', 'farm_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.getRecordById('expense', id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
if (!response.data) return null;
      
      return {
        id: response.data.Id,
        amount: response.data.amount,
        category: response.data.category,
        date: response.data.date,
        description: response.data.description || response.data.Name,
        farmId: response.data.farm_id,
        tags: response.data.Tags
      };
    } catch (error) {
      console.error(`Error fetching expense with ID ${id}:`, error);
      throw error;
    }
  }

  async getByFarmId(farmId) {
    try {
      const params = {
        Fields: ['Name', 'amount', 'category', 'date', 'description', 'farm_id'],
        where: [{
          FieldName: "farm_id",
          Operator: "ExactMatch",
          Values: [farmId.toString()]
        }]
      };
      
      const response = await this.apperClient.fetchRecords('expense', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data?.map(expense => ({
id: expense.Id,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        description: expense.description || expense.Name,
        farmId: expense.farm_id,
        tags: expense.Tags
      })) || [];
    } catch (error) {
      console.error(`Error fetching expenses for farm ${farmId}:`, error);
      throw error;
    }
  }

  async create(expenseData) {
    try {
      const params = {
        records: [{
          Name: expenseData.description,
          amount: parseFloat(expenseData.amount),
          category: expenseData.category,
          date: expenseData.date,
          description: expenseData.description,
          farm_id: parseInt(expenseData.farmId)
        }]
      };
      
      const response = await this.apperClient.createRecord('expense', params);
      
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
          const newExpense = successfulRecords[0].data;
          return {
            id: newExpense.Id,
            amount: newExpense.amount,
            category: newExpense.category,
            date: newExpense.date,
            description: newExpense.description,
            farmId: newExpense.farm_id
          };
        }
      }
      
      throw new Error('Failed to create expense');
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  }

  async update(id, expenseData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };
      
      // Only include fields that are being updated
      if (expenseData.description !== undefined) {
        updateData.Name = expenseData.description;
        updateData.description = expenseData.description;
      }
      if (expenseData.amount !== undefined) updateData.amount = parseFloat(expenseData.amount);
      if (expenseData.category !== undefined) updateData.category = expenseData.category;
      if (expenseData.date !== undefined) updateData.date = expenseData.date;
      if (expenseData.farmId !== undefined) updateData.farm_id = parseInt(expenseData.farmId);
      
      const params = {
        records: [updateData]
      };
      
      const response = await this.apperClient.updateRecord('expense', params);
      
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
          const updatedExpense = successfulUpdates[0].data;
          return {
            id: updatedExpense.Id,
            amount: updatedExpense.amount,
            category: updatedExpense.category,
            date: updatedExpense.date,
            description: updatedExpense.description,
            farmId: updatedExpense.farm_id
          };
        }
      }
      
      throw new Error('Failed to update expense');
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('expense', params);
      
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
      console.error("Error deleting expense:", error);
      throw error;
    }
  }
}

export default new ExpenseService();