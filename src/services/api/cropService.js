import cropsData from '../mockData/crops.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CropService {
  constructor() {
    this.crops = [...cropsData];
  }

  async getAll() {
    await delay(300);
    return [...this.crops];
  }

  async getById(id) {
    await delay(200);
    const crop = this.crops.find(c => c.id === id);
    return crop ? { ...crop } : null;
  }

  async getByFarmId(farmId) {
    await delay(250);
    return this.crops.filter(c => c.farmId === farmId).map(c => ({ ...c }));
  }

  async create(cropData) {
    await delay(400);
    const newCrop = {
      ...cropData,
      id: Date.now().toString()
    };
    this.crops.push(newCrop);
    return { ...newCrop };
  }

  async update(id, cropData) {
    await delay(300);
    const index = this.crops.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Crop not found');
    
    this.crops[index] = { ...this.crops[index], ...cropData };
    return { ...this.crops[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.crops.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Crop not found');
    
    this.crops.splice(index, 1);
    return true;
  }
}

export default new CropService();