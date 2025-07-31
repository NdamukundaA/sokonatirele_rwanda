import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, TableHeader, TableBody, 
  TableRow, TableHead, TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious
} from '@/components/ui/pagination';
import { Search, Filter, Download, Loader2, Eye, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { useNavigate } from 'react-router-dom';
import { getOrderDetails, confirmCashPayment, getAllOrders, updateOrderStatus } from '@/ApiConfig/ApiConfiguration';
import { formatAddress, formatAddressImproved } from '@/lib/addressUtils';

// Define Order type locally to avoid import issues
interface OrderProduct {
  productId: string;
  productQuantity: number;
  unit: string;
  price: number;
  productImage?: string;
  productName?: string;
  subtotal?: string | number;
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  user_fullName?: string;
  user_email?: string;
  products: OrderProduct[];
  address: any;
  amount: number;
  paymentType: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

const statusStyles = {
  'delivered': 'bg-green-100 text-green-800',
  'processing': 'bg-blue-100 text-blue-800',
  'cancelled': 'bg-red-100 text-red-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'shipped': 'bg-purple-100 text-purple-800'
};

const Orders = () => {
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useIsAuthenticated(false);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login from Orders page');
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchOrders = async (page: number = 1, search: string = '', status: string | null = null, paymentStatus: string | null = null) => {
    if (!isAuthenticated || authLoading) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching orders with auth status:', isAuthenticated, 'filters:', { page, search, status, paymentStatus });
      
      const response = await getAllOrders({
        page,
        limit: 15,
        search: search.trim() || undefined
      });

      if (response.data.success) {
        let filteredOrders = response.data.orders || [];
        
        // Apply status filter on frontend
        if (status && status !== 'all') {
          filteredOrders = filteredOrders.filter(order => order.status === status);
        }
        
        // Apply payment status filter on frontend
        if (paymentStatus && paymentStatus !== 'all') {
          filteredOrders = filteredOrders.filter(order => order.paymentStatus === paymentStatus);
        }
        
        setOrders(filteredOrders);
        setCurrentPage(response.data.currentPage || page);
        setTotalPages(response.data.totalPages || 1);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchOrders(1, searchTerm, filterStatus, filterPaymentStatus);
    }
  }, [isAuthenticated, authLoading]);

  const handleSearch = () => {
    if (!isAuthenticated) return;
    setCurrentPage(1);
    fetchOrders(1, searchTerm, filterStatus, filterPaymentStatus);
  };

  const handlePageChange = (page: number) => {
    if (!isAuthenticated) return;
    fetchOrders(page, searchTerm, filterStatus, filterPaymentStatus);
  };

  const handleViewOrder = async (order: Order) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view order details.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Viewing order:', order._id, 'Auth status:', isAuthenticated);
      const response = await getOrderDetails(order._id);
      
      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setIsOrderDetailsOpen(true);
      } else {
        throw new Error(response.data.message || 'Failed to fetch order details');
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch order details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    if (!isAuthenticated) return;
    
    try {
      // For online payments that are completed, ensure payment status is completed
      const paymentStatus = selectedOrder?.paymentType === 'online' && status === 'completed' 
        ? 'completed' 
        : selectedOrder?.paymentStatus || 'pending';
      
      const response = await updateOrderStatus(orderId, { status, paymentStatus });
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Order status updated successfully",
        });
        fetchOrders(currentPage, searchTerm, filterStatus, filterPaymentStatus);
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      } else {
        throw new Error(response.data.message || 'Failed to update order status');
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await confirmCashPayment(orderId);
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Cash payment confirmed successfully",
        });
        const updatedOrderResponse = await getOrderDetails(orderId);
        if (updatedOrderResponse.data.success) {
          setSelectedOrder(updatedOrderResponse.data.order);
        }
        fetchOrders(currentPage, searchTerm, filterStatus, filterPaymentStatus);
      } else {
        throw new Error(response.data.message || 'Failed to confirm payment');
      }
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to confirm payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchOrders(1, searchTerm, filterStatus, filterPaymentStatus);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilterStatus(null);
    setFilterPaymentStatus(null);
    setCurrentPage(1);
    fetchOrders(1, searchTerm, null, null);
    setIsFilterOpen(false);
  };

  const handleExport = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await getAllOrders({
        search: searchTerm.trim() || undefined
      });

      if (response.data.success && response.data.orders?.length > 0) {
        let ordersToExport = response.data.orders;
        
        // Apply filters on frontend for export
        if (filterStatus && filterStatus !== 'all') {
          ordersToExport = ordersToExport.filter((order: Order) => order.status === filterStatus);
        }
        
        if (filterPaymentStatus && filterPaymentStatus !== 'all') {
          ordersToExport = ordersToExport.filter((order: Order) => order.paymentStatus === filterPaymentStatus);
        }
        
        const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Amount', 'Status', 'Payment Status'];
        const rows = ordersToExport.map((order: Order) => [
          order._id.slice(-6),
          order.userId?.name || order.user_fullName || 'Unknown Customer',
          order.userId?.email || order.user_email || '',
          new Date(order.createdAt).toLocaleDateString(),
          `frw ${(order.amount || 0).toFixed(2)}`,
          order.status.charAt(0).toUpperCase() + order.status.slice(1),
          order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `orders_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Success",
          description: "Orders exported successfully",
        });
      } else {
        toast({
          title: "No Data",
          description: "No orders to export",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast({
        title: "Error",
        description: "Failed to export orders",
        variant: "destructive",
      });
    }
  };

  const closeOrderDetails = () => {
    setIsOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-64">Redirecting to login...</div>;
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-slate-500">Manage and view all your customer orders.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="w-full md:w-72 relative flex gap-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by customer name or email..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} variant="outline" size="sm">
            Search
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-6">Loading orders...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">#{order._id.slice(-6)}</TableCell>
                    <TableCell>
                      {order.userId?.name || order.user_fullName || 'Unknown Customer'}
                      {(order.userId?.email || order.user_email) && (
                        <div className="text-xs text-slate-500">{order.userId?.email || order.user_email}</div>
                      )}
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">frw {(order.amount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        statusStyles[order.status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800',
                        "font-normal"
                      )}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        disabled={!isAuthenticated}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {orders.length === 0 && !isLoading && (
            <div className="text-center py-6 text-slate-500">
              No orders found
            </div>
          )}
        </CardContent>
      </Card>
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink 
                    onClick={() => handlePageChange(page)}
                    isActive={page === currentPage}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext 
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isOrderDetailsOpen} onOpenChange={closeOrderDetails}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?._id.slice(-6)}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm mb-1">Customer</h3>
                  <p className="font-medium">{selectedOrder.userId?.name || selectedOrder.user_fullName || 'Unknown Customer'}</p>
                  <p className="text-sm text-slate-500">{selectedOrder.userId?.email || selectedOrder.user_email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">Order Date</h3>
                  <p>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">Status</h3>
                  <Badge className={statusStyles[selectedOrder.status as keyof typeof statusStyles]}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">Payment Status</h3>
                  <Badge variant={selectedOrder.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                    {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">Payment Method</h3>
                  <p>{selectedOrder.paymentType.charAt(0).toUpperCase() + selectedOrder.paymentType.slice(1)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">Total Amount</h3>
                  <p className="font-medium text-lg">frw {(selectedOrder.amount || 0).toFixed(2)}</p>
                </div>
              </div>

              {selectedOrder.address && (
                <div>
                  <h3 className="font-medium mb-2">Delivery Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <div className="whitespace-pre-line">{formatAddress(selectedOrder.address)}</div>
                    <div className="pt-2 border-t mt-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span>{selectedOrder.address.phoneNumber || 'No phone provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-medium mb-3">Products Ordered</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.products.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.productImage && (
                              <img 
                                src={item.productImage} 
                                alt={item.productName || 'Product'} 
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.productName || 'Unknown Product'}</p>
                              <p className="text-sm text-slate-500">Unit: {item.unit}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.productQuantity || 0}</TableCell>
                        <TableCell className="text-right">frw {(item.price || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">
                          frw {(() => {
                            const subtotal = item.subtotal;
                            if (subtotal !== undefined) {
                              // Convert string to number if needed
                              const numSubtotal = typeof subtotal === 'string' ? parseFloat(subtotal) : subtotal;
                              return (numSubtotal || 0).toFixed(2);
                            } else {
                              // Calculate from price and quantity
                              const calculatedSubtotal = (item.price || 0) * (item.productQuantity || 0);
                              return calculatedSubtotal.toFixed(2);
                            }
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Order Total:</span>
                    <span>frw {(selectedOrder.amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'processing')}
                    disabled={selectedOrder.status === 'processing'}
                    size="sm"
                  >
                    Mark Processed
                  </Button>
                  <Button 
                    onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'shipped')}
                    disabled={selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered'}
                    size="sm"
                  >
                    Mark Shipped
                  </Button>
                  <Button 
                    onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'delivered')}
                    disabled={selectedOrder.status === 'delivered'}
                    size="sm"
                  >
                    Mark Delivered
                  </Button>
                  {selectedOrder.paymentType === 'cash' && selectedOrder.paymentStatus === 'pending' && (
                    <Button
                      onClick={() => handleConfirmPayment(selectedOrder._id)}
                      size="sm"
                      variant="secondary"
                    >
                      Confirm Payment
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Orders</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">Order Status</label>
              <Select value={filterStatus || 'all'} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="paymentStatus" className="text-sm font-medium">Payment Status</label>
              <Select value={filterPaymentStatus || 'all'} onValueChange={setFilterPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilters}>Clear</Button>
            <Button onClick={handleApplyFilters}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;