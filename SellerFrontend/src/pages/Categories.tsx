
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { 
  Table, TableHeader, TableBody, 
  TableRow, TableHead, TableCell 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Loader2, Plus, Edit, Trash2, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { getAllCategories, createCategory, updateCategory, deleteCategory, getCategoryByProduct } from '@/ApiConfig/ApiConfiguration';
import { AddCategoryDialog } from '@/components/categories/AddCategoryDialog';
import { CategoryViewSheet } from '@/components/categories/CategoryViewSheet';
import { Category } from '@/components/categories/CategoryTable';

interface Product {
  _id: string;
  id: string;
  productname: string;
  price: number;
  productImage: string;
  inStock: boolean;
  averageRating: number;
  productCategory: {
    _id: string;
    name: string;
  };
  productUnit?: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<{ [key: string]: Product[] }>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useIsAuthenticated();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await getAllCategories();
        if (response.data && response.data.categories) {
          const formattedCategories: Category[] = response.data.categories.map((cat: any) => ({
            id: cat._id,
            name: cat.name,
            description: cat.description,
            status: cat.status || 'active',
            imageSrc: cat.image,
            productCount: cat.productCount || 0,
            createdAt: cat.createdAt ? new Date(cat.createdAt).toISOString().split('T')[0] : '',
          }));
          setCategories(formattedCategories);
          toast({
            title: "Success",
            description: "Categories loaded successfully",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

  const handleCategoryAdded = (newCategory: Category) => {
    const formattedNewCategory: Category = {
      id: newCategory.id,
      name: newCategory.name,
      description: newCategory.description,
      status: newCategory.status,
      imageSrc: newCategory.imageSrc,
      productCount: newCategory.productCount || 0,
      createdAt: newCategory.createdAt || new Date().toISOString().split('T')[0],
    };
    setCategories([formattedNewCategory, ...categories]);
    toast({
      title: "Success",
      description: "Category added successfully",
    });
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setSheetOpen(true);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories(categories.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
    toast({
      title: "Success",
      description: "Category updated successfully",
    });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(categoryId);
        setCategories(categories.filter(category => category.id !== categoryId));
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete category",
          variant: "destructive",
        });
      }
    }
  };

  const handleExpandCategory = async (categoryId: string) => {
    if (!categoryId) return;
    
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(categoryId);
    setIsLoadingProducts(prev => ({ ...prev, [categoryId]: true }));

    try {
      const response = await getCategoryByProduct(categoryId);
      if (response.data && response.data.products) {
        const formattedProducts: Product[] = response.data.products.map((prod: any) => ({
          _id: prod._id,
          id: prod._id,
          productname: prod.productname || 'Unnamed Product',
          price: prod.price || 0,
          productImage: prod.productImage || '',
          inStock: prod.inStock || false,
          averageRating: prod.averageRating || 0,
          productCategory: prod.productCategory,
          productUnit: prod.productDetails?.productUnit || prod.productUnit || '',
        }));

        setCategoryProducts(prev => ({
          ...prev,
          [categoryId]: formattedProducts
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to load products',
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  return (
    <div className="space-y-6 p-6 pb-16 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <AddCategoryDialog onCategoryAdded={handleCategoryAdded}>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </AddCategoryDialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No categories found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <React.Fragment key={category.id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExpandCategory(category.id)}
                          >
                            {expandedCategory === category.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          category.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedCategory === category.id && (
                      <TableRow>
                        <TableCell colSpan={4} className="bg-gray-50">
                          <div className="p-4">
                            <h4 className="font-medium mb-2">Products in this category</h4>
                            {isLoadingProducts[category.id] ? (
                              <div className="flex justify-center items-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                              </div>
                            ) : categoryProducts[category.id]?.length > 0 ? (
                              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {categoryProducts[category.id].map((product) => (
                                  <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                    <div className="relative">
                                      <div className="w-full h-32 bg-white flex items-center justify-center overflow-hidden">
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
                                      <span className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium ${
                                        product.inStock 
                                          ? 'bg-green-100 text-green-700 border border-green-200' 
                                          : 'bg-red-100 text-red-700 border border-red-200'
                                      }`}>
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                      </span>
                                    </div>
                                    <div className="p-3 space-y-2">
                                      <h5 className="font-medium text-sm text-gray-900 truncate" title={product.productname}>
                                        {product.productname}
                                      </h5>
                                      <p className="text-sm font-semibold text-emerald-600">
                                        FRW {product.price.toFixed(2)}{product.productUnit ? ` / ${product.productUnit}` : ''}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-gray-500 py-4">
                                No products found in this category.
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedCategory && (
        <CategoryViewSheet 
          open={sheetOpen} 
          onOpenChange={setSheetOpen} 
          category={selectedCategory}
          onUpdateCategory={handleUpdateCategory}
        />
      )}
    </div>
  );
};

export default Categories;