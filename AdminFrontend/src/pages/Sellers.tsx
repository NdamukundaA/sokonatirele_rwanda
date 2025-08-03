// Sellers.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllSellers, GetSellersParams, Pagination, Seller } from '@/ApiConfiguration/ApiConfiguration';

const Sellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchSellers = async () => {
    try {
      setIsLoading(true);
      const params: GetSellersParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      console.log('Fetching sellers with params:', params);
      const response = await getAllSellers(params);
      console.log('API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'No response');
      
      // Check if response has data property
      const sellersData = response.data || response;
      console.log('Sellers data:', sellersData);
      
      if (sellersData && (sellersData.sellers || Array.isArray(sellersData))) {
        const sellersList = Array.isArray(sellersData) ? sellersData : sellersData.sellers;
        console.log('Found sellers:', sellersList.length);
        setSellers(sellersList);
        setPagination(sellersData.pagination || null);
      } else {
        console.log('No sellers data in response:', response);
        setSellers([]);
        setPagination(null);
        throw new Error('No sellers data received from server');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch sellers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSellers();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [currentPage, searchTerm]);

  const handleViewDetails = (id: string) => {
    navigate(`/dashboard/sellers/${id}`);
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Seller Management</h1>
        <p className="text-muted-foreground">Manage seller applications and approvals</p>
      </div>

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
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : (
          <>
            {sellers.map((seller) => (
              <Card key={seller._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{seller.fullName}</h3>
                  
                      </div>

                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {seller.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {seller.phoneNumber}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {seller.companyAddress}
                        </div>
                      </div>

                      <p className="text-sm mt-2">{seller.companyName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined: {new Date(seller.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(seller._id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sellers.length === 0 && !isLoading && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No sellers found
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} sellers
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Sellers;