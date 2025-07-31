import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ArrowLeft,
  Star,
  Edit,
  Trash2,
  ShoppingCart,
  Calendar,
  Store,
  BarChart,
  DollarSign,
  Activity,
  TrendingUp,
  Clock
} from "lucide-react";

// Using the same dummy data for now
const productsData = [
  {
    id: 1,
    name: "Sourdough Bread",
    description: "Artisan sourdough bread, freshly baked daily",
    category: "Bakery",
    price: 5.99,
    seller: "Artisan Bakery",
    stock: 25,
    status: "active",
    rating: 4.9,
    reviews: 42,
    image: "/images/products/fresh-apples.jpg",
    dateAdded: "2024-01-17",
    detailedDescription: "Our premium red apples are carefully handpicked from sustainable local orchards at the perfect moment of ripeness. Each apple is selected for its vibrant red color, firm texture, and ideal balance of sweet and tart flavors. These apples are grown using environmentally friendly farming practices, ensuring both quality and sustainability. Excellent for fresh eating, baking, or adding to salads. The crisp, juicy flesh and robust flavor make these apples a perfect healthy snack choice.",
    nutritionalInfo: {
      calories: "95 kcal",
      protein: "0.5g",
      carbs: "25g",
      fiber: "4g",
      sugar: "19g",
      vitamins: "Vit C, B6",
      minerals: "Potassium"
    },
    salesHistory: [
      { month: "Jan", sales: 450 },
      { month: "Feb", sales: 520 },
      { month: "Mar", sales: 480 }
    ],
    recentReviews: [
      { id: 1, user: "John D.", rating: 5, comment: "Great quality apples!", date: "2024-01-18" },
      { id: 2, user: "Sarah M.", rating: 4, comment: "Fresh and sweet", date: "2024-01-15" }
    ]
  },
  // ... other products
];

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const product = productsData.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/dashboard/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/products')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold">Product Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="w-full h-80 bg-muted rounded-lg overflow-hidden mb-4 group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="space-y-4">
              {getStatusBadge(product.status, product.stock)}
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
                <span className="ml-2 text-sm text-muted-foreground">
                  {product.rating.toFixed(1)} ({product.reviews} reviews)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{product.name}</h2>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-primary">RWF {product.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock Level</p>
                  <p className="font-medium">{product.stock} units</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Added On</p>
                  <p className="font-medium">{product.dateAdded}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,450</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF 4,335.50</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{product.rating}</div>
            <p className="text-xs text-muted-foreground">From {product.reviews} reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{product.detailedDescription}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Nutritional Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {product.recentReviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.user}</span>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetails;
