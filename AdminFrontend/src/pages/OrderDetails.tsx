import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOrderDetails } from '@/ApiConfiguration/ApiConfiguration';
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  RefreshCw,
  User,
  ShoppingCart,
  AlertCircle 
} from "lucide-react";

interface OrderData {
  _id: string;
  user_fullName: string;
  user_email: string;
  products: Array<{
    productId: string;
    productQuantity: number;
    price: number;
    productName: string;
    productImage?: string;
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

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrderDetails(orderId);
      if (data.order) {
        setOrder(data.order);
      } else {
        setOrder(data); // handle case where order is directly in the response
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching order details:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
              <span>Order #{order._id}</span>
              {getStatusBadge(order.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-medium">RWF {order.amount.toFixed(2)}</p>
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
                <p className="font-medium">{order.user_fullName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.user_email}</p>
                </div>
                {order.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{order.address.phoneNumber}</p>
                  </div>
                )}
              </div>
              {order.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Shipping Address</p>
                  <p className="font-medium">{order.address.streetAddress}, {order.address.city}</p>
                </div>
              )}
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
            {order.products.map((item, index) => (
              <div key={index} className="flex items-center gap-4 py-4 border-b last:border-0">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.productName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.productQuantity} × RWF {item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">RWF {(item.price * item.productQuantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div className="pt-4">
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>RWF {order.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
