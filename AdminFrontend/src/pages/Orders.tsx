import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Package, Truck, CheckCircle, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Dummy order data
const ordersData = [
  {
    id: "#ORD001",
    customer: "John Doe",
    customerEmail: "john.doe@email.com",
    items: 3,
    total: 45.99,
    status: "completed",
    orderDate: "2024-01-20",
    deliveryDate: "2024-01-22",
    seller: "Fresh Mart Store",
    paymentMethod: "Credit Card",
    shippingAddress: "123 Main St, City, State",
  },
  {
    id: "#ORD002",
    customer: "Jane Smith",
    customerEmail: "jane.smith@email.com",
    items: 5,
    total: 78.50,
    status: "processing",
    orderDate: "2024-01-20",
    deliveryDate: "2024-01-23",
    seller: "Organic Valley",
    paymentMethod: "PayPal",
    shippingAddress: "456 Oak Ave, City, State",
  },
  {
    id: "#ORD003",
    customer: "Mike Johnson",
    customerEmail: "mike.johnson@email.com",
    items: 2,
    total: 32.25,
    status: "pending",
    orderDate: "2024-01-19",
    deliveryDate: "2024-01-22",
    seller: "Dairy Delights",
    paymentMethod: "Credit Card",
    shippingAddress: "789 Pine St, City, State",
  },
  {
    id: "#ORD004",
    customer: "Sarah Wilson",
    customerEmail: "sarah.wilson@email.com",
    items: 1,
    total: 12.99,
    status: "shipped",
    orderDate: "2024-01-18",
    deliveryDate: "2024-01-21",
    seller: "Gourmet Foods",
    paymentMethod: "Debit Card",
    shippingAddress: "321 Elm Dr, City, State",
  },
  {
    id: "#ORD005",
    customer: "David Brown",
    customerEmail: "david.brown@email.com",
    items: 4,
    total: 67.80,
    status: "cancelled",
    orderDate: "2024-01-17",
    deliveryDate: null,
    seller: "Fresh Mart Store",
    paymentMethod: "Credit Card",
    shippingAddress: "654 Maple Ln, City, State",
  },
];

const Orders = () => {
  const [orders, setOrders] = useState(ordersData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const handleViewDetails = (id: string) => {
    navigate(`/dashboard/orders/${id.replace('#', '')}`);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
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

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      processing: orders.filter(o => o.status === "processing").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      completed: orders.filter(o => o.status === "completed").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
      totalRevenue: orders
        .filter(o => o.status !== "cancelled")
        .reduce((sum, order) => sum + order.total, 0),
    };
  };

  const stats = getOrderStats();

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
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{order.id}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Seller</p>
                      <p className="font-medium">{order.seller}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Items / Total</p>
                      <p className="font-medium">{order.items} items • RWF {order.total}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment</p>
                      <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Order Date:</span>
                      <span className="font-medium">{order.orderDate}</span>
                    </div>
                    {order.deliveryDate && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Delivery Date:</span>
                        <span className="font-medium">{order.deliveryDate}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Shipping Address:</strong> {order.shippingAddress}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(order.id)}
                  >
                    <Eye className="h-4 w-4" />
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