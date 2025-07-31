import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ImagePlus } from "lucide-react";
import { Category } from "./CategoryTable";
import { Badge } from "@/components/ui/badge";
import { updateCategory, getCategoryByProduct } from "@/ApiConfig/ApiConfiguration";
import { Card, CardContent } from "@/components/ui/card";

const categorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(3, { message: "Description must be at least 3 characters." }),
  status: z.enum(["active", "inactive"]),
  image: z.instanceof(FileList).optional().refine(
    (files) => {
      if (!files || files.length === 0) return true;
      const file = files[0];
      return file.type.startsWith('image/');
    },
    {
      message: "File must be an image",
    }
  ),
});

type FormValues = z.infer<typeof categorySchema>;

interface CategoryViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
  onUpdateCategory: (category: Category) => void;
}

interface Product {
  _id: string;
  id: string;
  productname: string;
  price: number;
  status: string;
  productImage: string;
  productUnit?: string;
}

export const CategoryViewSheet: React.FC<CategoryViewSheetProps> = ({
  open,
  onOpenChange,
  category,
  onUpdateCategory,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(category.imageSrc || null);
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotalPages, setProductsTotalPages] = useState(1);
  const PRODUCTS_PER_PAGE = 8;

  useEffect(() => {
    if (activeTab === "products") {
      const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
          const response = await getCategoryByProduct(category.id, productsPage, PRODUCTS_PER_PAGE);
          // If your backend supports pagination, pass page and limit as params
          // Otherwise, filter/slice on frontend (not recommended for large data)
          const fetchedProducts = response.data.products.map((prod: any) => ({
            _id: prod._id,
            id: prod._id,
            productname: prod.productname || 'Unnamed Product',
            price: prod.price || 0,
            status: prod.inStock ? 'In Stock' : 'Out of Stock',
            productImage: prod.productImage || '',
            productUnit: prod.productDetails?.productUnit || '',
          }));
          setProducts(fetchedProducts);
          setProductsTotalPages(response.data.pagination?.totalPages || 1);
        } catch (error) {
          toast.error("Failed to load products");
          console.error("Error fetching products:", error);
        } finally {
          setIsLoadingProducts(false);
        }
      };
      fetchProducts();
    }
  }, [activeTab, category.id, productsPage]);

  // Reset page when switching category or tab
  useEffect(() => {
    setProductsPage(1);
  }, [category.id, activeTab]);
  
  useEffect(() => {
    setImagePreview(category.imageSrc || null);
  }, [category]);

  const form = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description,
      status: category.status || "active",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      form.setValue('image', files);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const categoryData: { name?: string; description?: string; status?: "active" | "inactive"; image?: File } = {
        name: data.name,
        description: data.description,
        status: data.status,
      };
      if (data.image && data.image.length > 0) {
        categoryData.image = data.image[0];
      }

      const response = await updateCategory(category.id, categoryData);
      console.log('updateCategory response:', response.data);
      const updatedCategory: Category = {
        id: response.data.category._id,
        name: response.data.category.name,
        description: response.data.category.description,
        status: response.data.category.status || 'active',
        productCount: response.data.category.productCount || category.productCount,
        createdAt: response.data.category.createdAt ? new Date(response.data.category.createdAt).toISOString().split('T')[0] : category.createdAt,
        imageSrc: response.data.category.image || imagePreview || undefined,
      };

      onUpdateCategory(updatedCategory);
      toast.success("Category updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update category. Please try again.";
      toast.error(message);
      console.error("Error updating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-xl lg:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Category Details</SheetTitle>
        </SheetHeader>

        <Tabs 
          defaultValue="details" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          disabled={isSubmitting}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>Category Image</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label 
                              htmlFor="image-upload-edit" 
                              className="cursor-pointer flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <ImagePlus className="h-4 w-4 mr-2" />
                              {imagePreview ? 'Change Image' : 'Upload Image'}
                            </label>
                            <Input 
                              id="image-upload-edit" 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageChange} 
                              className="hidden" 
                              disabled={isSubmitting}
                            />
                          </div>
                          
                          {imagePreview && (
                            <div className="relative w-full h-32 rounded-md overflow-hidden border border-input">
                              <img 
                                src={imagePreview} 
                                alt="Category preview" 
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setImagePreview(null);
                                  form.setValue('image', undefined);
                                }}
                                disabled={isSubmitting}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Category'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-2">Category Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Created Date</div>
                <div>{category.createdAt}</div>
                <div className="text-muted-foreground">Products</div>
                <div>{category.productCount}</div>
                <div className="text-muted-foreground">ID</div>
                <div className="font-mono text-xs">{category.id}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products">
            {isLoadingProducts ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <Card key={product.id} className="overflow-hidden rounded-lg shadow-sm border">
                        <div className="relative">
                           <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-white">
                            {product.productImage ? (
                              <img
                                src={product.productImage}
                                alt={product.productname}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                No image
                              </div>
                            )}
                           </div>
                          <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === 'In Stock' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        <CardContent className="p-3 space-y-1">
                          <h5 className="font-medium text-sm truncate">{product.productname}</h5>
                          <p className="text-sm font-semibold text-emerald-600">
                             RWF {product.price.toFixed(2)} {product.productUnit ? `/ ${product.productUnit}` : ''}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No products in this category
                    </div>
                  )}
                </div>
                {productsTotalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={productsPage === 1}
                      onClick={() => setProductsPage(productsPage - 1)}
                      className="mx-1"
                    >
                      Previous
                    </Button>
                    <span className="mx-2 text-sm">Page {productsPage} of {productsTotalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={productsPage === productsTotalPages}
                      onClick={() => setProductsPage(productsPage + 1)}
                      className="mx-1"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};