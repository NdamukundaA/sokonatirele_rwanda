
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Search, ChevronDown, ChevronUp, Loader2, Calendar, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { getAllUserOrders, getOrderDetails } from "@/ApiConfig/ApiConfiguration";
import { toast } from "sonner";

interface ProductDetails {
  _id: string;
  productname: string;
  price: number;
  productImage?: string;
  description?: string;
  productUnit?: string;
  offerPrice?: number;
  inStock?: boolean;
}

interface OrderItem {
  _id: string;
  productId: ProductDetails | string;
  productQuantity: number;
  unit?: string;
  price?: number;
  productImage?: string;
  subtotal?: string;
  productDetails?: ProductDetails;
}

interface Order {
  _id: string;
  userId: string;
  products: OrderItem[];
  address: any;
  amount: number;
  paymentType: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const TrackOrders = () => {
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      console.log("TrackOrders: Fetching orders for page:", page);
      
      const response = await getAllUserOrders(page, 10);
      console.log("TrackOrders: Orders response:", response);
      
      if (response.success && response.data) {
        const ordersData = response.data.orders || [];
        
        setOrders(ordersData);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setCurrentPage(response.data.pagination?.currentPage || 1);
      } else {
        console.error("TrackOrders: Failed response:", response);
        toast.error(response.message || "Failed to fetch orders");
      }
    } catch (error: any) {
      console.error("TrackOrders: Error fetching orders:", error);
      toast.error(error.message || error.error || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchOrders();
      return;
    }

    try {
      setLoading(true);
      console.log("TrackOrders: Searching for order:", searchQuery);
      
      const response = await getOrderDetails(searchQuery);
      console.log("TrackOrders: Search response:", response);
      
      if (response.success && response.data) {
        setOrders([response.data]);
        setTotalPages(1);
        setCurrentPage(1);
        toast.success("Order found successfully");
      } else {
        console.error("TrackOrders: Order not found:", response);
        toast.error("Order not found");
        setOrders([]);
      }
    } catch (error: any) {
      console.error("TrackOrders: Search error:", error);
      toast.error(error.message || "Failed to fetch order details");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'shipped':
        return <Truck size={16} className="text-blue-600" />;
      case 'processing':
        return <Package size={16} className="text-blue-600" />;
      default:
        return <Calendar size={16} className="text-amber-600" />;
    }
  };

  const getProductInfo = (item: OrderItem) => {
    // Use the updated backend structure with productImage stored directly in the order item
    const productImage = item.productImage || 
                        (item.productDetails?.productImage) || 
                        (typeof item.productId === 'object' && item.productId?.productImage) || 
                        "/placeholder.svg";
    
    const productName = item.productDetails?.productname || 
                       (typeof item.productId === 'object' && item.productId?.productname) || 
                       "Product";
    
    return {
      id: typeof item.productId === 'object' ? item.productId._id : item.productId,
      name: productName,
      price: item.price || 0,
      image: productImage,
      unit: item.unit || "pcs",
      quantity: item.productQuantity || 1,
      subtotal: item.subtotal || ((item.price || 0) * (item.productQuantity || 1)).toFixed(2)
    };
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} className="mr-1" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Track Your Orders</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Order Tracking</CardTitle>
            <CardDescription>
              Enter your order ID to get detailed information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Input 
                  placeholder="Enter Order ID" 
                  className="pl-10 pr-4 py-2 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Contact our customer support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Having trouble finding your order or need assistance with tracking?
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Your order history and tracking information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No orders found</p>
              <p className="text-sm text-gray-400 mb-4">Your order history will appear here once you make a purchase.</p>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/products')}
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <TableRow className="cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span>#{order._id.slice(-8)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm capitalize">{order.paymentType}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>frw{order.amount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="flex items-center">
                          {expandedOrder === order._id ? (
                            <>Hide Details <ChevronUp size={16} className="ml-1" /></>
                          ) : (
                            <>Show Details <ChevronDown size={16} className="ml-1" /></>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {expandedOrder === order._id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50 p-0">
                          <div className="p-4">
                            <h4 className="font-medium mb-3">Order Contents</h4>
                            <div className="space-y-4">
                              {order.products?.map((item: OrderItem, index: number) => {
                                const productInfo = getProductInfo(item);
                                return (
                                  <div key={item._id || index} className="flex items-center space-x-4 py-2 border-b last:border-0">
                                    <div className="h-16 w-16 rounded bg-gray-200 overflow-hidden">
                                      <img 
                                        src={productInfo.image} 
                                        alt={productInfo.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src = "/placeholder.svg";
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-medium">{productInfo.name}</h5>
                                      <div className="text-sm text-gray-500">
                                        Quantity: {productInfo.quantity} {productInfo.unit}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Unit Price: frw{productInfo.price.toFixed(2)}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">
                                        frw{productInfo.subtotal}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Total for this item
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="mt-4 pt-3 border-t flex justify-between items-center">
                              <div>
                                <span className="text-gray-500">Total Items:</span> {order.products?.length || 0}
                              </div>
                              <div className="text-lg font-semibold">
                                <span className="text-gray-500 text-base mr-2">Order Total:</span> 
                                frw{order.amount?.toFixed(2) || '0.00'}
                              </div>
                            </div>
                            
                            {/* <div className="mt-4 flex justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                {order.status === "delivered" ? "Order Details" : "Track Package"}
                              </Button>
                              {order.status === "delivered" && (
                                <Button variant="outline" size="sm" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                                  Buy Again
                                </Button>
                              )}
                            </div> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && orders.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackOrders;
