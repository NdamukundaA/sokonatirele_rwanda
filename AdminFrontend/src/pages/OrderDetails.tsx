import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Store,
  ShoppingCart,
  Edit,
  AlertCircle
} from "lucide-react";

// Using the same dummy data with extended information
const ordersData = [
  {
    id: "#ORD001",
    customer: "John Doe",
    customerEmail: "john.doe@email.com",
    customerPhone: "+1234567890",
    items: [
      {
        id: 1,
        name: "Fresh Red Apples",
        quantity: 2,
        price: 2.99,
        total: 5.98,
        image: "/images/products/fresh-apples.jpg"
      },
      {
        id: 2,
        name: "Organic Spinach",
        quantity: 1,
        price: 3.49,
        total: 3.49,
        image: "/images/products/organic-spinach.jpg"
      }
    ],
    total: 45.99,
    subtotal: 42.99,
    shipping: 3.00,
    status: "completed",
    orderDate: "2024-01-20",
    deliveryDate: "2024-01-22",
    seller: "Fresh Mart Store",
    sellerEmail: "freshmart@store.com",
    paymentMethod: "Credit Card",
    cardLast4: "4242",
    shippingAddress: "123 Main St, City, State",
    billingAddress: "123 Main St, City, State",
    trackingNumber: "TRK123456789",
    notes: "Please leave at the front door",
    statusHistory: [
      { status: "pending", date: "2024-01-20 09:00 AM", note: "Order placed" },
      { status: "processing", date: "2024-01-20 10:30 AM", note: "Payment confirmed" },
      { status: "shipped", date: "2024-01-21 02:00 PM", note: "Package shipped via Express Delivery" },
      { status: "completed", date: "2024-01-22 11:45 AM", note: "Delivered to customer" }
    ]
  },
  // ... other orders
];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const order = ordersData.find(o => o.id === `#${id}`);

  if (!order) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/dashboard/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/orders')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Update Status
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order {order.id}</span>
              {getStatusBadge(order.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">{order.orderDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Delivery Date</p>
                  <p className="font-medium">{order.deliveryDate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-medium">RWF {order.total}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
              </div>
              {order.trackingNumber && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="font-medium">{order.trackingNumber}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order.customer}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shipping Address</p>
                <p className="font-medium">{order.shippingAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-0">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity} × RWF {item.price}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">RWF {item.total}</p>
                </div>
              </div>
            ))}
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">RWF {order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">RWF {order.shipping}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>RWF {order.total}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Order Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4">
            {order.statusHistory.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${event.status === order.status ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <Clock className="h-4 w-4" />
                  </div>
                  {index < order.statusHistory.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                  <p className="text-sm text-muted-foreground">{event.note}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Order Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDetails;
