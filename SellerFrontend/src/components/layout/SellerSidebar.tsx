import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChartBar,
  ChartPie,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  to: string;
};

const SidebarItem = ({ icon: Icon, label, active = false, collapsed = false, to }: SidebarItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 p-2 h-10 font-normal",
          isActive ? "bg-emerald-500 text-white hover:bg-emerald-600" : "hover:bg-slate-100 text-slate-600"
        )}
      >
        <Icon size={20} />
        {!collapsed && <span>{label}</span>}
      </Button>
    </Link>
  );
};

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className={cn(
        "bg-white border-r border-slate-200 flex flex-col h-screen transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-200">
        {!collapsed && (
          <div className="text-lg font-semibold text-emerald-500">IsokoNatirele</div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)} 
          className="ml-auto"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        <SidebarItem icon={ChartBar} label="Dashboard" to="/" collapsed={collapsed} />
        <SidebarItem icon={ChartPie} label="Analytics" to="/analytics" collapsed={collapsed} />
        <SidebarItem icon={ShoppingCart} label="Orders" to="/orders" collapsed={collapsed} />
        <SidebarItem icon={Package} label="Products" to="/products" collapsed={collapsed} />
        <SidebarItem icon={Folder} label="Categories" to="/categories" collapsed={collapsed} />
        <SidebarItem icon={Users} label="Customers" to="/customers" collapsed={collapsed} />
        <SidebarItem icon={Settings} label="Settings" to="/settings" collapsed={collapsed} />
      </div>

      <div className="p-4 border-t border-slate-200">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
