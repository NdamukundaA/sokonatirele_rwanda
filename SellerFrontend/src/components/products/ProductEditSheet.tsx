import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAllCategories, updateProduct } from '@/ApiConfig/ApiConfiguration';
import { Product } from '@/pages/Products';

type ProductEditSheetProps = {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedProduct: Product) => void;
};

const ProductEditSheet = ({ product, isOpen, onOpenChange, onSave }: ProductEditSheetProps) => {
  const [formData, setFormData] = useState({
    productname: product.productname || '',
    description: product.description || '',
    price: product.price || 0,
    offerPrice: product.offerPrice || '',
    productUnit: product.productUnit || 'unit',
    inStock: product.inStock !== undefined ? product.inStock : true,
    productCategory: typeof product.productCategory === 'object' ? product.productCategory?._id : product.productCategory || '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories when sheet opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllCategories();
      console.log('getAllCategories response:', response.data);
      if (response.data.success) {
        setCategories(response.data.categories || []);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue) || value === '') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : numValue }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        productname: formData.productname,
        description: formData.description,
        price: parseFloat(formData.price.toString()),
        offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice.toString()) : undefined,
        productUnit: formData.productUnit,
        inStock: formData.inStock,
        productCategory: formData.productCategory,
        images: images.length > 0 ? images : undefined,
      };

      console.log('Submitting productData:', productData);

      const response = await updateProduct(product._id, productData);
      console.log('updateProduct response:', response.data);

      if (response.data.success) {
        toast.success('Product updated successfully');
        onSave(response.data.product);
        onOpenChange(false);
      } else {
        toast.error(response.data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading categories...</span>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Product</SheetTitle>
          <SheetDescription>
            Make changes to the product details here.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="productname">Product Name</Label>
              <Input
                id="productname"
                name="productname"
                value={formData.productname}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="productCategory">Category</Label>
              <Select
                name="productCategory"
                value={formData.productCategory}
                onValueChange={(value) => setFormData(prev => ({ ...prev, productCategory: value }))}
              >
                <SelectTrigger id="productCategory">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price (frw)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleNumberChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="offerPrice">Offer Price (frw)</Label>
              <Input
                id="offerPrice"
                name="offerPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.offerPrice}
                onChange={handleNumberChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="productUnit">Unit</Label>
              <Input
                id="productUnit"
                name="productUnit"
                value={formData.productUnit}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="images">Product Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              {product.productImage && (
                <div className="mt-2">
                  <p className="text-sm text-slate-500">Current Image:</p>
                  <img
                    src={product.productImage}
                    alt={product.productname}
                    className="h-32 w-32 rounded-md object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: !!checked }))}
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>
          </div>

          <SheetFooter className="pt-4">
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ProductEditSheet;
