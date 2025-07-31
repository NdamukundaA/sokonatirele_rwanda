import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Mail, Phone, MapPin, Calendar, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Dummy customer data
const customersData = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1234567890",
    address: "123 Main St, City, State",
    joinDate: "2024-01-15",
    status: "active",
    totalOrders: 45,
    totalSpent: 1250.99,
    lastOrder: "2024-01-20",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1234567891",
    address: "456 Oak Ave, City, State",
    joinDate: "2024-01-10",
    status: "active",
    totalOrders: 32,
    totalSpent: 890.50,
    lastOrder: "2024-01-19",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@email.com",
    phone: "+1234567892",
    address: "789 Pine St, City, State",
    joinDate: "2024-01-05",
    status: "inactive",
    totalOrders: 12,
    totalSpent: 340.25,
    lastOrder: "2024-01-01",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@email.com",
    phone: "+1234567893",
    address: "321 Elm Dr, City, State",
    joinDate: "2024-01-20",
    status: "active",
    totalOrders: 8,
    totalSpent: 195.75,
    lastOrder: "2024-01-21",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@email.com",
    phone: "+1234567894",
    address: "654 Maple Ln, City, State",
    joinDate: "2023-12-28",
    status: "active",
    totalOrders: 67,
    totalSpent: 2100.40,
    lastOrder: "2024-01-18",
  },
];

const Customers = () => {
  const [customers, setCustomers] = useState(customersData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const handleViewDetails = (id: number) => {
    navigate(`/dashboard/customers/${id}`);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
        <p className="text-muted-foreground">View and manage customer accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RWF {customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                    {getStatusBadge(customer.status)}
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {customer.address}
                    </div>
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-medium">{customer.joinDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Orders</p>
                      <p className="font-medium">{customer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Spent</p>
                      <p className="font-medium">RWF {customer.totalSpent}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Order</p>
                      <p className="font-medium">{customer.lastOrder}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(customer.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No customers found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Customers;