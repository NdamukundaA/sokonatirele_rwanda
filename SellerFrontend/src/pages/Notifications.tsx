import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Bell, ShoppingCart, Package, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNotifications, markNotificationAsRead, clearReadNotifications } from '@/ApiConfig/ApiConfiguration';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  _id: string;
  orderId?: { _id: string; };
  userId?: { _id: string; fullName?: string; email?: string };
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

type NotificationType = 'all' | 'new_order' | 'payment_update' | 'status_update';

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<NotificationType>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getNotifications();
      if (response.data && response.data.notifications) {
        const formattedNotifications: Notification[] = response.data.notifications.map((n: any) => ({
          _id: n._id,
          orderId: n.orderId,
          userId: n.userId,
          message: n.message.replace(/\$/g, 'FRW'), // Replace $ with FRW in message
          isRead: n.isRead,
          type: n.type,
          createdAt: n.createdAt,
        }));
        setNotifications(formattedNotifications);
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const handleClearReadNotifications = async () => {
    try {
      await clearReadNotifications();
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => !n.isRead)
      );
      toast({
        title: "Success",
        description: "All read notifications have been cleared",
      });
    } catch (err) {
      console.error('Error clearing read notifications:', err);
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications(prevNotifications => 
          prevNotifications.filter(n => n._id !== notification._id)
        );
      } catch (err) {
        console.error('Error marking notification as read:', err);
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (notification.type === 'new_order' || notification.type === 'status_update' || notification.type === 'payment_update') {
      if (notification.orderId && notification.orderId._id) {
        navigate(`/orders/${notification.orderId._id}`);
      } else {
        console.warn('Notification is order-related but missing orderId:', notification);
        toast({
          title: "Info",
          description: "Order details not available for this notification."
        });
      }
    } else {
      navigate('/');
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === activeTab);

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
      case 'status_update':
      case 'payment_update':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case 'product':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'system':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-slate-500">View and manage your notifications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex items-center gap-4">
              {notifications.some(n => n.isRead) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleClearReadNotifications}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Read
                </Button>
              )}
              <Badge variant="outline">{filteredNotifications.length}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as NotificationType)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new_order">New Orders</TabsTrigger>
              <TabsTrigger value="status_update">Status Updates</TabsTrigger>
              <TabsTrigger value="payment_update">Payment Updates</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <div className="space-y-1">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Error loading notifications: {error}</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    {renderNotificationIcon(activeTab === 'all' ? 'default' : activeTab)}
                    <p className="mt-2">No notifications found for this category.</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors",
                        !notification.isRead && "bg-blue-50"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mt-0.5">
                        {renderNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            "text-sm font-medium",
                            !notification.isRead && "font-semibold"
                          )}>
                            {notification.message}
                            {!notification.isRead && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </h4>
                          <span className="text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                        {notification.userId?.fullName && (
                           <p className="text-sm text-slate-600 mt-0.5">By: {notification.userId.fullName}</p>
                        )}
                        {notification.orderId?._id && (
                            <p className="text-sm text-slate-600 mt-0.5">Order ID: {notification.orderId._id}</p>
                         )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;