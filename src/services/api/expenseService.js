import expensesData from '../mockData/expenses.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ExpenseService {
  constructor() {
    this.expenses = [...expensesData];
  }

  async getAll() {
    await delay(300);
    return [...this.expenses];
  }

  async getById(id) {
    await delay(200);
    const expense = this.expenses.find(e => e.id === id);
    return expense ? { ...expense } : null;
  }

  async getByFarmId(farmId) {
    await delay(250);
    return this.expenses.filter(e => e.farmId === farmId).map(e => ({ ...e }));
  }

  async create(expenseData) {
    await delay(400);
    const newExpense = {
      ...expenseData,
      id: Date.now().toString()
    };
    this.expenses.push(newExpense);
    return { ...newExpense };
  }

  async update(id, expenseData) {
    await delay(300);
    const index = this.expenses.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Expense not found');
    
    this.expenses[index] = { ...this.expenses[index], ...expenseData };
    return { ...this.expenses[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.expenses.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Expense not found');
    
    this.expenses.splice(index, 1);
    return true;
  }
}

export default new ExpenseService();