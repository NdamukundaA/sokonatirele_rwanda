import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const { currentUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Isoko Natirele',
    storeEmail: 'Kayitaregisap@gmail.com',
    storePhone: "+250793885689",
    storeAddress: 'Kigali-Rwanda',
    taxRate: '2%',
    currency: 'FRW',
    notifyLowStock: true,
    enableEmailNotifications: true,
    darkMode: false,
  });

  const handleStoreSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setStoreSettings({
      ...storeSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setStoreSettings({
      ...storeSettings,
      [name]: checked,
    });
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };

  // Wait for authentication status to load before rendering tabs
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-16 space-y-6">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500">
          Manage your store settings and preferences.
        </p>
      </div>

      <Separator className="my-6" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 gap-4 bg-transparent w-full max-w-md">
          <TabsTrigger value="general" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            General
          </TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            My Account
          </TabsTrigger>
          {/* {currentUser?.role === 'admin' && (
            <TabsTrigger value="users" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              User Management
            </TabsTrigger>
          )} */}
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>
                Isoko Natirele is a natural food store. Update your store information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input 
                    id="storeName" 
                    name="storeName" 
                    value={storeSettings.storeName} 
                    onChange={handleStoreSettingChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Email</Label>
                  <Input 
                    id="storeEmail" 
                    name="storeEmail" 
                    type="email" 
                    value={storeSettings.storeEmail} 
                    onChange={handleStoreSettingChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input 
                    id="storePhone" 
                    name="storePhone" 
                    value={storeSettings.storePhone}
                    onChange={handleStoreSettingChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Address</Label>
                  <Input 
                    id="storeAddress" 
                    name="storeAddress" 
                    value={storeSettings.storeAddress}
                    onChange={handleStoreSettingChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input 
                    id="taxRate" 
                    name="taxRate" 
                    value={storeSettings.taxRate} 
                    onChange={handleStoreSettingChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input 
                    id="currency" 
                    name="currency" 
                    value={storeSettings.currency} 
                    onChange={handleStoreSettingChange}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyLowStock" className="cursor-pointer">
                    <div>
                      <p>Low Stock Notifications</p>
                      <p className="text-sm text-gray-500">Notify when product stock falls below threshold</p>
                    </div>
                  </Label>
                  <Switch 
                    id="notifyLowStock"
                    checked={storeSettings.notifyLowStock}
                    onCheckedChange={(checked) => handleSwitchChange('notifyLowStock', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableEmailNotifications" className="cursor-pointer">
                    <div>
                      <p>Email Notifications</p>
                      <p className="text-sm text-gray-500">Send email notifications for new orders</p>
                    </div>
                  </Label>
                  <Switch 
                    id="enableEmailNotifications"
                    checked={storeSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('enableEmailNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your account information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="userName">Full Name</Label>
                  <Input id="fullName" defaultValue={currentUser?.name || 'John Doe'} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input id="userEmail" type="email" defaultValue={currentUser?.email || 'admin@example.com'} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* {currentUser?.role === 'admin' && (
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage admin accounts for your e-commerce store.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )} */}
      </Tabs>
    </div>
  );
};

export default Settings;