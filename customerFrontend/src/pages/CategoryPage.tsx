// CategoryPage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getCategoryByProduct, getAllCategories } from "@/ApiConfig/ApiConfiguration";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  
  // State for infinite scroll
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categoryId, setCategoryId] = useState(null);
  
  // Ref for intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const productsPerPage = 8;

  // Intersection observer callback
  const lastProductElementRef = useCallback((node: HTMLElement | null) => {
    if (isLoading || loadingMore) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreProducts();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, loadingMore, hasMore]);

  // Load more products function
  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore || !categoryId) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const productResponse = await getCategoryByProduct(categoryId, nextPage, productsPerPage);
      
      if (productResponse.success) {
        const newProducts = productResponse.products || [];
        if (newProducts.length > 0) {
          setCategoryProducts(prev => [...prev, ...newProducts]);
          setCurrentPage(nextPage);
          setHasMore(productResponse.pagination?.hasNextPage || false);
        } else {
          setHasMore(false);
        }
      } else {
        throw new Error(productResponse.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(err.message || "Failed to load more products");
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial load function
  const loadInitialProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1);
      setHasMore(true);
      setCategoryProducts([]);
      
      const categoryResponse = await getAllCategories();
      const category = categoryResponse.categories.find(
        (cat) =>
          cat.name.toLowerCase() === categoryName.toLowerCase() ||
          cat._id.toString() === categoryName
      );

      if (category) {
        setCategoryTitle(category.name);
        setCategoryId(category._id);
        
        const productResponse = await getCategoryByProduct(category._id, 1, productsPerPage);
        if (productResponse.success) {
          const initialProducts = productResponse.products || [];
          setCategoryProducts(initialProducts);
          setHasMore(productResponse.pagination?.hasNextPage || false);
        } else {
          throw new Error(productResponse.message || "Failed to fetch products");
        }
      } else {
        navigate("/products");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch category data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset and reload when category changes
  useEffect(() => {
    loadInitialProducts();
  }, [categoryName, navigate]);

  // Filter products when search term changes
  useEffect(() => {
    if (searchTerm && categoryProducts.length > 0) {
      const filtered = categoryProducts.filter((product) =>
        product.productname.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(categoryProducts);
    }
  }, [searchTerm, categoryProducts]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-16">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Link
                to="/"
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 w-fit transition-colors duration-300"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                {categoryTitle}
              </h1>
              <Link
                to="/products"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500 font-medium flex items-center"
              >
                View All Products
              </Link>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Explore our selection of fresh and high-quality {categoryTitle.toLowerCase()}.
            </p>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredProducts.map((product, index) => {
                  // Add ref to last product for intersection observer
                  if (filteredProducts.length === index + 1) {
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
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {searchTerm
                    ? `No products found matching "${searchTerm}" in ${categoryTitle}`
                    : `No products available in ${categoryTitle} category`}
                </p>
              </div>
            )}
            {loadingMore && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading more products...</span>
              </div>
            )}
            {!hasMore && filteredProducts.length > 0 && !isLoading && !loadingMore && (
              <div className="text-center py-8">
                <p className="text-gray-500">No more products to load</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default CategoryPage;