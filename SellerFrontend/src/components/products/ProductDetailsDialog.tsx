import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star, ToggleLeft, ToggleRight } from 'lucide-react';
import { Product } from '@/pages/Products';

type ProductDetailsDialogProps = {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onStatusChange: (product: Product) => void;
};

const ProductDetailsDialog = ({ product, isOpen, onOpenChange, onEdit, onStatusChange }: ProductDetailsDialogProps) => {
  const getAverageRating = (product: Product): number => {
    if (!product.ratings || product.ratings.length === 0) return 0;
    const sum = product.ratings.reduce((total, rating) => total + rating.rating, 0);
    return Number((sum / product.ratings.length).toFixed(1));
  };

  const formatPrice = (price: number | undefined): string => {
    if (price === undefined || isNaN(price) || price < 0) return 'frw 0.00';
    return `frw ${price.toFixed(2)}`;
  };

  const getCategoryName = (category: string | { _id: string; name: string } | undefined): string => {
    if (!category) return 'Unknown Category';
    if (typeof category === 'string') return category;
    return category.name;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>View detailed information about this product.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {product.productImage && (
            <div className="flex justify-center">
              <img
                src={product.productImage}
                alt={product.productname}
                className="w-32 h-32 object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
            </div>
          )}
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label className="font-bold">ID:</Label>
              <p>{product._id.slice(-4)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-bold">Name:</Label>
              <p>{product.productname}</p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-bold">Category:</Label>
              <p>{getCategoryName(product.productCategory)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-bold">Price:</Label>
              <p>{formatPrice(product.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-bold">Status:</Label>
              <div className="flex items-center gap-2">
                <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => onStatusChange(product)}
                >
                  {product.inStock ? 'Set Out of Stock' : 'Set In Stock'}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-bold">Rating:</Label>
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{getAverageRating(product)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-bold">Description:</Label>
              <p className="text-gray-500">{product.description || 'No description available'}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button className="bg-green-500 hover:bg-green-600" onClick={onEdit}>
            Edit Product
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
