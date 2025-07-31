import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit, Trash2, Plus, Phone, ShoppingBag, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { getAllAddresses, getAllAddressesWithUserInfo, deleteAddress, getCustomerOrders } from '@/ApiConfig/ApiConfiguration';

interface Address {
  _id: string;
  description: string;
  city: string;
  street: string;
  district: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    ordersCount?: number;
    totalSpent?: number;
  };
  createdAt: string;
}

interface AddressManagerProps {
  userId?: string;
  onAddressSelect?: (address: Address) => void;
  showActions?: boolean;
}

const AddressManager: React.FC<AddressManagerProps> = ({ 
  userId, 
  onAddressSelect, 
  showActions = true 
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userOrderStats, setUserOrderStats] = useState<{[key: string]: {orders: number, spent: number}}>({});

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      // Try to get addresses with enhanced user info first
      let response;
      try {
        response = await getAllAddressesWithUserInfo();
      } catch (error) {
        // Fallback to regular getAllAddresses if enhanced endpoint doesn't exist
        console.log('Enhanced endpoint not available, using fallback');
        response = await getAllAddresses();
      }

      if (response.data.success) {
        let filteredAddresses = response.data.addresses;
        if (userId) {
          filteredAddresses = filteredAddresses.filter(
            (addr: Address) => addr.userId._id === userId
          );
        }
        setAddresses(filteredAddresses);
        
        // If the enhanced endpoint didn't provide order stats, fetch them manually
        const orderStats: {[key: string]: {orders: number, spent: number}} = {};
        const usersToFetch = new Set<string>();
        
        for (const address of filteredAddresses) {
          if (!address.userId.ordersCount && !orderStats[address.userId._id]) {
            usersToFetch.add(address.userId._id);
          } else if (address.userId.ordersCount) {
            orderStats[address.userId._id] = {
              orders: address.userId.ordersCount,
              spent: address.userId.totalSpent || 0
            };
          }
        }
        
        // Fetch order statistics for users that don't have them
        for (const userId of usersToFetch) {
          try {
            const ordersResponse = await getCustomerOrders(userId);
            const orders = ordersResponse.data || [];
            orderStats[userId] = {
              orders: orders.length,
              spent: orders.reduce((total: number, order: any) => total + (order.amount || 0), 0)
            };
          } catch (error) {
            console.error('Error fetching orders for user:', userId, error);
            orderStats[userId] = { orders: 0, spent: 0 };
          }
        }
        
        setUserOrderStats(orderStats);
      } else {
        toast.error('Failed to fetch addresses');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Error loading addresses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await deleteAddress(addressId);
      if (response.data.success) {
        toast.success('Address deleted successfully');
        fetchAddresses();
      } else {
        toast.error(response.data.message || 'Failed to delete address');
      }
    } catch (error: any) {
      console.error('Error deleting address:', error);
      
      // Show specific error messages
      if (error.message.includes('Authentication')) {
        toast.error('Please log in again to delete addresses');
      } else if (error.message.includes('not found')) {
        toast.error('Address not found or already deleted');
      } else if (error.message.includes('authorized')) {
        toast.error('You are not authorized to delete this address');
      } else if (error.message.includes('Invalid')) {
        toast.error('Invalid address ID');
      } else {
        toast.error(error.message || 'Error deleting address. Please try again.');
      }
    }
  };

  const formatAddress = (address: Address) => {
    const parts = [];
    if (address.description) parts.push(address.description);
    if (address.street) parts.push(address.street);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading addresses...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Addresses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-4 text-slate-500">
            No addresses found
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => {
              const orderStats = userOrderStats[address.userId._id] || { orders: 0, spent: 0 };
              return (
                <div
                  key={address._id}
                  className={`p-3 border rounded-lg ${
                    onAddressSelect ? 'cursor-pointer hover:bg-slate-50' : ''
                  }`}
                  onClick={() => onAddressSelect?.(address)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {formatAddress(address)}
                      </div>
                      {!userId && (
                        <div className="space-y-1 mt-2">
                          <div className="text-xs text-slate-500">
                            <strong>{address.userId.fullName}</strong> • {address.userId.email}
                          </div>
                          {address.userId.phoneNumber && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {address.userId.phoneNumber}
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3" />
                              {orderStats.orders} orders
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              frw {orderStats.spent.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mt-1">
                        Added {new Date(address.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {showActions && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit - you can implement this
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(address._id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressManager; 