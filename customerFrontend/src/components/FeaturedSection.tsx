// FeaturedSection.jsx
import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { getAllProducts } from "@/ApiConfig/ApiConfiguration"; 
import LazySection from "./LazySection";

const FeaturedSection = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the first 10 products, sorted by createdAt (newest first)
        const response = await getAllProducts(1, 10); // Page 1, limit 10, no filters
        setFeaturedProducts(response.productList || []);
      } catch (err) {
        setError(err.message || "Failed to fetch featured products");
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <LazySection 
      rootMargin="100px"
      placeholder={
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Featured Products
              </h2>
              <a
                href="/products"
                className="text-green-600 hover:text-green-700 font-medium flex items-center"
              >
                View All
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </section>
      }
    >
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Featured Products
            </h2>
            <a
              href="/products"
              className="text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              View All
            </a>
          </div>
          {loading && <div className="text-center py-12">Loading...</div>}
          {error && <div className="text-center py-12 text-red-500">{error}</div>}
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products available</p>
              </div>
            )
          )}
        </div>
      </section>
    </LazySection>
  );
};

export default FeaturedSection;
