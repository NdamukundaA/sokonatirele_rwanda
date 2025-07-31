import { ShoppingBasket, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const { addItem, isAuthenticated } = useCartStore();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    if (!product || !product.productname) {
      toast.error("Product information is incomplete.");
      return;
    }

    setIsAddingToCart(true);
    
    try {
      await addItem({ ...product, id: product._id });
      toast.success(`Added ${product.productname} to your cart!`);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const hasDiscount = product.offerPrice && product.offerPrice < product.price;

  const getAverageRating = () => {
    const rating = parseFloat(product.averageRating);
    return isNaN(rating) ? 0 : rating;
  };

  // Get product unit from various possible field names
  const getProductUnit = () => {
    // Priority order: database field first, then fallbacks
    const unit = product.productUnit || product.unit || product.productunit || "unit";
    
    // Debug logging to help identify unit field issues
    if (!product.productUnit && !product.unit && !product.productunit) {
      console.log('ProductCard: No unit found for product:', {
        productname: product.productname,
        productUnit: product.productUnit,
        unit: product.unit,
        productunit: product.productunit,
        fallback: "unit"
      });
    }
    
    return unit;
  };

  const averageRating = getAverageRating();
  const productUnit = getProductUnit();

  return (
    <Link to={`/product/${product._id}`} className="block">
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-48">
          {/* Image loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          
          {/* Product image with lazy loading */}
          <img
            src={imageError ? "/placeholder-product.jpg" : product.productImage}
            alt={product.productname}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {((product.price - product.offerPrice) / product.price * 100).toFixed(0)}% OFF
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="text-xs text-gray-500 mb-1">{product.productCategory?.name || "Unknown"}</div>
          <h3 className="font-semibold text-gray-800 mb-2 truncate">{product.productname}</h3>
          
          <div className="flex items-center mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star} 
                  className={`w-4 h-4 ${star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({averageRating.toFixed(1)})
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              {product.offerPrice ? (
                <div className="flex items-center">
                  <span className="text-lg font-bold text-green-600 mr-2">
                    RWF {product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    RWF {product.offerPrice.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-green-600">
                  RWF {product.price.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-gray-600">/{productUnit}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-green-100 hover:text-green-600"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <ShoppingBasket size={20} />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="md:hidden bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="p-4">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              {/* Mobile image loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              )}
              
              <img
                src={imageError ? "/placeholder-product.jpg" : product.productImage}
                alt={product.productname}
                className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {hasDiscount && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                  {((product.price - product.offerPrice) / product.price * 100).toFixed(0)}% OFF
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1">
                {product.productCategory?.name || "Unknown"}
              </div>
              
              <h3 className="font-semibold text-gray-800 mb-2 text-sm leading-tight">
                {product.productname}
              </h3>

              <div className="flex items-center mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className={`w-3 h-3 ${star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  ({averageRating.toFixed(1)})
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  {product.offerPrice ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-green-600">
                          RWF {product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          RWF {product.offerPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-base font-bold text-green-600">
                      RWF {product.price.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xs text-gray-600">/{productUnit}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-green-100 hover:text-green-600"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <Loader2 size={20} className="animate-spin text-green-600" />
                  ) : (
                    <ShoppingBasket size={20} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;