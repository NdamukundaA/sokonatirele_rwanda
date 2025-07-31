import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Package, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dummy category data
const categoriesData = [
  {
    id: 1,
    name: "Fruits & Vegetables",
    description: "Fresh fruits and vegetables from local farms",
    productCount: 245,
    image: "/images/categories/fruits-vegetables.jpg",
    status: "active",
    averagePrice: 5.99, // Added for currency demonstration
  },
  {
    id: 2,
    name: "Dairy & Eggs",
    description: "Fresh dairy products, milk, cheese, and eggs",
    productCount: 89,
    image: "/images/categories/dairy-eggs.jpg",
    status: "active",
    averagePrice: 3.49,
  },
  {
    id: 3,
    name: "Meat & Seafood",
    description: "Fresh meat, poultry, and seafood products",
    productCount: 156,
    image: "/images/categories/meat-seafood.jpg",
    status: "active",
    averagePrice: 12.99,
  },
  {
    id: 4,
    name: "Bakery",
    description: "Fresh bread, pastries, and baked goods",
    productCount: 78,
    image: "/images/categories/bakery.jpg",
    status: "active",
    averagePrice: 4.29,
  },
  {
    id: 5,
    name: "Pantry Staples",
    description: "Grains, rice, pasta, and cooking essentials",
    productCount: 198,
    image: "/images/categories/pantry.jpg",
    status: "active",
    averagePrice: 2.99,
  },
  {
    id: 6,
    name: "Beverages",
    description: "Juices, soft drinks, water, and other beverages",
    productCount: 134,
    image: "/images/categories/beverages.jpg",
    status: "active",
    averagePrice: 1.99,
  },
];

const Categories = () => {
  const [categories, setCategories] = useState(categoriesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    averagePrice: 0,
  });
  const [currency, setCurrency] = useState("RWF"); // New state for currency
  const { toast } = useToast();

  // Conversion rate: 1 USD = 1300 RWF (approximate, as of 2025)
  const convertPrice = (price) => {
    if (currency === "RWF") {
      return (price * 1300).toFixed(0);
    }
    return price.toFixed(2);
  };

  const getCurrencySymbol = () => {
    return currency === "USD" ? "$" : "RWF";
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", image: "", averagePrice: 0 });
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image,
      averagePrice: category.averagePrice,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (id) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    toast({
      title: "Category Deleted",
      description: "Category has been successfully deleted",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? { ...cat, ...formData }
            : cat
        )
      );
      toast({
        title: "Category Updated",
        description: "Category has been successfully updated",
      });
    } else {
      const newCategory = {
        id: Date.now(),
        ...formData,
        productCount: 0,
        status: "active",
      };
      setCategories((prev) => [...prev, newCategory]);
      toast({
        title: "Category Created",
        description: "New category has been successfully created",
      });
    }
    
    setIsDialogOpen(false);
    setFormData({ name: "", description: "", image: "", averagePrice: 0 });
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Categories</h1>
          <p className="text-muted-foreground">Manage product categories for your marketplace</p>
        </div>
        <div className="flex gap-2">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RWF">RWF</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddCategory} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter((cat) => cat.status === "active").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="h-48 bg-muted overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {category.productCount} products
                  </CardDescription>
                  <CardDescription className="text-sm">
                    Avg. Price: {getCurrencySymbol()} {convertPrice(category.averagePrice)}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category information below."
                : "Create a new product category for your marketplace."
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Fruits & Vegetables"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this category..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="image">Image URL (Optional)</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="averagePrice">Average Price (in {currency})</Label>
              <Input
                id="averagePrice"
                type="number"
                step="0.01"
                value={formData.averagePrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, averagePrice: parseFloat(e.target.value) }))}
                placeholder={currency === "USD" ? "e.g., 5.99" : "e.g., 7800"}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;