import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOrderDetails, updateOrderStatus, confirmCashPayment } from '@/ApiConfig/ApiConfiguration';
import { useToast } from '@/hooks/use-toast';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAddress } from '@/lib/addressUtils';
import { Phone } from 'lucide-react';

const statusStyles = {
  'delivered': 'bg-green-100 text-green-800',
  'processing': 'bg-blue-100 text-blue-800',
  'cancelled': 'bg-red-100 text-red-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'shipped': 'bg-purple-100 text-purple-800'
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useIsAuthenticated();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        setIsLoading(true);
        const response = await getOrderDetails(orderId);
        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          throw new Error(response.data.message || 'Failed to fetch order details');
        }
      } catch (error: any) {
        console.error('Error fetching order details:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch order details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      fetchOrderDetails();
    }
  }, [orderId, isAuthenticated, authLoading, toast]);

  const handleUpdateStatus = async (status: string) => {
    try {
      const response = await updateOrderStatus(orderId!, { status, paymentStatus: order.paymentStatus });
      if (response.data.success) {
        setOrder({ ...order, status });
        toast({
          title: "Success",
          description: "Order status updated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await confirmCashPayment(orderId!);
      if (response.data.success) {
        setOrder({ ...order, paymentStatus: 'completed' });
        toast({
          title: "Success",
          description: "Payment confirmed successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to confirm payment",
        variant: "destructive",
      });
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>Please log in to view order details.</div>;
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-slate-500">View and manage order #{order._id.slice(-6)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm mb-1">Customer</h3>
              <p className="font-medium">{order.userId?.name || order.user_fullName || 'Unknown Customer'}</p>
              <p className="text-sm text-slate-500">{order.userId?.email || order.user_email}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Order Date</h3>
              <p>{new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Status</h3>
              <Badge className={cn(
                statusStyles[order.status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'
              )}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Payment Status</h3>
              <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </Badge>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Payment Method</h3>
              <p>{order.paymentType.charAt(0).toUpperCase() + order.paymentType.slice(1)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Total Amount</h3>
              <p className="font-medium text-lg">frw {order.amount.toFixed(2)}</p>
            </div>
          </div>

          {order.address && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Delivery Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="whitespace-pre-line">{formatAddress(order.address)}</div>
                <div className="pt-2 border-t mt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>{order.address.phoneNumber || 'No phone provided'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium mb-2">Order Items</h3>
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">Product</th>
                    <th className="text-right p-3">Quantity</th>
                    <th className="text-right p-3">Price</th>
                    <th className="text-right p-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((item: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {item.productImage && (
                            <img 
                              src={item.productImage} 
                              alt={item.productName} 
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-slate-500">{item.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">{item.productQuantity}</td>
                      <td className="p-3 text-right">frw {item.price.toFixed(2)}</td>
                      <td className="p-3 text-right font-medium">
                        frw {item.subtotal || (item.price * item.productQuantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <Button 
                onClick={() => handleUpdateStatus('processing')}
                disabled={order.status === 'processing'}
                size="sm"
              >
                Mark Processed
              </Button>
              <Button 
                onClick={() => handleUpdateStatus('shipped')}
                disabled={order.status === 'shipped' || order.status === 'delivered'}
                size="sm"
              >
                Mark Shipped
              </Button>
              <Button 
                onClick={() => handleUpdateStatus('delivered')}
                disabled={order.status === 'delivered'}
                size="sm"
              >
                Mark Delivered
              </Button>
              {order.paymentType === 'cash' && order.paymentStatus === 'pending' && (
                <Button
                  onClick={handleConfirmPayment}
                  size="sm"
                  variant="secondary"
                >
                  Confirm Payment
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;