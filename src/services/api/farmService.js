import farmsData from '../mockData/farms.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class FarmService {
  constructor() {
    this.farms = [...farmsData];
  }

  async getAll() {
    await delay(300);
    return [...this.farms];
  }

  async getById(id) {
    await delay(200);
    const farm = this.farms.find(f => f.id === id);
    return farm ? { ...farm } : null;
  }

  async create(farmData) {
    await delay(400);
    const newFarm = {
      ...farmData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.farms.push(newFarm);
    return { ...newFarm };
  }

  async update(id, farmData) {
    await delay(300);
    const index = this.farms.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Farm not found');
    
    this.farms[index] = { ...this.farms[index], ...farmData };
    return { ...this.farms[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.farms.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Farm not found');
    
    this.farms.splice(index, 1);
    return true;
  }
}

export default new FarmService();