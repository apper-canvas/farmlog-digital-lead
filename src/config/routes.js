import CropDetails from '@/components/pages/CropDetails';
import Crops from '@/components/pages/Crops';
import Dashboard from '@/components/pages/Dashboard';
import ExpenseDetails from '@/components/pages/ExpenseDetails';
import Expenses from '@/components/pages/Expenses';
import FarmDetails from '@/components/pages/FarmDetails';
import Farms from '@/components/pages/Farms';
import Income from '@/components/pages/Income';
import Reports from '@/components/pages/Reports';
import Tasks from '@/components/pages/Tasks';
import Weather from '@/components/pages/Weather';
export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'Home',
    component: Dashboard
  },
  farms: {
    id: 'farms',
    label: 'Farms',
    path: '/farms',
    icon: 'MapPin',
    component: Farms
  },
  crops: {
    id: 'crops',
    label: 'Crops',
    path: '/crops',
    icon: 'Sprout',
    component: Crops
  },
  tasks: {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: 'CheckSquare',
    component: Tasks
  },
expenses: {
    id: 'expenses',
    label: 'Expenses',
    path: '/expenses',
    icon: 'Receipt',
    component: Expenses
  },
income: {
    id: 'income',
    label: 'Income',
    path: '/income',
    icon: 'TrendingUp',
    component: Income
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    component: Reports
  },
  weather: {
    id: 'weather',
    label: 'Weather',
    path: '/weather',
    icon: 'CloudSun',
    component: Weather
  }
};

export const detailRoutes = {
  farmDetails: {
    id: 'farm-details',
    label: 'Farm Details',
    path: '/farms/:id',
    component: FarmDetails
  },
  cropDetails: {
    id: 'crop-details',
    label: 'Crop Details',
    path: '/crops/:id',
    component: CropDetails
  },
  expenseDetails: {
    id: 'expense-details',
    label: 'Expense Details',
    path: '/expenses/:id',
    component: ExpenseDetails
  }
};

// Export arrays for easy consumption by React Router
export const routeArray = Object.values(routes);
export const detailRouteArray = Object.values(detailRoutes);

// Export all routes combined for convenient access
export const allRoutes = [...routeArray, ...detailRouteArray];
export default routes;