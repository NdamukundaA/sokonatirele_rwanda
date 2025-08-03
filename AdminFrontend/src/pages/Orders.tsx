import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Package, Truck, CheckCircle, Clock, RefreshCw, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllOrders, getOrderDetails, updateOrderStatus } from "@/ApiConfiguration/ApiConfiguration";

interface OrderData {
  _id: string;
  user_fullName: string;
  user_email: string;
  products: Array<{
    productId: string;
    productQuantity: number;
    price: number;
    productName: string;
  }>;
  amount: number;
  status: string;
  paymentStatus: string;
  paymentType: string;
  createdAt: string;
  address?: {
    streetAddress: string;
    city: string;
    phoneNumber: string;
  };
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

// Constants for status badges
const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { bg: "bg-pending", text: "text-pending-foreground", icon: Clock },
    processing: { bg: "bg-warning", text: "text-warning-foreground", icon: Package },
    shipped: { bg: "bg-primary", text: "text-primary-foreground", icon: Truck },
    delivered: { bg: "bg-success", text: "text-success-foreground", icon: CheckCircle },
    cancelled: { bg: "bg-destructive", text: "text-destructive-foreground", icon: Clock },
  };

  const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge className={`${config.bg} ${config.text} flex items-center gap-1`}>
      <IconComponent className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { orders: fetchedOrders, pagination } = await getAllOrders({
        page,
        limit: 20,
        search: searchTerm
      });
      setOrders(fetchedOrders);
      setTotalPages(pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/dashboard/orders/${id.replace('#', '')}`);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user_fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: "bg-pending", text: "text-pending-foreground", icon: Clock },
      processing: { bg: "bg-warning", text: "text-warning-foreground", icon: Package },
      shipped: { bg: "bg-primary", text: "text-primary-foreground", icon: Truck },
      completed: { bg: "bg-success", text: "text-success-foreground", icon: CheckCircle },
      cancelled: { bg: "bg-destructive", text: "text-destructive-foreground", icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config?.icon || Clock;

    return (
      <Badge className={`${config?.bg} ${config?.text} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats: OrderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status.toLowerCase() === "pending").length,
    processing: orders.filter(o => o.status.toLowerCase() === "processing").length,
    shipped: orders.filter(o => o.status.toLowerCase() === "shipped").length,
    delivered: orders.filter(o => o.status.toLowerCase() === "delivered").length,
    completed: orders.filter(o => o.status.toLowerCase() === "completed").length,
    cancelled: orders.filter(o => o.status.toLowerCase() === "cancelled").length,
    totalRevenue: orders
      .filter(o => o.status.toLowerCase() !== "cancelled")
      .reduce((sum, order) => sum + order.amount, 0)
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
        <p className="text-muted-foreground">Track and manage customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pending">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF {stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Overview</CardTitle>
          <CardDescription>Current distribution of order statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="flex items-center gap-3 p-3 bg-pending/10 rounded-lg">
              <Clock className="h-6 w-6 text-pending" />
              <div>
                <p className="text-lg font-bold text-pending">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
              <Package className="h-6 w-6 text-warning" />
              <div>
                <p className="text-lg font-bold text-warning">{stats.processing}</p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
              <Truck className="h-6 w-6 text-primary" />
              <div>
                <p className="text-lg font-bold text-primary">{stats.shipped}</p>
                <p className="text-xs text-muted-foreground">Shipped</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-success" />
              <div>
                <p className="text-lg font-bold text-success">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
              <Clock className="h-6 w-6 text-destructive" />
              <div>
                <p className="text-lg font-bold text-destructive">{stats.cancelled}</p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order._id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">#{order._id}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{order.user_fullName}</p>
                      <p className="text-xs text-muted-foreground">{order.user_email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Items / Total</p>
                      <p className="font-medium">{order.products.length} items • RWF {order.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium">{order.paymentType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Status</p>
                      <p className="font-medium">{order.paymentStatus}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Order Date:</span>
                      <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {order.address && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Shipping Address:</strong> {order.address.streetAddress}, {order.address.city}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(order._id)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No orders found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Orders;