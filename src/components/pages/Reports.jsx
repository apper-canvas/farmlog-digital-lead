import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import DatePicker from '@/components/atoms/DatePicker';
import StatsCard from '@/components/molecules/StatsCard';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import reportsService from '@/services/api/reportsService';
import { toast } from 'react-toastify';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  
  const [financialSummary, setFinancialSummary] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    netProfit: 0,
    profitMargin: 0
  });
  
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState([]);

  useEffect(() => {
    loadReportsData();
  }, [dateRange]);

  const loadReportsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [summary, monthly, expenses, income] = await Promise.all([
        reportsService.getFinancialSummary(dateRange.startDate, dateRange.endDate),
        reportsService.getMonthlyComparison(dateRange.startDate, dateRange.endDate),
        reportsService.getExpenseBreakdown(dateRange.startDate, dateRange.endDate),
        reportsService.getIncomeBreakdown(dateRange.startDate, dateRange.endDate)
      ]);

      setFinancialSummary(summary);
      setMonthlyData(monthly);
      
      // Calculate percentages for breakdowns
      const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
      const expensesWithPercent = expenses.map(item => ({
        ...item,
        percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
      }));
      setExpenseBreakdown(expensesWithPercent);

      const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
      const incomeWithPercent = income.map(item => ({
        ...item,
        percentage: totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0
      }));
      setIncomeBreakdown(incomeWithPercent);

    } catch (error) {
      console.error("Error loading reports data:", error);
      setError("Failed to load reports data. Please try again.");
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetDateRange = () => {
    setDateRange({
      startDate: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error}
          onRetry={loadReportsData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Track your farm's income and expense performance</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1">
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={(value) => handleDateRangeChange('startDate', value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={(value) => handleDateRangeChange('endDate', value)}
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            onClick={resetDateRange}
            className="flex items-center gap-2"
          >
            <ApperIcon name="RotateCcw" size={16} />
            Reset
          </Button>
        </div>
      </Card>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Income"
          value={reportsService.formatCurrency(financialSummary.totalIncome)}
          icon="TrendingUp"
          iconColor="text-green-600"
          loading={loading}
        />
        <StatsCard
          title="Total Expenses"
          value={reportsService.formatCurrency(financialSummary.totalExpenses)}
          icon="Receipt"
          iconColor="text-red-600"
          loading={loading}
        />
        <StatsCard
          title="Net Profit"
          value={reportsService.formatCurrency(financialSummary.netProfit)}
          icon={financialSummary.netProfit >= 0 ? "TrendingUp" : "TrendingDown"}
          iconColor={financialSummary.netProfit >= 0 ? "text-green-600" : "text-red-600"}
          loading={loading}
        />
        <StatsCard
          title="Profit Margin"
          value={reportsService.formatPercentage(financialSummary.profitMargin)}
          icon="Percent"
          iconColor={financialSummary.profitMargin >= 0 ? "text-green-600" : "text-red-600"}
          loading={loading}
        />
      </div>

      {/* Monthly Comparison Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Income vs Expenses</h2>
          <ApperIcon name="BarChart3" size={20} className="text-gray-400" />
        </div>
        
        {loading ? (
          <SkeletonLoader className="h-80" />
        ) : (
          <div className="h-80">
            <Chart
              options={{
                chart: {
                  type: 'bar',
                  height: 320,
                  toolbar: { show: false },
                  zoom: { enabled: false }
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                  }
                },
                dataLabels: { enabled: false },
                stroke: {
                  show: true,
                  width: 2,
                  colors: ['transparent']
                },
                xaxis: {
                  categories: monthlyData.map(item => item.month),
                  title: { text: 'Month' }
                },
                yaxis: {
                  title: { text: 'Amount ($)' },
                  labels: {
                    formatter: (value) => `$${(value / 1000).toFixed(1)}k`
                  }
                },
                fill: { opacity: 1 },
                tooltip: {
                  y: {
                    formatter: (val) => reportsService.formatCurrency(val)
                  }
                },
                legend: {
                  position: 'top',
                  horizontalAlign: 'right'
                },
                colors: ['#10B981', '#EF4444']
              }}
              series={[
                {
                  name: 'Income',
                  data: monthlyData.map(item => item.income)
                },
                {
                  name: 'Expenses',
                  data: monthlyData.map(item => item.expenses)
                }
              ]}
              type="bar"
              height={320}
            />
          </div>
        )}
      </Card>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Expense Categories</h2>
            <ApperIcon name="PieChart" size={20} className="text-gray-400" />
          </div>
          
          {loading ? (
            <SkeletonLoader className="h-64" />
          ) : expenseBreakdown.length > 0 ? (
            <div className="h-64">
              <Chart
                options={{
                  chart: {
                    type: 'pie',
                    height: 256
                  },
                  labels: expenseBreakdown.map(item => item.category),
                  responsive: [{
                    breakpoint: 480,
                    options: {
                      chart: {
                        width: 200
                      },
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }],
                  legend: {
                    position: 'bottom'
                  },
                  tooltip: {
                    y: {
                      formatter: (val) => reportsService.formatCurrency(val)
                    }
                  }
                }}
                series={expenseBreakdown.map(item => item.amount)}
                type="pie"
                height={256}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No expense data available for selected period
            </div>
          )}
        </Card>

        {/* Income Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Income Sources</h2>
            <ApperIcon name="PieChart" size={20} className="text-gray-400" />
          </div>
          
          {loading ? (
            <SkeletonLoader className="h-64" />
          ) : incomeBreakdown.length > 0 ? (
            <div className="h-64">
              <Chart
                options={{
                  chart: {
                    type: 'pie',
                    height: 256
                  },
                  labels: incomeBreakdown.map(item => item.source),
                  responsive: [{
                    breakpoint: 480,
                    options: {
                      chart: {
                        width: 200
                      },
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }],
                  legend: {
                    position: 'bottom'
                  },
                  tooltip: {
                    y: {
                      formatter: (val) => reportsService.formatCurrency(val)
                    }
                  },
                  colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']
                }}
                series={incomeBreakdown.map(item => item.amount)}
                type="pie"
                height={256}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No income data available for selected period
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Reports;