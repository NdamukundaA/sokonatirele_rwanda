import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import CustomerViewDialog from '@/components/customers/CustomerViewDialog';
import { getAllCustomers } from '@/ApiConfig/ApiConfiguration';

const statusStyles = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-slate-100 text-slate-800'
};

const getInitials = (name: string) => {
  if (!name || typeof name !== 'string') return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return '?';
  return words
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Customers = () => {
  const [customersData, setCustomersData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const limit = 10;

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllCustomers({
        page: currentPage,
        limit,
        search: searchTerm,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      const { customers, totalPages } = response.data;
      const mappedCustomers = customers.map(customer => ({
        id: customer._id,
        name: customer.fullName || 'Unnamed Customer',
        email: customer.email || 'No email',
        location: customer.address || 'Not provided',
        orders: customer.ordersCount || 0,
        spent: customer.spent || 0,
        status: customer.status || 'Active',
        lastOrder: customer.lastOrder || 'N/A',
        phone: customer.phoneNumber || 'No phone',
        addresses: customer.addresses || []
      }));
      setCustomersData(mappedCustomers);
      setTotalPages(totalPages);
    } catch (error) {
      setError('Failed to fetch customers: ' + (error.response?.data?.message || error.message));
      toast.error('Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-slate-500">View and manage your customer base.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="w-full md:w-72 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-6">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersData.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-emerald-100 text-emerald-800">
                          <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-slate-500">{customer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.location}</TableCell>
                    <TableCell className="text-center">{customer.orders}</TableCell>
                    <TableCell className="text-right">${customer.spent.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={statusStyles[customer.status]}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.lastOrder}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {customersData.length === 0 && !isLoading && !error && (
            <div className="text-center py-6 text-slate-500">
              No customers matching your search criteria
            </div>
          )}
        </CardContent>
      </Card>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <CustomerViewDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default Customers;