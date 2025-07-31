// PopularProducts.jsx
import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/ApiConfig/ApiConfiguration";
import LazySection from "./LazySection";

const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllProducts(1, 10); // Fetch 10 newest products
        setProducts(response.productList || []);
      } catch (err) {
        setError(err.message || "Failed to fetch popular products");
      } finally {
        setLoading(false);
      }
    };
    fetchPopularProducts();
  }, []);

  //handle navigation to all products
  const handleNavigateToAllProducts = () => {
    window.location.href = "/products";
  }

  return (
    <LazySection 
      rootMargin="100px"
      placeholder={
        <section className="py-12" id="popular">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Popular Products
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
            <div className="text-center mt-10">
              <Button className="bg-white text-green-600 border border-green-600 hover:bg-green-50 px-8">
                Load More
              </Button>
            </div>
          </div>
        </section>
      }
    >
      <section className="py-12" id="popular">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Popular Products
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
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            !loading && <div className="text-center py-12">No products available</div>
          )}
          <div className="text-center mt-10">
            <Button className="bg-white text-green-600 border border-green-600 hover:bg-green-50 px-8" onClick={handleNavigateToAllProducts}>
              Load More
            </Button>
          </div>
        </div>
      </section>
    </LazySection>
  );
};

export default PopularProducts;