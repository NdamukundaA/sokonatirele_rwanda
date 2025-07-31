import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Package, ShoppingBag, TrendingUp, UserCheck, Clock, CheckCircle, XCircle } from "lucide-react";

// Dummy data
const stats = {
  totalSellers: 145,
  pendingSellers: 12,
  approvedSellers: 120,
  rejectedSellers: 13,
  totalCustomers: 2847,
  totalProducts: 1289,
  totalOrders: 456,
  monthlyRevenue: 24580,
};

const recentSellers = [
  { id: 1, name: "Fresh Mart Store", email: "freshmart@email.com", status: "pending", date: "2024-01-20" },
  { id: 2, name: "Organic Valley", email: "organic@email.com", status: "pending", date: "2024-01-19" },
  { id: 3, name: "Green Grocers", email: "green@email.com", status: "approved", date: "2024-01-18" },
];

const recentOrders = [
  { id: "#ORD001", customer: "John Doe", amount: 45.99, status: "completed", date: "2024-01-20" },
  { id: "#ORD002", customer: "Jane Smith", amount: 78.50, status: "processing", date: "2024-01-20" },
  { id: "#ORD003", customer: "Mike Johnson", amount: 32.25, status: "pending", date: "2024-01-19" },
];

const Dashboard = () => {
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
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF {stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
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
              <div key={seller.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{seller.name}</p>
                  <p className="text-sm text-muted-foreground">{seller.email}</p>
                  <p className="text-xs text-muted-foreground">{seller.date}</p>
                </div>
                <Badge 
                  variant={seller.status === "pending" ? "secondary" : "default"}
                  className={seller.status === "pending" ? "bg-pending text-pending-foreground" : ""}
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
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">RWF {order.amount}</p>
                  <Badge 
                    variant={order.status === "completed" ? "default" : "secondary"}
                    className={
                      order.status === "completed" ? "bg-success text-success-foreground" :
                      order.status === "processing" ? "bg-warning text-warning-foreground" :
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