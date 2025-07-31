import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  ArrowLeft,
  User,
  DollarSign,
  Clock,
  Package
} from "lucide-react";

// Using the same dummy data for now
const customersData = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1234567890",
    address: "123 Main St, City, State",
    joinDate: "2024-01-15",
    status: "active",
    totalOrders: 45,
    totalSpent: 1250.99,
    lastOrder: "2024-01-20",
    recentOrders: [
      { id: "ORD-001", date: "2024-01-20", amount: 150.00, status: "delivered" },
      { id: "ORD-002", date: "2024-01-15", amount: 89.99, status: "delivered" },
      { id: "ORD-003", date: "2024-01-10", amount: 200.50, status: "processing" }
    ]
  },
  // ... other customers
];

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find customer by id
  const customer = customersData.find(c => c.id === Number(id));

  if (!customer) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Customer Not Found</h2>
        <p className="text-muted-foreground mb-6">The customer you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/dashboard/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-success text-success-foreground">Delivered</Badge>;
      case "processing":
        return <Badge className="bg-blue-500 text-white">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/customers')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <h1 className="text-3xl font-bold">Customer Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(customer.status)}
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">{customer.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium">{customer.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium">{customer.phone}</p>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium">{customer.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium">Joined: {customer.joinDate}</p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RWF {customer.totalSpent.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.lastOrder}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {customer.recentOrders.map((order) => (
              <div key={order.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">RWF {order.amount.toFixed(2)}</p>
                  {getOrderStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetails;
