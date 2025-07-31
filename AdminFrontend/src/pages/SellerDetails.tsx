import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, FileText, Check, X } from "lucide-react";

// Dummy seller detail data
const sellerDetails = {
  1: {
    id: 1,
    name: "Fresh Mart Store",
    email: "freshmart@email.com",
    phone: "+1234567890",
    address: "123 Market St, City, State 12345",
    status: "pending",
    joinDate: "2024-01-20",
    description: "Fresh fruits and vegetables supplier with over 10 years of experience in the grocery business.",
    businessLicense: "BL-2024-001",
    documents: [
      { name: "Business License", status: "verified" },
      { name: "Tax Certificate", status: "verified" },
      { name: "Food Safety Certificate", status: "pending" },
    ],
    bankDetails: {
      accountName: "Fresh Mart Store LLC",
      accountNumber: "****1234",
      routingNumber: "****5678",
    },
    products: [
      { name: "Fresh Apples", category: "Fruits", price: "frw2.99/lb" },
      { name: "Organic Spinach", category: "Vegetables", price: "frw3.49/bunch" },
      { name: "Roma Tomatoes", category: "Vegetables", price: "frw1.99/lb" },
    ],
  },
};

const SellerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const seller = id ? sellerDetails[parseInt(id) as keyof typeof sellerDetails] : null;

  if (!seller) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Seller not found</p>
        <Button onClick={() => navigate("/dashboard/sellers")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sellers
        </Button>
      </div>
    );
  }

  const handleApprove = () => {
    toast({
      title: "Seller Approved",
      description: `${seller.name} has been successfully approved`,
    });
    navigate("/dashboard/sellers");
  };

  const handleReject = () => {
    toast({
      title: "Seller Rejected",
      description: `${seller.name} application has been rejected`,
      variant: "destructive",
    });
    navigate("/dashboard/sellers");
  };

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
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard/sellers")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Seller Details</h1>
          <p className="text-muted-foreground">Complete seller information and verification</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{seller.name}</CardTitle>
                  <CardDescription>Seller Application Details</CardDescription>
                </div>
                {getStatusBadge(seller.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{seller.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{seller.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{seller.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Application Date</p>
                    <p className="font-medium">{seller.joinDate}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Business Description</p>
                <p className="text-sm">{seller.description}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Business License</p>
                <p className="font-medium">{seller.businessLicense}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents Verification</CardTitle>
              <CardDescription>Required business documents status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seller.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                    <Badge 
                      variant={doc.status === "verified" ? "default" : "secondary"}
                      className={doc.status === "verified" ? "bg-success text-success-foreground" : "bg-pending text-pending-foreground"}
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {seller.status === "pending" && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Approve or reject this seller</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleApprove}
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Seller
                </Button>
                <Button 
                  onClick={handleReject}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>Payment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Account Name</p>
                <p className="font-medium">{seller.bankDetails.accountName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-medium">{seller.bankDetails.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Routing Number</p>
                <p className="font-medium">{seller.bankDetails.routingNumber}</p>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>Sample Products</CardTitle>
              <CardDescription>Products this seller offers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seller.products.map((product, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <p className="text-sm font-medium text-primary">{product.price}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellerDetails;