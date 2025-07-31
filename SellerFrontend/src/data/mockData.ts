
import { ChartData } from '@/components/dashboard/ChartCard';
import { Product } from '@/components/dashboard/ProductsTable';
import { Order } from '@/components/dashboard/RecentOrders';
import { Category } from '@/components/categories/CategoryTable';

// KPI Data
export const kpiData = {
  totalRevenue: {
    value: '$24,325',
    trend: { value: 8.2, positive: true }
  },
  orders: {
    value: 467,
    trend: { value: 4.3, positive: true }
  },
  averageOrder: {
    value: '$52.08',
    trend: { value: 2.1, positive: true }
  },
  activeCustomers: {
    value: 1243,
    trend: { value: 12.4, positive: true }
  }
};

// Sales Data for Charts
export const salesData: ChartData = [
  { name: 'Jan', revenue: 4000, orders: 240 },
  { name: 'Feb', revenue: 5000, orders: 300 },
  { name: 'Mar', revenue: 7000, orders: 350 },
  { name: 'Apr', revenue: 6500, orders: 320 },
  { name: 'May', revenue: 8000, orders: 400 },
  { name: 'Jun', revenue: 9500, orders: 450 },
  { name: 'Jul', revenue: 11000, orders: 500 }
];

export const categoryData: ChartData = [
  { name: 'Fruits', value: 35 },
  { name: 'Vegetables', value: 25 },
  { name: 'Meat & Seafood', value: 15 },
  { name: 'Dairy', value: 12 },
  { name: 'Bakery', value: 8 },
  { name: 'Other', value: 5 }
];

export const weeklyRevenueData: ChartData = [
  { name: 'Monday', revenue: 1100 },
  { name: 'Tuesday', revenue: 1300 },
  { name: 'Wednesday', revenue: 1500 },
  { name: 'Thursday', revenue: 1700 },
  { name: 'Friday', revenue: 2000 },
  { name: 'Saturday', revenue: 2400 },
  { name: 'Sunday', revenue: 1800 }
];

// Sample Products
export const mockProducts = [
  {
    id: 'P001',
    name: 'Organic Bananas',
    category: 'Fruits',
    stock: 5,
    price: 1.99,
    status: 'In Stock'
  },
  {
    id: 'P002',
    name: 'Fresh Chicken Breast',
    category: 'Meat & Seafood',
    stock: 25,
    price: 8.99,
    status: 'In Stock'
  },
  {
    id: 'P003',
    name: 'Avocados',
    category: 'Fruits',
    stock: 0,
    price: 2.49,
    status: 'Out of Stock'
  },
  {
    id: 'P004',
    name: 'Whole Milk',
    category: 'Dairy',
    stock: 42,
    price: 3.49,
    status: 'In Stock'
  },
  {
    id: 'P005',
    name: 'Sourdough Bread',
    category: 'Bakery',
    stock: 8,
    price: 4.99,
    status: 'In Stock'
  },
  {
    id: 'P006',
    name: 'Organic Spinach',
    category: 'Vegetables',
    stock: 15,
    price: 2.99,
    status: 'In Stock'
  },
  {
    id: 'P007',
    name: 'Free Range Eggs',
    category: 'Dairy',
    stock: 24,
    price: 4.49,
    status: 'In Stock'
  },
  {
    id: 'P008',
    name: 'Atlantic Salmon',
    category: 'Meat & Seafood',
    stock: 7,
    price: 12.99,
    status: 'Low Stock'
  }
];

// Sample Products
export const productsData: Product[] = [
  {
    id: 'P001',
    name: 'Organic Bananas',
    category: 'Fruits',
    stock: 5,
    price: 1.99,
    status: 'Low Stock'
  },
  {
    id: 'P002',
    name: 'Fresh Chicken Breast',
    category: 'Meat & Seafood',
    stock: 25,
    price: 8.99,
    status: 'In Stock'
  },
  {
    id: 'P003',
    name: 'Avocados',
    category: 'Fruits',
    stock: 0,
    price: 2.49,
    status: 'Out of Stock'
  },
  {
    id: 'P004',
    name: 'Whole Milk',
    category: 'Dairy',
    stock: 42,
    price: 3.49,
    status: 'In Stock'
  },
  {
    id: 'P005',
    name: 'Sourdough Bread',
    category: 'Bakery',
    stock: 8,
    price: 4.99,
    status: 'Low Stock'
  },
];

// Recent Orders
export const recentOrdersData: Order[] = [
  {
    id: '38295',
    customer: 'John Smith',
    date: '2025-05-19',
    amount: 124.95,
    status: 'Completed'
  },
  {
    id: '38296',
    customer: 'Sarah Johnson',
    date: '2025-05-19',
    amount: 89.50,
    status: 'Processing'
  },
  {
    id: '38297',
    customer: 'Robert Williams',
    date: '2025-05-18',
    amount: 215.20,
    status: 'Completed'
  },
  {
    id: '38298',
    customer: 'Emma Davis',
    date: '2025-05-18',
    amount: 45.75,
    status: 'Cancelled'
  },
  {
    id: '38299',
    customer: 'Michael Brown',
    date: '2025-05-17',
    amount: 78.30,
    status: 'Completed'
  },
];
