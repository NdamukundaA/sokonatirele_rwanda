import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { addProduct, getAllCategories } from '@/ApiConfig/ApiConfiguration';
import { Loader2 } from 'lucide-react';

const productSchema = z.object({
  productname: z.string().min(2, { message: "Name must be at least 2 characters." }),
  productCategory: z.string().min(1, { message: "Please select a category." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer." }),
  description: z.string().min(1, { message: "Description is required." }),
  productUnit: z.string().min(1, { message: "Product unit is required." }),
  offerPrice: z.coerce.number().optional(),
  images: z.array(z.any()).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

type AddProductDialogProps = {
  children: React.ReactNode;
  onProductAdded?: (product: any) => void;
};

const AddProductDialog = ({ children, onProductAdded }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productname: '',
      productCategory: '',
      price: 0,
      stock: 0,
      description: '',
      productUnit: 'piece',
      offerPrice: undefined,
      images: [],
    },
  });

  // Fetch categories when the dialog opens
  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        setIsLoadingCategories(true);
        try {
          const response = await getAllCategories();
          if (response.data.success) {
            setCategories(response.data.categories || []);
          } else {
            toast.error('Failed to load categories');
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
          toast.error('Error loading categories');
        } finally {
          setIsLoadingCategories(false);
        }
      };
      fetchCategories();
    }
  }, [open]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      const productData = {
        productname: data.productname,
        productCategory: data.productCategory,
        price: data.price,
        stock: data.stock,
        description: data.description,
        inStock: data.stock > 0,
        productUnit: data.productUnit,
        offerPrice: data.offerPrice || undefined,
      };

      formData.append('productData', JSON.stringify(productData));

      if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      const response = await addProduct(formData);
      if (response.data.success) {
        toast.success('Product added successfully');
        if (onProductAdded) {
          onProductAdded(response.data.product);
        }
        setOpen(false);
        form.reset();
      } else {
        toast.error(response.data.message || 'Failed to add product');
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Error adding product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="productname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Organic Apples" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="productCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting || isLoadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (frw)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="offerPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Price (frw)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="productUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                        <SelectItem value="gram">Gram</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="ml">Milliliter</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description..." 
                      className="resize-none min-h-[100px]" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => field.onChange(Array.from(e.target.files || []))}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="bg-emerald-500 hover:bg-emerald-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding Product...
                  </>
                ) : (
                  'Add Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
