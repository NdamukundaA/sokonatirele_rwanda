import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { addProduct, getAllCategories } from '@/ApiConfig/ApiConfiguration';

const productSchema = z.object({
  productname: z.string().min(2, { message: "Name must be at least 2 characters." }),
  productCategory: z.string().min(1, { message: "Please select a category." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer." }),
  description: z.string().min(1, { message: "Description is required." }),
  productUnit: z.string().min(1, { message: "Product unit is required." }),
  offerPrice: z.coerce.number().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const AddProduct = () => {
  const navigate = useNavigate();
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
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
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPreviewImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...previewImages];
    updatedImages.splice(index, 1);
    setPreviewImages(updatedImages);
    
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one product image');
      return;
    }

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

      selectedFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      const response = await addProduct(formData);
      if (response.data.success) {
        toast.success('Product added successfully');
        navigate('/products');
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

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/products')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
      </div>
      
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-slate-500">Create a new product listing with details and images.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        placeholder="Enter product description here..." 
                        className="resize-none min-h-[120px]" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Product Images *</FormLabel>
                  <div className="border-2 border-dashed rounded-md border-slate-300 p-6 text-center hover:border-emerald-500 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-10 w-10 text-slate-400" />
                      <p className="text-sm text-slate-500">
                        Drag and drop images here, or click to browse
                      </p>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={isSubmitting}
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        className="mt-2"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={isSubmitting}
                      >
                        Select Files
                      </Button>
                    </div>
                  </div>
                </div>

                {previewImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Preview:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {previewImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden bg-slate-100">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={isSubmitting}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/products')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
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
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
