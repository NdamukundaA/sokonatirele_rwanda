import React, { useState } from 'react';
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
import { Loader2, ImagePlus } from 'lucide-react';
import { Category } from './CategoryTable';
import { createCategory } from '@/ApiConfig/ApiConfiguration';

const categorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(3, { message: "Description must be at least 3 characters." }),
  status: z.enum(["active", "inactive"], { message: "Please select a valid status" }),
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

type CategoryFormValues = z.infer<typeof categorySchema>;

type AddCategoryDialogProps = {
  children: React.ReactNode;
  onCategoryAdded: (category: Category) => void;
};

export const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({ children, onCategoryAdded }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
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

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      const categoryData: { name: string; description: string; status: "active" | "inactive"; image?: File } = {
        name: data.name,
        description: data.description,
        status: data.status,
      };
      if (data.image && data.image.length > 0) {
        categoryData.image = data.image[0];
      }

      const response = await createCategory(categoryData);
      const newCategory: Category = {
        id: response.data.category._id,
        name: response.data.category.name,
        description: response.data.category.description,
        status: response.data.category.status || 'active',
        productCount: response.data.category.productCount || 0,
        createdAt: response.data.category.createdAt ? new Date(response.data.category.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        imageSrc: response.data.category.image || imagePreview || undefined,
      };

      onCategoryAdded(newCategory);
      toast.success("Category added successfully");
      setOpen(false);
      form.reset();
      setImagePreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add category");
      console.error("Error adding category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset();
      setImagePreview(null);
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Fresh fruits" {...field} disabled={isSubmitting} />
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
                    <Input placeholder="fersh fruits and  helthy" {...field} disabled={isSubmitting} />
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
                          htmlFor="image-upload" 
                          className="cursor-pointer flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ImagePlus className="h-4 w-4 mr-2" />
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                        </label>
                        <Input 
                          id="image-upload" 
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

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="bg-emerald-500 hover:bg-emerald-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
