import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, PackageCheck, User, Truck, Loader2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOrderDetails } from "@/ApiConfig/ApiConfiguration";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart } = useCartStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', '/order-confirmation');
    };

    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', '/order-confirmation');

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        console.log("OrderConfirmation: URL Parameters:", Object.fromEntries(searchParams.entries()));

        const orderId = localStorage.getItem('lastOrderId') ||
                       searchParams.get('orderId') ||
                       searchParams.get('reference') ||
                       searchParams.get('order_id') ||
                       searchParams.get('transactionReference');

        console.log("OrderConfirmation: Retrieved order ID:", orderId);

        if (!orderId) {
          console.error("OrderConfirmation: No order ID found");
          toast.error('No order information found');
          navigate('/', { replace: true });
          return;
        }

        const response = await getOrderDetails(orderId);
        console.log("OrderConfirmation: Order details response:", response);

        if (response.success && response.data) {
          setOrder(response.data.order || response.data);

          const paymentStatus = searchParams.get('status') ||
                              searchParams.get('payment_status') ||
                              searchParams.get('transaction_status') ||
                              response.data.order?.paymentStatus;

          console.log("OrderConfirmation: Payment status:", paymentStatus);

          // Handle Flutterwave payment status
          if (paymentStatus?.toLowerCase() === 'successful' || 
              response.data.order?.paymentStatus === 'completed' ||
              searchParams.get('status') === 'successful') {
            toast.success('Payment successful! Your order has been confirmed and will be delivered soon.');
            // Update local order state to reflect completion
            setOrder(prev => ({
              ...prev,
              paymentStatus: 'completed',
              status: 'completed'
            }));
            await fetchCart();
          } else if (paymentStatus?.toLowerCase() === 'failed' ||
                     paymentStatus?.toLowerCase() === 'cancelled' ||
                     response.data.order?.paymentStatus === 'failed') {
            toast.error('Payment failed. Please try again or contact support.');
          } else if (response.data.order?.paymentStatus === 'pending') {
            toast.info('Your order is being processed. Awaiting payment confirmation.');
          }

          localStorage.removeItem('lastOrderId');
        } else {
          console.error("OrderConfirmation: Failed to fetch order details");
          toast.error('Failed to fetch order details');
          navigate('/', { replace: true });
        }
      } catch (error: any) {
        console.error('OrderConfirmation: Error fetching order details:', error);
        toast.error(error.message || 'Failed to fetch order details');
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [navigate, location, fetchCart]);

  const handleContinueShopping = () => {
    localStorage.removeItem('lastOrderId');
    navigate('/products', { replace: true });
  };

  const handleTrackOrders = () => {
    localStorage.removeItem('lastOrderId');
    navigate('/track-orders', { replace: true });
  };

  const handleReturnHome = () => {
    localStorage.removeItem('lastOrderId');
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 flex justify-center items-center h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
          <p className="text-gray-500 mb-6">No order details available. Please try again or contact support.</p>
          <Button
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            onClick={handleContinueShopping}
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);
  const formattedDeliveryDate = orderDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const AddressDetails = ({ address }: { address: any }) => {
    if (!address) return null;
    return (
      <div className="space-y-1">
        <p className="font-medium">{address.description}</p>
        <p>{address.street}</p>
        <p>{address.district}</p>
        <p>{address.city}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 animate-fade-in">
      <div className="text-center mb-8">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4 animate-zoom-in" />
        <h1 className="text-4xl font-bold text-gray-900">
          {order.paymentStatus === 'completed' || order.status === 'completed'
            ? 'Order Confirmed!'
            : 'Order Awaiting Payment'}
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          {order.paymentStatus === 'completed' || order.status === 'completed'
            ? 'Thank you for your purchase. Your order will be delivered soon.'
            : 'Please complete your payment with Flutterwave to confirm your order.'}
        </p>
      </div>

      <Card className="shadow-xl border-none bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Order #{order._id.slice(-8)}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                <PackageCheck size={20} className="mr-2 text-green-600" />
                Order Summary
              </h3>
              {order.products?.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 mb-4">
                  <img
                    src={item.productImage || '/placeholder.png'}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-700">{item.productName}</h4>
                    <p className="text-sm text-gray-500">
                      Qty: {item.productQuantity} {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">frw{(item.price * item.productQuantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>frw{order.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Negotiable</span>
                  <span>Negotiable</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg text-gray-800">
                  <span>Total</span>
                  <span className="text-green-600">frw{order.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                  <Truck size={20} className="mr-2 text-green-600" />
                  Delivery Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Estimated Delivery:</p>
                  <p className="font-medium text-gray-800 mb-2">{formattedDeliveryDate}</p>
                  <p className="text-xs text-gray-500">
                    *Delivery time may vary based on location and delivery method.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Shipping Address:</p>
                  <AddressDetails address={order.address} />
                  <p className="text-sm text-gray-600">Phone: {order.address?.phoneNumber}</p>
                  <p className="text-sm text-gray-600">Email: {order.address?.email}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                  <User size={20} className="mr-2 text-green-600" />
                  Order Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Order Date:</span>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Payment Method:</span>{" "}
                    {order.paymentType?.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Order Status:</span>{" "}
                    {order.status?.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Payment Status:</span>{" "}
                    {order.paymentStatus?.toUpperCase()}
                  </p>
                  {order.paymentType === 'cash' && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">MOMO CODE:</span>{" "}
                      1706240
                    </p>
                  )}
                  {order.paymentType === 'online' && order.flwTransactionRef && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Transaction Reference:</span>{" "}
                      {order.flwTransactionRef}
                    </p>
                  )}
                  {order.paymentType === 'cash' && (
                    <p className="text-sm text-amber-600 mt-2">
                      Please prepare the exact amount for cash on delivery.
                    </p>
                  )}
                  {order.paymentType === 'online' && order.paymentStatus === 'pending' && (
                    <p className="text-sm text-amber-600 mt-2">
                      Please complete your payment with Flutterwave to confirm your order.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="font-medium text-gray-700 mb-2 flex items-center justify-center">
              <PackageCheck size={20} className="mr-2 text-green-600" />
              What Happens Next
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              {order.paymentStatus === 'completed' || order.status === 'completed' ? (
                <>
                  <p>1. Your payment has been confirmed.</p>
                  <p>2. Your order will be processed and shipped within 1-2 hours.</p>
                  <p>3. You'll receive tracking information once your order ships.</p>
                </>
              ) : (
                <>
                  <p>1. {order.paymentType === 'online' ? 'Complete your payment with Flutterwave.' : 'You\'ll get a call from us to confirm your payment and order details.'}</p>
                  <p>2. Once payment is confirmed, your order will be processed.</p>
                  <p>3. You'll receive tracking information after processing.</p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleReturnHome}
            >
              <ArrowLeft size={16} />
              Return to Home
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              onClick={handleContinueShopping}
            >
              <ShoppingBag size={16} />
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleTrackOrders}
            >
              <User size={16} />
              Track Orders
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>Need assistance? Contact us at <a href="mailto:support@ecogreenhouse.co" className="text-green-600 hover:underline">support@ecogreenhouse.co</a> or call +250-781-123-789</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;