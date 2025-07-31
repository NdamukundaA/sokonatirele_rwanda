import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Check, X, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Dummy seller data
const sellersData = [
  {
    id: 1,
    name: "Fresh Mart Store",
    email: "freshmart@email.com",
    phone: "+1234567890",
    address: "123 Market St, City, State",
    status: "pending",
    joinDate: "2024-01-20",
    description: "Fresh fruits and vegetables supplier",
    businessLicense: "BL-2024-001",
  },
  {
    id: 2,
    name: "Organic Valley",
    email: "organic@email.com",
    phone: "+1234567891",
    address: "456 Green Ave, City, State",
    status: "pending",
    joinDate: "2024-01-19",
    description: "Organic and natural food products",
    businessLicense: "BL-2024-002",
  },
  {
    id: 3,
    name: "Green Grocers",
    email: "green@email.com",
    phone: "+1234567892",
    address: "789 Fresh St, City, State",
    status: "approved",
    joinDate: "2024-01-18",
    description: "Local grocery store with fresh produce",
    businessLicense: "BL-2024-003",
  },
  {
    id: 4,
    name: "Dairy Delights",
    email: "dairy@email.com",
    phone: "+1234567893",
    address: "321 Milk Lane, City, State",
    status: "approved",
    joinDate: "2024-01-17",
    description: "Premium dairy products and cheese",
    businessLicense: "BL-2024-004",
  },
  {
    id: 5,
    name: "Spice World",
    email: "spice@email.com",
    phone: "+1234567894",
    address: "654 Flavor Rd, City, State",
    status: "rejected",
    joinDate: "2024-01-16",
    description: "Exotic spices and herbs from around the world",
    businessLicense: "BL-2024-005",
  },
];

const Sellers = () => {
  const [sellers, setSellers] = useState(sellersData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleApprove = (id: number) => {
    setSellers(prev => prev.map(seller => 
      seller.id === id ? { ...seller, status: "approved" } : seller
    ));
    toast({
      title: "Seller Approved",
      description: "Seller has been successfully approved",
    });
  };

  const handleReject = (id: number) => {
    setSellers(prev => prev.map(seller => 
      seller.id === id ? { ...seller, status: "rejected" } : seller
    ));
    toast({
      title: "Seller Rejected",
      description: "Seller application has been rejected",
      variant: "destructive",
    });
  };

  const handleViewDetails = (id: number) => {
    navigate(`/dashboard/sellers/${id}`);
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || seller.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-pending text-pending-foreground">Pending</Badge>;
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Seller Management</h1>
        <p className="text-muted-foreground">Manage seller applications and approvals</p>
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
                  placeholder="Search sellers..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Sellers List */}
      <div className="grid gap-4">
        {filteredSellers.map((seller) => (
          <Card key={seller.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{seller.name}</h3>
                    {getStatusBadge(seller.status)}
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {seller.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {seller.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {seller.address}
                    </div>
                  </div>
                  
                  <p className="text-sm mt-2">{seller.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied on: {seller.joinDate} • License: {seller.businessLicense}
                  </p>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(seller.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {seller.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(seller.id)}
                        className="text-success border-success hover:bg-success hover:text-success-foreground"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(seller.id)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSellers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No sellers found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Sellers;