import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Package, ShoppingBag, TrendingUp, UserCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { 
  getAllOrders, 
  getAllCustomers, 
  getAllProducts, 
  getAllSellers 
} from "@/ApiConfiguration/ApiConfiguration";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalSellers: number;
  pendingSellers: number;
  approvedSellers: number;
  rejectedSellers: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  monthlyRevenue: number;
}

interface RecentSeller {
  _id: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
}

interface RecentOrder {
  _id: string;
  user_fullName: string;
  amount: number;
  status: string;
  createdAt: string;
}

const initialStats: DashboardStats = {
  totalSellers: 0,
  pendingSellers: 0,
  approvedSellers: 0,
  rejectedSellers: 0,
  totalCustomers: 0,
  totalProducts: 0,
  totalOrders: 0,
  monthlyRevenue: 0
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [recentSellers, setRecentSellers] = useState<RecentSeller[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [ordersData, customersData, productsData, sellersData] = await Promise.all([
          getAllOrders({ limit: 5 }),
          getAllCustomers({ limit: 1 }),
          getAllProducts({ limit: 1 }),
          getAllSellers({ limit: 5 })
        ]);

        // Calculate monthly revenue from recent orders
        // Calculate monthly revenue from all completed orders
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyRevenue = ordersData.orders
          .filter((order: any) => {
            const orderDate = new Date(order.createdAt);
            return order.paymentStatus === 'completed' && 
                   orderDate.getMonth() === currentMonth &&
                   orderDate.getFullYear() === currentYear;
          })
          .reduce((sum: number, order: any) => sum + (order.amount || 0), 0);

        // Get total number of products
        const totalProducts = productsData.pagination?.totalItems || 
                            productsData.products?.length || 
                            productsData.productList?.length || 0;

        // Update stats
        setStats({
          totalSellers: sellersData.pagination?.totalItems || sellersData.data?.length || 0,
          pendingSellers: sellersData.data?.filter((s: any) => s.status === 'pending').length || 0,
          approvedSellers: sellersData.data?.filter((s: any) => s.status === 'active').length || 0,
          rejectedSellers: sellersData.data?.filter((s: any) => s.status === 'inactive').length || 0,
          totalCustomers: customersData.totalCustomers || customersData.pagination?.totalItems || 0,
          totalProducts: totalProducts,
          totalOrders: ordersData.pagination?.totalItems || ordersData.orders?.length || 0,
          monthlyRevenue: monthlyRevenue
        });

        // Set recent sellers
        setRecentSellers(
          sellersData.data?.slice(0, 3).map((seller: any) => ({
            _id: seller._id,
            fullName: seller.fullName,
            email: seller.email,
            status: seller.status,
            createdAt: seller.createdAt
          })) || []
        );

        // Set recent orders
        setRecentOrders(
          ordersData.orders?.slice(0, 3).map((order: any) => ({
            _id: order._id,
            user_fullName: order.user_fullName,
            amount: order.amount,
            status: order.status,
            createdAt: order.createdAt
          })) || []
        );

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSellers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-pending font-medium">{stats.pendingSellers} pending</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Available Products</p>
              <p className="text-xs font-medium text-success">{stats.totalProducts.toLocaleString()}</p>
            </div>
            <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-success" 
                style={{ width: `${(stats.totalProducts / (stats.totalProducts || 1)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF {stats.monthlyRevenue.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">From {stats.totalOrders} orders</p>
              <p className="text-xs font-medium">
                Avg: RWF {stats.totalOrders ? Math.round(stats.monthlyRevenue / stats.totalOrders).toLocaleString() : 0}
              </p>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-xs text-success">
                {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seller Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Seller Status Overview</CardTitle>
          <CardDescription>Current status distribution of all sellers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 bg-pending/10 rounded-lg">
              <Clock className="h-8 w-8 text-pending" />
              <div>
                <p className="text-2xl font-bold text-pending">{stats.pendingSellers}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">{stats.approvedSellers}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.rejectedSellers}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sellers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Seller Applications</CardTitle>
            <CardDescription>Latest sellers waiting for approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSellers.map((seller) => (
              <div key={seller._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{seller.fullName}</p>
                  <p className="text-sm text-muted-foreground">{seller.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge 
                  variant={seller.status === "pending" ? "secondary" : "default"}
                  className={
                    seller.status === "pending" ? "bg-pending text-pending-foreground" :
                    seller.status === "active" ? "bg-success text-success-foreground" :
                    "bg-destructive text-destructive-foreground"
                  }
                >
                  {seller.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">#{order._id.slice(-6)}</p>
                  <p className="text-sm text-muted-foreground">{order.user_fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">RWF {order.amount.toLocaleString()}</p>
                  <Badge 
                    variant={order.status === "completed" ? "default" : "secondary"}
                    className={
                      order.status === "completed" ? "bg-success text-success-foreground" :
                      order.status === "processing" ? "bg-warning text-warning-foreground" :
                      order.status === "shipped" ? "bg-info text-info-foreground" :
                      order.status === "cancelled" ? "bg-destructive text-destructive-foreground" :
                      "bg-pending text-pending-foreground"
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;