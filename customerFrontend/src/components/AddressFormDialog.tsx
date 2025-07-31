import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AddressData } from '@/types/address';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useShippingStore } from '@/store/shippingStore';
import { toast } from 'sonner';

const addressSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  city: z.string().min(1, 'City is required'),
  street: z.string().min(1, 'Street is required'),
  district: z.string().min(1, 'District is required'),
  phoneNumber: z.string().min(1, 'Phone number is required')
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingAddress?: AddressData | null;
}

const AddressFormDialog: React.FC<AddressFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  editingAddress
}) => {
  const { addNewAddress } = useShippingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      description: editingAddress?.description || '',
      city: editingAddress?.city || '',
      street: editingAddress?.street || '',
      district: editingAddress?.district || '',
      phoneNumber: editingAddress?.phoneNumber || ''
    }
  });

  useEffect(() => {
    if (editingAddress) {
      form.reset({
        description: editingAddress.description,
        city: editingAddress.city,
        street: editingAddress.street,
        district: editingAddress.district,
        phoneNumber: editingAddress.phoneNumber
      });
    }
  }, [editingAddress, form]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      setIsSubmitting(true);
      
      // Ensure all required fields are present with non-empty values
      const addressData = {
        description: data.description,
        city: data.city,
        street: data.street,
        district: data.district,
        phoneNumber: data.phoneNumber,
      };
      
      const success = await addNewAddress(addressData);
      
      if (success) {
        form.reset();
        onSuccess();
        toast.success('Address added successfully!');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter district" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Adding...' : 'Add Address'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressFormDialog;
