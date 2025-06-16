import expenseService from './expenseService';
import incomeService from './incomeService';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

class ReportsService {
  constructor() {
    // No direct API calls - aggregates data from existing services
  }

  async getFinancialSummary(startDate, endDate) {
    try {
      const [expenses, income] = await Promise.all([
        expenseService.getAll(),
        incomeService.getAll()
      ]);

      // Filter by date range if provided
      const filteredExpenses = this.filterByDateRange(expenses, startDate, endDate);
      const filteredIncome = this.filterByDateRange(income, startDate, endDate);

      // Calculate totals
      const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      const totalIncome = filteredIncome.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
      const netProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;

      return {
        totalExpenses,
        totalIncome,
        netProfit,
        profitMargin,
        expenseCount: filteredExpenses.length,
        incomeCount: filteredIncome.length
      };
    } catch (error) {
      console.error("Error calculating financial summary:", error);
      throw error;
    }
  }

  async getMonthlyComparison(startDate, endDate) {
    try {
      const [expenses, income] = await Promise.all([
        expenseService.getAll(),
        incomeService.getAll()
      ]);

      const filteredExpenses = this.filterByDateRange(expenses, startDate, endDate);
      const filteredIncome = this.filterByDateRange(income, startDate, endDate);

      // Group by month
      const monthlyData = {};

      // Process expenses
      filteredExpenses.forEach(expense => {
        if (!expense.date) return;
        const monthKey = format(parseISO(expense.date), 'yyyy-MM');
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { expenses: 0, income: 0, month: format(parseISO(expense.date), 'MMM yyyy') };
        }
        monthlyData[monthKey].expenses += parseFloat(expense.amount) || 0;
      });

      // Process income
      filteredIncome.forEach(income => {
        if (!income.date) return;
        const monthKey = format(parseISO(income.date), 'yyyy-MM');
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { expenses: 0, income: 0, month: format(parseISO(income.date), 'MMM yyyy') };
        }
        monthlyData[monthKey].income += parseFloat(income.amount) || 0;
      });

      // Convert to array and sort by date
      const sortedData = Object.keys(monthlyData)
        .sort()
        .map(key => monthlyData[key]);

      return sortedData;
    } catch (error) {
      console.error("Error getting monthly comparison:", error);
      throw error;
    }
  }

  async getExpenseBreakdown(startDate, endDate) {
    try {
      const expenses = await expenseService.getAll();
      const filteredExpenses = this.filterByDateRange(expenses, startDate, endDate);

      const categoryTotals = {};
      filteredExpenses.forEach(expense => {
        const category = expense.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + (parseFloat(expense.amount) || 0);
      });

      return Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount,
        percentage: 0 // Will be calculated in component
      }));
    } catch (error) {
      console.error("Error getting expense breakdown:", error);
      throw error;
    }
  }

  async getIncomeBreakdown(startDate, endDate) {
    try {
      const income = await incomeService.getAll();
      const filteredIncome = this.filterByDateRange(income, startDate, endDate);

      const sourceTotals = {};
      filteredIncome.forEach(income => {
        const source = income.source || 'Other';
        sourceTotals[source] = (sourceTotals[source] || 0) + (parseFloat(income.amount) || 0);
      });

      return Object.entries(sourceTotals).map(([source, amount]) => ({
        source,
        amount,
        percentage: 0 // Will be calculated in component
      }));
    } catch (error) {
      console.error("Error getting income breakdown:", error);
      throw error;
    }
  }

  filterByDateRange(data, startDate, endDate) {
    if (!startDate || !endDate) return data;

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    return data.filter(item => {
      if (!item.date) return false;
      try {
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, { start, end });
      } catch (error) {
        console.warn("Invalid date format:", item.date);
        return false;
      }
    });
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  formatPercentage(value) {
    return `${(value || 0).toFixed(1)}%`;
  }
}

export default new ReportsService();