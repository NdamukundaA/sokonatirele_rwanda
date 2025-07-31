// Products.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/ApiConfig/ApiConfiguration";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const category = searchParams.get("category") || null;
  
  // State for infinite scroll
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref for intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);

  const limit = 15;

  // Intersection observer callback
  const lastProductElementRef = useCallback((node: HTMLElement | null) => {
    if (loading || loadingMore) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreProducts();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // Load more products function
  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      console.log("Loading more products:", { page: nextPage, limit, search: searchTerm, category });
      
      const response = await getAllProducts(nextPage, limit, searchTerm, category);
      const newProducts = response.productList || [];
      
      if (newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setCurrentPage(nextPage);
        setHasMore(response.pagination?.hasNextPage || false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to load more products";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial load function
  const loadInitialProducts = async () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setHasMore(true);
    
    try {
      console.log("Fetching initial products:", { page: 1, limit, search: searchTerm, category });
      const response = await getAllProducts(1, limit, searchTerm, category);
      const initialProducts = response.productList || [];
      
      setProducts(initialProducts);
      setHasMore(response.pagination?.hasNextPage || false);
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch products";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Reset and reload when search params change
  useEffect(() => {
    setProducts([]);
    loadInitialProducts();
  }, [searchParams, category]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-green-600 w-fit">
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          {searchTerm ? `Results for "${searchTerm}"` : category ? `Products in Category` : "All Products"}
        </h1>
        
        {/* Initial loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              onClick={loadInitialProducts}
              className="bg-green-600 hover:bg-green-700"
            >
              Try Again
            </Button>
          </div>
        )}
        
        {/* Products grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product, index) => {
              // Add ref to last product for intersection observer
              if (products.length === index + 1) {
                return (
                  <div key={product._id} ref={lastProductElementRef}>
                    <ProductCard product={product} />
                  </div>
                );
              } else {
                return <ProductCard key={product._id} product={product} />;
              }
            })}
          </div>
        )}
        
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading more products...</span>
          </div>
        )}
        
        {/* No more products indicator */}
        {!hasMore && products.length > 0 && !loading && !loadingMore && (
          <div className="text-center py-8">
            <p className="text-gray-500">No more products to load</p>
          </div>
        )}
        
        {/* No products found */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products found {searchTerm ? `matching "${searchTerm}"` : category ? "in this category" : ""}
            </p>
          </div>
        )}
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Products;