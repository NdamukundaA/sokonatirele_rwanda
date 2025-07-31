
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Package, Truck, ArrowLeft, X, Loader2, MapPin, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  getUserProfile, 
  updatePassword, 
  updateUserProfile, 
  logoutUser,
  getAllUserOrders
} from "@/ApiConfig/ApiConfiguration";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface UserData {
  fullName: string;
  email: string;
  phoneNumber: string;
}

interface Order {
  _id: string;
  products: any[];
  amount: number;
  paymentType: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

// ---------------- Drawer Component ----------------
const EditProfileDrawer = ({ isOpen, onClose, user, onSave }: { 
  isOpen: boolean; 
  onClose: () => void; 
  user: UserData | null; 
  onSave: (user: UserData) => void;
}) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      password: "",
    });
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid or missing email";
    if (!formData.phoneNumber || !/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Invalid phone number";
    if (formData.password && formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updateUserProfile({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });

      if (formData.password) {
        await updatePassword({
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        });
      }

      const updatedUser = await getUserProfile();
      onSave(updatedUser);
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      console.error("Profile update error:", error);
      
      if (error && typeof error === 'object' && 'errors' in error) {
        const errorMessage = error.errors?.[0] || "Failed to update profile";
        toast.error(errorMessage);
      } else {
        toast.error(typeof error === 'string' ? error : "Failed to update profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl"
            initial={{ x: "100%", opacity: 0.2, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X size={24} />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {["fullName", "email", "phoneNumber", "password"].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>
                      {field === "password" ? "New Password (optional)" : field.charAt(0).toUpperCase() + field.slice(1).replace("Number", " Number")}
                    </Label>
                    <Input
                      id={field}
                      name={field}
                      type={field === "password" ? "password" : "text"}
                      value={formData[field as keyof FormData]}
                      onChange={handleInputChange}
                      placeholder={`Enter ${field}`}
                    />
                    {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
                  </div>
                ))}
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700 flex items-center space-x-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ---------------- Profile Page ----------------
const Profile = () => {
  const navigate = useNavigate();
  const { setAuthenticated } = useCartStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await getUserProfile();
        setUser(response);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error(typeof error === 'string' ? error : "Failed to fetch user data");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true);
      console.log("Profile: Fetching user orders");
      
      const response = await getAllUserOrders(1, 5); // Get recent 5 orders
      console.log("Profile: Orders response:", response);
      
      if (response.success && response.data) {
        setOrders(response.data.orders || []);
      } else {
        console.error("Profile: Failed to fetch orders:", response);
      }
    } catch (error: any) {
      console.error("Profile: Error fetching orders:", error);
      // Don't show error toast for orders in profile - it's not critical
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchUserOrders();
    }
  }, [activeTab]);

  const handleSave = (updatedUser: UserData) => setUser(updatedUser);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      localStorage.removeItem('user');
      setAuthenticated(false);
      toast.success('Logged out successfully');
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthenticated(false);
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } finally {
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 3000);
    }
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

  if (isLoading) {
    return (
      <div className="container mx-auto text-center py-8">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} className="mr-1" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4 w-full">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gray-200 rounded-full p-3">
                <User size={32} className="text-gray-700" />
              </div>
              <div>
                <h3 className="font-medium">{user?.fullName || "User"}</h3>
                <p className="text-sm text-gray-500">{user?.email || ""}</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <Button
                variant={activeTab === "profile" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("profile")}
              >
                <User size={16} className="mr-2" /> Profile
              </Button>
              <Button
                variant={activeTab === "orders" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("orders")}
              >
                <Package size={16} className="mr-2" /> Orders
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate('/address-management')}
              >
                <MapPin size={16} className="mr-2" /> Manage Addresses
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center space-x-2"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <User size={16} className="mr-2" />
                    <span>Sign Out</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4 w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>View and update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={user?.fullName || ""} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || ""} readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={user?.phoneNumber || ""} readOnly />
                  </div>
                  <Separator />
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    Edit Information
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View and track your recent orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-2">No orders found</p>
                      <p className="text-sm text-gray-400">Your order history will appear here once you make a purchase.</p>
                      <Button 
                        className="mt-4 bg-green-600 hover:bg-green-700"
                        onClick={() => navigate('/products')}
                      >
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order._id}>
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
                              <TableCell className="capitalize">{order.paymentType}</TableCell>
                              <TableCell>frw{order.amount?.toFixed(2) || '0.00'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="mt-4 text-center">
                        <Button 
                          variant="outline" 
                          onClick={() => navigate('/track-orders')}
                        >
                          View All Orders
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Animated Edit Drawer */}
      <EditProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onSave={handleSave}
      />
    </div>
  );
};

export default Profile;
