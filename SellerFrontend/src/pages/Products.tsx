import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Plus, Search, Filter, Download, Eye, ToggleLeft, ToggleRight, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ProductDetailsDialog from '@/components/products/ProductDetailsDialog';
import ProductEditSheet from '@/components/products/ProductEditSheet';
import { getAllProducts, changeStockStatus, deleteProduct, getProductDetails } from '@/ApiConfig/ApiConfiguration';

export type Product = {
  _id: string;
  productname: string;
  description: string;
  productUnit: string;
  price: number;
  offerPrice?: number;
  productImage: string;
  productCategory: { _id: string; name: string } | string | null;
  ratings: Array<{ user: string; rating: number; createdAt: string }>;
  inStock: boolean;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  success: boolean;
  productList: Product[];
  pagination: {
    totalProducts: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const fetchProducts = async (page = 1, search = '', limit = 15) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllProducts({ page, limit, search, category: null });
      console.log('getAllProducts response:', response.data);
      if (response.data && response.data.success) {
        const data: ApiResponse = response.data;
        setProductsData(data.productList);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalProducts(data.pagination.totalProducts);
        setHasNextPage(data.pagination.hasNextPage);
        setHasPrevPage(data.pagination.hasPrevPage);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, searchTerm, 20);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchProducts(1, searchTerm, 20);
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await deleteProduct(productId);
      if (response.data && response.data.success) {
        setProductsData(prev => prev.filter(product => product._id !== productId));
        toast.success("Product deleted successfully");
        fetchProducts(currentPage, searchTerm, 20);
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleStatus = async (productId: string) => {
    try {
      const product = productsData.find(p => p._id === productId);
      if (!product) return;
      const response = await changeStockStatus(productId, !product.inStock);
      if (response.data && response.data.success) {
        setProductsData(prev =>
          prev.map(p =>
            p._id === productId ? { ...p, inStock: !p.inStock } : p
          )
        );
        toast.success("Product status updated successfully");
      } else {
        throw new Error('Failed to update product status');
      }
    } catch (err) {
      console.error('Error updating product status:', err);
      toast.error('Failed to update product status');
    }
  };

  const handleViewProduct = async (product: Product) => {
    try {
      const response = await getProductDetails(product._id);
      if (response.data && response.data.success) {
        setSelectedProduct(response.data.product);
      } else {
        setSelectedProduct(product);
      }
      setIsViewOpen(true);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setSelectedProduct(product);
      setIsViewOpen(true);
    }
  };

  const handleEditProduct = (product: Product) => {
    console.log('Editing product:', product);
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    setProductsData(prev =>
      prev.map(p => p._id === updatedProduct._id ? updatedProduct : p)
    );
    setIsEditOpen(false);
    fetchProducts(currentPage, searchTerm, 20);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchProducts(page, searchTerm, 20);
    }
  };

  const getProductStatus = (product: Product): 'In Stock' | 'Out of Stock' => {
    return product.inStock ? 'In Stock' : 'Out of Stock';
  };

  const getAverageRating = (product: Product): number => {
    if (!product.ratings || product.ratings.length === 0) return 0;
    const sum = product.ratings.reduce((total, rating) => total + rating.rating, 0);
    return Number((sum / product.ratings.length).toFixed(1));
  };

  const getCategoryName = (productCategory: { _id: string; name: string } | string | null): string => {
    // Handle null or undefined
    if (!productCategory) {
      return 'No Category';
    }
    
    // Handle string values
    if (typeof productCategory === 'string') {
      return productCategory;
    }
    
    // Handle object values - ensure it has a name property
    if (typeof productCategory === 'object' && productCategory !== null && 'name' in productCategory) {
      return productCategory.name || 'Unknown Category';
    }
    
    return 'Unknown Category';
  };

  if (loading && productsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  if (error && productsData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchProducts(1, searchTerm, 20)}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-slate-500">
          Manage your product inventory and categories. ({totalProducts} total products)
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="w-full md:w-72 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search products..."
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
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600"
            onClick={() => navigate('/products/add')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading...
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsData.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-md bg-slate-100 overflow-hidden">
                        {product.productImage && (
                          <img
                            src={product.productImage}
                            alt={product.productname}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.png';
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.productname}</div>
                        <div className="text-sm text-slate-500">
                          {product.productUnit} • {product._id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getCategoryName(product.productCategory)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{getAverageRating(product)}</span>
                      <span className="text-xs text-slate-400 ml-1">
                        ({product.ratings?.length || 0})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleToggleStatus(product._id)}
                      >
                        {product.inStock ? (
                          <ToggleRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-red-500" />
                        )}
                        {getProductStatus(product)}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">frw {product.price.toFixed(2)}</div>
                      {product.offerPrice && product.offerPrice < product.price && (
                        <div className="text-sm text-emerald-600">
                          Offer: frw {product.offerPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            handleDeleteProduct(product._id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {productsData.length === 0 && !loading && (
            <div className="text-center py-8 text-slate-500">
              {searchTerm ? `No products found matching "${searchTerm}"` : 'No products found'}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (hasPrevPage) handlePageChange(currentPage - 1);
                }}
                className={!hasPrevPage ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={pageNum === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum);
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (hasNextPage) handlePageChange(currentPage + 1);
                }}
                className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {selectedProduct && (
        <>
          <ProductDetailsDialog
            product={selectedProduct}
            isOpen={isViewOpen}
            onOpenChange={setIsViewOpen}
            onEdit={() => {
              setIsViewOpen(false);
              setIsEditOpen(true);
            }}
            onStatusChange={(product) => {
              handleToggleStatus(product._id);
            }}
          />
          <ProductEditSheet
            product={selectedProduct}
            isOpen={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSave={handleSaveProduct}
          />
        </>
      )}
    </div>
  );
};

export default Products;
