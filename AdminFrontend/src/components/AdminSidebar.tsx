import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  ShoppingBag,
  Settings,
  BarChart3,
  Tags,
  UserCheck,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Sellers", url: "/dashboard/sellers", icon: UserCheck },
  { title: "Customers", url: "/dashboard/customers", icon: Users },
  { title: "Categories", url: "/dashboard/categories", icon: Tags },
  { title: "Products", url: "/dashboard/products", icon: Package },
  { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag },
  { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (path: string) =>
    isActive(path)
      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
      : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent className="bg-card">
        {/* Logo Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            {!collapsed && (
              <div>
                <h2 className="font-bold text-lg text-foreground">Isoko Natirele</h2>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClass(item.url)} flex items-center gap-3 px-3 py-2 rounded-lg transition-colors`}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}