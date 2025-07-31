import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useShippingStore } from '@/store/shippingStore';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { AddressData } from '@/ApiConfig/ApiConfiguration';

interface Address {
  _id: string;
  description: string;
  city: string;
  street: string;
  district: string;
  phoneNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

const AddressManagement = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthCheck();
  const { addresses, addNewAddress, updateExistingAddress, removeAddress, fetchAddresses } = useShippingStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<AddressData>({
    description: '',
    city: '',
    street: '',
    district: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const loadAddresses = async () => {
      if (isAuthenticated) {
        try {
          await fetchAddresses();
        } catch (error) {
          console.error('Failed to fetch addresses:', error);
          toast.error('Failed to load addresses');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAddresses();
  }, [isAuthenticated, fetchAddresses]);

  const resetForm = () => {
    setFormData({
      description: '',
      city: '',
      street: '',
      district: '',
      phoneNumber: ''
    });
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      description: address.description,
      city: address.city,
      street: address.street,
      district: address.district,
      phoneNumber: address.phoneNumber
    });
    setEditingAddress(address._id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let success;
      if (editingAddress) {
        success = await updateExistingAddress(editingAddress, formData);
      } else {
        success = await addNewAddress(formData);
      }
      
      if (success) {
        setIsDialogOpen(false);
        resetForm();
        await fetchAddresses();
        toast.success(`Address ${editingAddress ? 'updated' : 'added'} successfully`);
      }
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast.error(error.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingAddress(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingAddress) {
      try {
        await removeAddress(deletingAddress);
        toast.success('Address deleted successfully');
        await fetchAddresses();
      } catch (error: any) {
        console.error('Error deleting address:', error);
        toast.error(error.message || 'Failed to delete address');
      } finally {
        setDeleteDialogOpen(false);
        setDeletingAddress(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingAddress(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto text-center py-8">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading addresses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/profile" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft size={20} className="mr-1" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl font-bold">Address Management</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
              <DialogDescription>
                Fill in all the required fields to {editingAddress ? 'update' : 'add'} your address.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Delivery Description *</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., Home, Office, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingAddress ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingAddress ? 'Update Address' : 'Add Address'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No addresses found</p>
              <p className="text-sm text-gray-400">Add your first address to get started.</p>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address: Address) => (
            <Card key={address._id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {address.description}
                    </CardTitle>
                    <CardDescription>{address.city}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(address._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{address.street}</p>
                  <p>{address.district}</p>
                  <p>{address.city}</p>
                  <p>Phone: {address.phoneNumber}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddressManagement;
