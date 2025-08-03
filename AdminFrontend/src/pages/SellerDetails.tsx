// SellerDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Loader2, Check, X } from 'lucide-react';
import { getSellerById, Seller } from '@/ApiConfiguration/ApiConfiguration';

const SellerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeller = async () => {
      if (!id) {
        setError('Seller ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const response = await getSellerById(id);
        console.log('Seller details response:', response);
        if (!response) {
          throw new Error('No seller data received');
        }
        // Handle both possible response formats
        setSeller(response.seller || response);
      } catch (err: any) {
        console.error('Error fetching seller:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch seller details';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeller();
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-2">Loading seller details...</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{error || 'Seller not found'}</p>
        <Button onClick={() => navigate('/dashboard/sellers')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sellers
        </Button>
      </div>
    );
  }

  const handleApprove = () => {
    toast({
      title: 'Seller Approved',
      description: `${seller.fullName} has been successfully approved`,
    });
    navigate('/dashboard/sellers');
  };

  const handleReject = () => {
    toast({
      title: 'Seller Rejected',
      description: `${seller.fullName} application has been rejected`,
      variant: 'destructive',
    });
    navigate('/dashboard/sellers');
  };

  const getStatusBadge = (isAdmin: boolean) => {
    return (
      <Badge className={!isAdmin ? 'bg-success text-success-foreground' : 'bg-pending text-pending-foreground'}>
        {!isAdmin ? 'Active' : 'Admin'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/dashboard/sellers')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Seller Details</h1>
          <p className="text-muted-foreground">Complete seller information and verification</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{seller.fullName}</CardTitle>
                  <CardDescription>Seller Application Details</CardDescription>
                </div>
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
                    <p className="font-medium">{seller.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{seller.companyAddress}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Application Date</p>
                    <p className="font-medium">{new Date(seller.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Business Name</p>
                <p className="text-sm">{seller.companyName}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {!seller.isAdmin && (
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
                <Button onClick={handleReject} variant="destructive" className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDetails;