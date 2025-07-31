import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Package, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Dummy product data
const productsData = [
  {
    id: 1,
    name: "Fresh Red Apples",
    description: "Premium red apples, handpicked at peak ripeness for the perfect balance of sweetness and crunch",
    category: "Fruits & Vegetables",
    price: 2.99,
    seller: "Fresh Mart Store",
    stock: 150,
    status: "active",
    rating: 4.5,
    reviews: 23,
    image: "/images/products/fresh-apples.jpg",
    dateAdded: "2024-01-20",
  },
  {
    id: 2,
    name: "Organic Spinach",
    description: "Fresh organic spinach leaves, rich in nutrients",
    category: "Fruits & Vegetables",
    price: 3.49,
    seller: "Organic Valley",
    stock: 85,
    status: "active",
    rating: 4.8,
    reviews: 15,
    image: "/images/products/organic-spinach.jpg",
    dateAdded: "2024-01-19",
  },
  {
    id: 3,
    name: "Whole Milk",
    description: "Fresh whole milk from local dairy farms",
    category: "Dairy & Eggs",
    price: 4.99,
    seller: "Dairy Delights",
    stock: 45,
    status: "active",
    rating: 4.3,
    reviews: 31,
    image: "/images/products/whole-milk.jpg",
    dateAdded: "2024-01-18",
  },
  {
    id: 4,
    name: "Sourdough Bread",
    description: "Artisan sourdough bread, freshly baked daily",
    category: "Bakery",
    price: 5.99,
    seller: "Artisan Bakery",
    stock: 25,
    status: "active",
    rating: 4.9,
    reviews: 42,
    image: "/images/products/sourdough-bread.jpg",
    dateAdded: "2024-01-17",
  },
  {
    id: 5,
    name: "Premium Olive Oil",
    description: "Extra virgin olive oil from Mediterranean olives",
    category: "Pantry Staples",
    price: 12.99,
    seller: "Gourmet Foods",
    stock: 0,
    status: "out_of_stock",
    rating: 4.7,
    reviews: 18,
    image: "/images/products/olive-oil.jpg",
    dateAdded: "2024-01-16",
  },
];

const Products = () => {
  const [products, setProducts] = useState(productsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const handleViewDetails = (id: number) => {
    navigate(`/dashboard/products/${id}`);
  };

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0 || status === "out_of_stock") {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (stock < 20) {
      return <Badge className="bg-warning text-warning-foreground">Low Stock</Badge>;
    }
    return <Badge className="bg-success text-success-foreground">In Stock</Badge>;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-current text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-current text-yellow-400 opacity-50" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
        <p className="text-muted-foreground">View and manage all products in your marketplace</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.stock > 0).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.stock > 0 && p.stock < 20).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.stock === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    {getStatusBadge(product.status, product.stock)}
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{product.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-medium text-primary">RWF {product.price}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stock</p>
                      <p className="font-medium">{product.stock} units</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Seller</p>
                      <p className="font-medium">{product.seller}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      {renderStars(product.rating)}
                      <span className="ml-1 text-muted-foreground">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Added: {product.dateAdded}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(product.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Products;