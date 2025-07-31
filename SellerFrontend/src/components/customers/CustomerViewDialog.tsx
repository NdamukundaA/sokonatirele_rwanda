import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Phone, MapPin, ShoppingBag, CreditCard, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getCustomerById, getCustomerOrders } from '@/ApiConfig/ApiConfiguration';
import { toast } from 'sonner';
import { formatAddress } from '@/lib/addressUtils';

type AddressType = {
  _id: string;
  street: string;
  city: string;
  country: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  postalCode: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
};

type CustomerType = {
  id: string;
  name: string;
  email: string;
  location: string;
  orders: number;
  spent: number;
  status: string;
  lastOrder: string;
  phone?: string;
  addresses?: AddressType[];
};

type OrderType = {
  _id: string;
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  products: Array<{
    productId: { name: string; image?: string };
    productQuantity: number;
    price: number;
  }>;
  address: AddressType;
};

interface CustomerViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerType | null;
}

const CustomerViewDialog: React.FC<CustomerViewDialogProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [isLoading, setIsLoading] = useState(false);
  const [detailedCustomer, setDetailedCustomer] = useState<CustomerType | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);

  useEffect(() => {
    if (isOpen && customer?.id) {
      setIsLoading(true);
      Promise.all([
        getCustomerById(customer.id).catch(err => ({ error: err })), // Handle failure gracefully
        getCustomerOrders(customer.id)
      ])
        .then(([customerResponse, ordersResponse]) => {
          if ('error' in customerResponse) {
            console.error('Failed to fetch customer details:', customerResponse.error);
            // Fallback to prop data
            setDetailedCustomer({
              ...customer,
              addresses: customer.addresses || []
            });
          } else {
            const customerData = customerResponse.data;
            setDetailedCustomer({
              id: customerData._id,
              name: customerData.fullName,
              email: customerData.email,
              location: customer.location,
              orders: customer.orders,
              spent: customer.spent,
              status: customerData.status || 'Active',
              lastOrder: customer.lastOrder,
              phone: customerData.phoneNumber,
              addresses: customerData.addresses || []
            });
          }
          setOrders(ordersResponse.data);
        })
        .catch((error) => {
          toast.error('Failed to fetch customer details or orders: ' + (error.response?.data?.message || error.message));
          console.error('Error:', error);
          // Fallback to prop data if both fail
          setDetailedCustomer({
            ...customer,
            addresses: customer.addresses || []
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, customer]);

  const handleTabChange = (value: string) => {
    setIsLoading(true);
    setActiveTab(value);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  if (!customer) {
    return null;
  }

  const displayCustomer = detailedCustomer || customer;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Customer Details</SheetTitle>
          <SheetDescription>View customer information and order history.</SheetDescription>
        </SheetHeader>

        <Tabs
          defaultValue="info"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full mt-6"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="info">Basic Info</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 pt-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <Badge className={displayCustomer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                    {displayCustomer.status}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b pb-2">
                    <User className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="font-medium">{displayCustomer.name}</p>
                      <p className="text-sm text-slate-500">Customer ID: {displayCustomer.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b pb-2">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <p>{displayCustomer.email}</p>
                  </div>

                  <div className="flex items-center gap-3 border-b pb-2">
                    <Phone className="h-5 w-5 text-slate-400" />
                    <p>{displayCustomer.phone || 'Not provided'}</p>
                  </div>

                  <div className="flex items-center gap-3 border-b pb-2">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <div>
                      {displayCustomer.addresses?.length > 0 ? (
                        displayCustomer.addresses.map((addr, index) => (
                          <p key={addr._id} className="text-sm">
                            <strong>Address {index + 1}:</strong> {formatAddress(addr)}
                          </p>
                        ))
                      ) : (
                        <p>Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 pt-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="w-full h-24" />
                <Skeleton className="w-full h-10" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-slate-400" />
                    <span className="font-medium">Total Orders:</span>
                    <span>{displayCustomer.orders}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <CreditCard className="h-5 w-5 text-slate-400" />
                    <span className="font-medium">Total Spent:</span>
                    <span>frw {(displayCustomer.spent || 0).toFixed(2)}</span>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium">Last Order Date:</span>
                    <span className="ml-2">{displayCustomer.lastOrder}</span>
                  </div>
                </div>
                {orders.length > 0 ? (
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-3">Order History</h3>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border rounded-lg p-3 bg-slate-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">Order #{order._id.slice(-6)}</p>
                              <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">frw {(order.amount || 0).toFixed(2)}</p>
                              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                          
                          {order.address && (
                            <div className="mb-2 p-2 bg-white rounded border">
                              <p className="text-xs font-medium text-slate-600 mb-1">Delivery Address:</p>
                              <p className="text-xs text-slate-500">{formatAddress(order.address)}</p>
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-600">Products:</p>
                            {order.products && order.products.length > 0 ? (
                              order.products.map((product, index) => {
                                // Try to get product name, fallback to ID or "Unknown"
                                const name =
                                  (typeof product.productId === 'object' && product.productId?.name) ||
                                  product.name ||
                                  product.productName ||
                                  product.product_id ||
                                  product.productId ||
                                  'Unknown Product';

                                // Try to get quantity
                                const quantity =
                                  product.productQuantity ??
                                  product.quantity ??
                                  product.qty ??
                                  0;

                                // Try to get price
                                const price =
                                  product.price ??
                                  product.unitPrice ??
                                  product.amount ??
                                  0;

                                return (
                                  <div key={index} className="flex justify-between items-center text-xs">
                                    <span className="flex-1">{name}</span>
                                    <span className="text-slate-500">
                                      Qty: {quantity} • RWF {Number(price).toFixed(2)}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-slate-400">No product details</span>
                            )}
                          </div>
                          
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium">Payment Status:</span>
                              <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">No orders found for this customer.</div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default CustomerViewDialog;