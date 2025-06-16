import { toast } from 'react-toastify';

class TaskService {
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
        Fields: ['Name', 'title', 'description', 'due_date', 'priority', 'completed', 'created_at', 'farm_id', 'crop_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data?.map(task => ({
        id: task.Id,
        title: task.title || task.Name,
        description: task.description,
        dueDate: task.due_date,
        priority: task.priority,
        completed: task.completed,
        createdAt: task.created_at || task.CreatedOn,
        farmId: task.farm_id,
        cropId: task.crop_id
      })) || [];
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Name', 'title', 'description', 'due_date', 'priority', 'completed', 'created_at', 'farm_id', 'crop_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.getRecordById('task', id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) return null;
      
      return {
        id: response.data.Id,
        title: response.data.title || response.data.Name,
        description: response.data.description,
        dueDate: response.data.due_date,
        priority: response.data.priority,
        completed: response.data.completed,
        createdAt: response.data.created_at || response.data.CreatedOn,
        farmId: response.data.farm_id,
        cropId: response.data.crop_id
      };
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      throw error;
    }
  }

  async getByFarmId(farmId) {
    try {
      const params = {
        Fields: ['Name', 'title', 'description', 'due_date', 'priority', 'completed', 'created_at', 'farm_id', 'crop_id'],
        where: [{
          FieldName: "farm_id",
          Operator: "ExactMatch",
          Values: [farmId.toString()]
        }]
      };
      
      const response = await this.apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data?.map(task => ({
        id: task.Id,
        title: task.title || task.Name,
        description: task.description,
        dueDate: task.due_date,
        priority: task.priority,
        completed: task.completed,
        createdAt: task.created_at,
        farmId: task.farm_id,
        cropId: task.crop_id
      })) || [];
    } catch (error) {
      console.error(`Error fetching tasks for farm ${farmId}:`, error);
      throw error;
    }
  }

  async create(taskData) {
    try {
      const params = {
        records: [{
          Name: taskData.title,
          title: taskData.title,
          description: taskData.description || '',
          due_date: taskData.dueDate,
          priority: taskData.priority,
          completed: false,
          created_at: new Date().toISOString(),
          farm_id: parseInt(taskData.farmId),
          crop_id: taskData.cropId ? parseInt(taskData.cropId) : null
        }]
      };
      
      const response = await this.apperClient.createRecord('task', params);
      
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
          const newTask = successfulRecords[0].data;
          return {
            id: newTask.Id,
            title: newTask.title,
            description: newTask.description,
            dueDate: newTask.due_date,
            priority: newTask.priority,
            completed: newTask.completed,
            createdAt: newTask.created_at,
            farmId: newTask.farm_id,
            cropId: newTask.crop_id
          };
        }
      }
      
      throw new Error('Failed to create task');
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async update(id, taskData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };
      
      // Only include fields that are being updated
      if (taskData.title !== undefined) {
        updateData.Name = taskData.title;
        updateData.title = taskData.title;
      }
      if (taskData.description !== undefined) updateData.description = taskData.description;
      if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate;
      if (taskData.priority !== undefined) updateData.priority = taskData.priority;
      if (taskData.completed !== undefined) updateData.completed = taskData.completed;
      if (taskData.farmId !== undefined) updateData.farm_id = parseInt(taskData.farmId);
      if (taskData.cropId !== undefined) updateData.crop_id = taskData.cropId ? parseInt(taskData.cropId) : null;
      
      const params = {
        records: [updateData]
      };
      
      const response = await this.apperClient.updateRecord('task', params);
      
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
          const updatedTask = successfulUpdates[0].data;
          return {
            id: updatedTask.Id,
            title: updatedTask.title,
            description: updatedTask.description,
            dueDate: updatedTask.due_date,
            priority: updatedTask.priority,
            completed: updatedTask.completed,
            createdAt: updatedTask.created_at,
            farmId: updatedTask.farm_id,
            cropId: updatedTask.crop_id
          };
        }
      }
      
      throw new Error('Failed to update task');
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('task', params);
      
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
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  async toggleComplete(id) {
    try {
      // First get the current task to know its current completed status
      const currentTask = await this.getById(id);
      if (!currentTask) {
        throw new Error('Task not found');
      }
      
      // Toggle the completed status
      return await this.update(id, { completed: !currentTask.completed });
    } catch (error) {
      console.error("Error toggling task completion:", error);
      throw error;
    }
  }
}

export default new TaskService();