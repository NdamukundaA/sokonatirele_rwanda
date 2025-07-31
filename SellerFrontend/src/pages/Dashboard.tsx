import React, { useState, useEffect } from 'react';
import { ChartBar, ShoppingCart, CreditCard, Users } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/dashboard/ChartCard';
import ProductsTable from '@/components/dashboard/ProductsTable';
import RecentOrders from '@/components/dashboard/RecentOrders';
import { kpiData, salesData, categoryData, weeklyRevenueData } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { getAllOrders, getOrderStatistics, getAllProducts } from '@/ApiConfig/ApiConfiguration';
import { Loader2 } from 'lucide-react';

// Define interfaces for API responses
interface OrderStatistics {
  totalRevenue: number;
  totalOrders: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  paymentsByStatus: {
    completed: number;
    pending: number;
  };
  dailyStats: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
}

// Define the Product type to match the ProductsTable component
export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

// Define the Order type for the RecentOrders component
interface Order {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  status: string;
  createdAt: string;
  user_fullName?: string;
}

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const [orderStats, setOrderStats] = useState<OrderStatistics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dashboardProducts, setDashboardProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || authLoading) {
         setIsLoading(false);
         return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch order statistics
        const statsResponse = await getOrderStatistics();
        if (statsResponse.data.success) {
          setOrderStats(statsResponse.data.statistics);
        }

        // Fetch recent orders (limited to 5 for dashboard)
        const ordersResponse = await getAllOrders({ limit: 5 });
        if (ordersResponse.data.success) {
          setRecentOrders(ordersResponse.data.orders);
        }

        // Fetch recent products (limited for dashboard view)
        const productsResponse = await getAllProducts({ limit: 10 });
        if (productsResponse.data.success) {
          // Map backend product data to frontend Product type
          const mappedProducts: Product[] = productsResponse.data.productList.map((p: any) => ({
            id: p._id,
            name: p.productname,
            category: p.productCategory?.name || 'Unknown Category',
            stock: p.inStock ? 1 : 0,
            price: p.price,
            status: p.inStock ? 'In Stock' : 'Out of Stock',
          }));
          setDashboardProducts(mappedProducts);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive",
        });
        setOrderStats(null);
        setRecentOrders([]);
        setDashboardProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast, isAuthenticated, authLoading]);

  // Show loading while checking authentication or fetching data
  if (authLoading || isLoading) {
    return (
       <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  // Don't render if not authenticated and not loading
  if (!isAuthenticated && !authLoading && !isLoading) {
    return <div className="text-center py-8 text-red-500">Access Denied. Please log in.</div>;
  }

  // Transform daily stats for charts
  const revenueChartData = orderStats?.dailyStats?.map(stat => ({
    name: new Date(stat._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: stat.revenue,
    orders: stat.orders
  })) || salesData;

  // Transform order status data for pie chart
  const orderStatusData = orderStats ? [
    { name: 'Pending', value: orderStats.ordersByStatus.pending },
    { name: 'Processing', value: orderStats.ordersByStatus.processing },
    { name: 'Shipped', value: orderStats.ordersByStatus.shipped },
    { name: 'Delivered', value: orderStats.ordersByStatus.delivered },
    { name: 'Cancelled', value: orderStats.ordersByStatus.cancelled }
  ].filter(item => item.value > 0) : categoryData;

  // Transform recent orders for the component
  const transformedRecentOrders = recentOrders.map(order => ({
    id: order._id,
    customer: order.userId?.name || order.user_fullName || 'Unknown Customer',
    date: new Date(order.createdAt).toLocaleDateString(),
    amount: order.amount,
    status: order.status.charAt(0).toUpperCase() + order.status.slice(1) as 'Completed' | 'Processing' | 'Cancelled'
  }));

  // Calculate payment completion rate
  const paymentCompletionRate = orderStats ? 
    ((orderStats.paymentsByStatus.completed / 
      (orderStats.paymentsByStatus.completed + orderStats.paymentsByStatus.pending)) * 100).toFixed(1) : 
    '0';

  return (
    <div className="space-y-6 p-6 pb-16 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={orderStats ? `frw ${orderStats.totalRevenue.toLocaleString()}` : kpiData.totalRevenue.value}
          icon={<CreditCard size={24} />}
          trend={kpiData.totalRevenue.trend}
        />
        <StatCard 
          title="Total Orders" 
          value={orderStats ? orderStats.totalOrders.toLocaleString() : kpiData.orders.value}
          icon={<ShoppingCart size={24} />}
          trend={kpiData.orders.trend}
        />
        <StatCard 
          title="Pending Orders" 
          value={orderStats ? orderStats.ordersByStatus.pending.toString() : '0'}
          icon={<ChartBar size={24} />}
          trend={{ value: 0, positive: true }}
        />
        <StatCard 
          title="Payment Completion" 
          value={`${paymentCompletionRate}%`}
          icon={<Users size={24} />}
          trend={{ value: 0, positive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard 
          className="lg:col-span-2"
          title="Revenue & Orders Overview" 
          subtitle="Daily revenue and order count over the last 30 days"
          data={revenueChartData} 
          type="area" 
          dataKey={['revenue', 'orders']} 
          height={300}
        />
        <ChartCard 
          title="Orders by Status"
          subtitle="Distribution of order statuses"
          data={orderStatusData} 
          type="pie" 
          dataKey="value"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard 
          title="Weekly Revenue" 
          data={revenueChartData}
          type="bar" 
          dataKey="revenue"
        />
        <div className="lg:col-span-2">
          <ProductsTable products={dashboardProducts} />
        </div>
      </div>

      <RecentOrders orders={transformedRecentOrders} />
    </div>
  );
};

export default Dashboard;
