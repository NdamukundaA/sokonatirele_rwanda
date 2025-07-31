import React, { useState, useEffect } from 'react';
import { Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead } from '@/ApiConfig/ApiConfiguration';
import { useToast } from '@/hooks/use-toast';
import io from 'socket.io-client';

interface Notification {
  _id: string;
  orderId: string | { _id: string };
  userId: { _id: string; fullName: string; email: string };
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

const VITE_BASE_URL = import.meta.env.VITE_API_CONNECTION;
const socket = io(VITE_BASE_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

const SellerHeader = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ... existing notification fetch and socket effect code ...

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications(prevNotifications => 
          prevNotifications.map(n => 
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    const orderId = typeof notification.orderId === 'object' ? notification.orderId._id : notification.orderId;
    if (!orderId) {
      toast({
        title: "Error",
        description: "Could not find order details",
        variant: "destructive",
      });
      return;
    }
    navigate(`/orders/${orderId}`);
    setDropdownOpen(false);
  };
  
  const handleDropdownOpenChange = (open: boolean) => {
    setDropdownOpen(open);
  };

  const getInitials = () => {
    if (!currentUser?.name) return 'S';
    const nameParts = currentUser.name.split(' ');
    return nameParts.length === 1 
      ? nameParts[0].substring(0, 2).toUpperCase()
      : (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between">
      <div className="text-xl font-semibold">
        AgriMarket Seller Dashboard
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification._id} 
                  className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => handleNavigate(notification)}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <Bell className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                        {notification.message.split(' worth ')[0]}
                      </h4>
                      <div className="text-xs text-slate-500 mt-1">
                        {notification.message.includes(' worth ') ? `frw ${notification.message.split(' worth ')[1]}` : notification.message}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem className="text-center text-gray-500" disabled>
                No notifications yet.
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center" onSelect={(e) => e.preventDefault()}>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/notifications')}>
                View all notifications
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2" size="sm">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span>{currentUser?.name || 'Seller'}</span>
                <span className="text-xs text-slate-500">Seller</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings?tab=account')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default SellerHeader;
