import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingBasket, Clock, Star, ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { getProductDetails, getAllProducts, rateProduct } from "@/ApiConfig/ApiConfiguration";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem, isAuthenticated } = useCartStore();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [showLatest, setShowLatest] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await getProductDetails(productId);
        setProduct(response.product);

        // Fetch related products (same category)
        if (response.product.productCategory) {
          const relatedResponse = await getAllProducts(1, 4, "", response.product.productCategory._id);
          setRelatedProducts(relatedResponse.productList.filter(p => p._id !== productId));
        }

        // Fetch latest products
        const latestResponse = await getAllProducts(1, 4);
        setLatestProducts(latestResponse.productList.filter(p => p._id !== productId));
      } catch (err) {
        setError(err.message || "Failed to fetch product details");
        toast.error(err.message || "Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (product) {
      setIsAddingToCart(true);
      try {
        const cartProduct = {
          id: product._id,
          name: product.productname,
          price: product.offerPrice || product.price,
          image: product.productImage,
          category: product.productCategory?.name || "Unknown",
          unit: product.productUnit || "unit",
          discount: product.offerPrice ? ((product.price - product.offerPrice) / product.price * 100) : 0,
        };
        await addItem(cartProduct); // Assume addItem is async or returns a Promise
        toast.success(`Added ${product.productname} to your cart!`);
      } catch (err) {
        toast.error(err.message || "Failed to add to cart");
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to continue shopping");
      navigate("/login");
      return;
    }

    if (product) {
      setIsBuyingNow(true);
      try {
        const cartProduct = {
          id: product._id,
          name: product.productname,
          price: product.offerPrice || product.price,
          image: product.productImage,
          category: product.productCategory?.name || "Unknown",
          unit: product.productUnit || "unit",
          discount: product.offerPrice ? ((product.price - product.offerPrice) / product.price * 100) : 0,
        };
        await addItem(cartProduct); // Assume addItem is async or returns a Promise
        toast.success(`Added ${product.productname} to your cart!`);
        navigate("/checkout");
      } catch (err) {
        toast.error(err.message || "Failed to add to cart");
      } finally {
        setIsBuyingNow(false);
      }
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      toast.error("Please log in to rate products");
      navigate("/login");
      return;
    }

    try {
      const response = await rateProduct(productId);
      setUserRating(rating);
      setProduct(response.product); // Update product with new rating
      toast.success(`Thank you for rating ${product.productname}!`);
    } catch (error) {
      toast.error(error.message || "Failed to rate product");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 flex justify-center items-center flex-1">
          <p className="text-lg text-gray-500">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 flex justify-center items-center flex-1">
          <p className="text-lg text-red-500">{error || "Product not found"}</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate the discount price if applicable
  const discountedPrice = product.offerPrice || null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 pt-36 pb-12">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-green-600 w-fit">
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="relative h-80 mb-4">
              <img
                src={product.productImage}
                alt={product.productname}
                className="w-full h-full object-contain"
              />
              {discountedPrice && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-sm font-semibold px-2 py-1 rounded-full">
                  {((product.price - product.offerPrice) / product.price * 100).toFixed(0)}% OFF
                </div>
              )}
            </div>
            <div className="flex justify-center gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 h-9 px-3 text-sm"
                onClick={handleAddToCart}
                disabled={isAddingToCart || isBuyingNow}
              >
                {isAddingToCart ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <>
                    <ShoppingBasket className="mr-2" size={16} />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600 h-9 px-3 text-sm"
                onClick={handleBuyNow}
                disabled={isAddingToCart || isBuyingNow}
              >
                {isBuyingNow ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>Buy Now</>
                )}
              </Button>
            </div>
          </div>

          <div>
            <span className="text-sm text-gray-500">{product.productCategory?.name}</span>
            <h1 className="text-3xl font-bold mb-2">{product.productname}</h1>

            <div className="mb-4">
              {discountedPrice ? (
                <div className="flex items-end">
                  <span className="text-2xl font-bold text-green-600 mr-2">
                    frw{product.price.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    frw{discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/{product.productUnit}</span>
                </div>
              ) : (
                <div className="flex items-end">
                  <span className="text-2xl font-bold text-gray-800">
                    frw{product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/{product.productUnit}</span>
                </div>
              )}
            </div>

            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= (product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
                <span className="text-gray-600 ml-2">({product.averageRating || 0})</span>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200"
                  >
                    <Star className="mr-1" size={14} />
                    Rate Product
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Rate this product</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          className="p-1 rounded-full hover:bg-gray-100"
                          onMouseEnter={() => setHoverRating(rating)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => handleRating(rating)}
                        >
                          <svg
                            className={`w-6 h-6 ${
                              (hoverRating !== null ? rating <= hoverRating : rating <= (userRating || 0))
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                    {userRating && (
                      <p className="text-xs text-green-600">
                        You rated this product {userRating} stars
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <p className="text-gray-600 mb-6">
              {product.description}
            </p>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger>Product Description</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">
                    {product.description}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="delivery">
                <AccordionTrigger>Delivery Information</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">
                    Orders placed before 2 PM are eligible for same-day delivery.
                    We deliver 7 days a week from 9 AM to 8 PM.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{showLatest ? "Latest Products" : "Related Products"}</h2>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={!showLatest ? "bg-green-100 text-green-700 border-green-300" : ""}
              onClick={() => setShowLatest(false)}
            >
              Related Products
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={showLatest ? "bg-green-100 text-green-700 border-green-300" : ""}
              onClick={() => setShowLatest(true)}
            >
              <Clock className="mr-1" size={14} />
              Latest Products
            </Button>
          </div>
        </div>

        {(showLatest ? latestProducts : relatedProducts).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(showLatest ? latestProducts : relatedProducts).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetails;