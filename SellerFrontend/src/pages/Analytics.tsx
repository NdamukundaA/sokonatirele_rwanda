import React, { useState, useEffect } from 'react';
import ChartCard from '@/components/dashboard/ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { 
  Table, TableHeader, TableBody, 
  TableRow, TableHead, TableCell 
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { getAllCustomers, getOrderStatistics } from '@/ApiConfig/ApiConfiguration';

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

// Define the type for customer data received from the API
interface CustomerData {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  ordersCount: number;
  spent: number;
  lastOrder?: string;
  address: string;
}

const Analytics = () => {
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const [orderStats, setOrderStats] = useState<OrderStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerData[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!isAuthenticated || authLoading) return;
      
      try {
        setIsLoading(true);
        const response = await getOrderStatistics();
        if (response.data.success) {
          setOrderStats(response.data.statistics);
        }
      } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load analytics data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [toast, isAuthenticated, authLoading]);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await getAllCustomers();
        if (response.data && Array.isArray(response.data.customers)) {
          setCustomers(response.data.customers);
          toast({
            title: "Success",
            description: 'Customer data loaded successfully',
          });
        } else {
          // Handle cases where data might not be in the expected format
          console.error('API response for customers not in expected format:', response);
          setCustomers([]); // Set empty array to avoid errors
          toast({
            title: "Warning",
            description: 'Failed to load customer data in expected format.',
            variant: "destructive", // Using destructive variant for warning
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || 'Failed to load customer data',
          variant: "destructive",
        });
        console.error('Error fetching customers:', error);
        setCustomers([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [toast]); // Dependency array includes toast

  // Show loading while checking authentication
  if (authLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Transform daily stats for monthly view
  const monthlySalesData = orderStats?.dailyStats?.map(stat => ({
    name: new Date(stat._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: stat.revenue
  })) || [
    { name: 'Jan', revenue: 12000 },
    { name: 'Feb', revenue: 15000 },
    { name: 'Mar', revenue: 18000 },
    { name: 'Apr', revenue: 16500 },
    { name: 'May', revenue: 21000 },
    { name: 'Jun', revenue: 24500 }
  ];

  // Transform order status data
  const orderStatusData = orderStats ? [
    { name: 'Pending', value: orderStats.ordersByStatus.pending },
    { name: 'Processing', value: orderStats.ordersByStatus.processing },
    { name: 'Shipped', value: orderStats.ordersByStatus.shipped },
    { name: 'Delivered', value: orderStats.ordersByStatus.delivered },
    { name: 'Cancelled', value: orderStats.ordersByStatus.cancelled }
  ].filter(item => item.value > 0) : [
    { name: 'Delivered', value: 15 },
    { name: 'Processing', value: 12 },
    { name: 'Shipped', value: 10 },
    { name: 'Pending', value: 8 },
    { name: 'Cancelled', value: 2 }
  ];

  // Customer retention mock data (since backend doesn't provide this yet)
  const customerRetentionData = [
    { name: 'Week 1', newCustomers: 120, returningCustomers: 80 },
    { name: 'Week 2', newCustomers: 140, returningCustomers: 95 },
    { name: 'Week 3', newCustomers: 130, returningCustomers: 110 },
    { name: 'Week 4', newCustomers: 150, returningCustomers: 125 },
    { name: 'Week 5', newCustomers: 170, returningCustomers: 140 },
    { name: 'Week 6', newCustomers: 165, returningCustomers: 155 },
    { name: 'Week 7', newCustomers: 180, returningCustomers: 170 },
    { name: 'Week 8', newCustomers: 190, returningCustomers: 185 }
  ];

  // Transform daily stats for hourly analysis
  const salesByTimeData = orderStats?.dailyStats?.slice(-9).map((stat, index) => ({
    name: `Day ${index + 1}`,
    sales: stat.orders
  })) || [
    { name: '6AM', sales: 20 },
    { name: '8AM', sales: 40 },
    { name: '10AM', sales: 65 },
    { name: '12PM', sales: 85 },
    { name: '2PM', sales: 70 },
    { name: '4PM', sales: 90 },
    { name: '6PM', sales: 110 },
    { name: '8PM', sales: 45 },
    { name: '10PM', sales: 20 }
  ];

  return (
    <div className="space-y-6 p-6 pb-16 animate-fade-in">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-slate-500">Deep dive into your store's performance metrics.</p>
      </div>

      {/* Key Metrics Summary */}
      {orderStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">frw {orderStats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-slate-500">Total Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{orderStats.totalOrders.toLocaleString()}</div>
              <div className="text-sm text-slate-500">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{orderStats.ordersByStatus.delivered}</div>
              <div className="text-sm text-slate-500">Delivered Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{orderStats.paymentsByStatus.completed}</div>
              <div className="text-sm text-slate-500">Completed Payments</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Daily Sales Trend" 
          subtitle="Revenue performance over the last 30 days"
          data={monthlySalesData} 
          type="line" 
          dataKey="revenue" 
          height={350}
        />
        <ChartCard 
          title="Customer Retention" 
          subtitle="New vs returning customers by week"
          data={customerRetentionData} 
          type="area" 
          dataKey={['newCustomers', 'returningCustomers']} 
          height={350}
          colors={['#8B5CF6', '#0EA5E9']}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Orders by Status" 
          subtitle="Distribution of order statuses"
          data={orderStatusData} 
          type="pie" 
          dataKey="value" 
          height={350}
        />
        <ChartCard 
          title="Daily Order Volume" 
          subtitle="Number of orders per day"
          data={salesByTimeData} 
          type="bar" 
          dataKey="sales" 
          height={350}
          colors={['#10B981']}
        />
      </div>

      {/* Payment Status Overview */}
      {orderStats && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="space-y-4">
              {[
                { 
                  source: 'Completed Payments', 
                  count: orderStats.paymentsByStatus.completed,
                  total: orderStats.paymentsByStatus.completed + orderStats.paymentsByStatus.pending,
                  color: '#10B981' 
                },
                { 
                  source: 'Pending Payments', 
                  count: orderStats.paymentsByStatus.pending,
                  total: orderStats.paymentsByStatus.completed + orderStats.paymentsByStatus.pending,
                  color: '#F97316' 
                }
              ].map((item) => {
                const percentage = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
                return (
                  <div key={item.source} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.source}</span>
                      <span className="text-slate-500">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: item.color
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <div className="space-y-4">
            {[
              { source: 'Direct', percentage: 35, color: '#0EA5E9' },
              { source: 'Organic Search', percentage: 28, color: '#10B981' },
              { source: 'Social Media', percentage: 22, color: '#8B5CF6' },
              { source: 'Email Marketing', percentage: 10, color: '#F97316' },
              { source: 'Referrals', percentage: 5, color: '#EF4444' }
            ].map((item) => (
              <div key={item.source} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{item.source}</span>
                  <span className="text-slate-500">{item.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : customers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No customer data available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spent (FRW)</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Primary Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">{customer.fullName}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.ordersCount}</TableCell>
                    <TableCell>{customer.spent.toFixed(2)}</TableCell>
                    <TableCell>{customer.lastOrder || 'N/A'}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
