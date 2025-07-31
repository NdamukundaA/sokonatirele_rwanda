
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BannerSlider from "@/components/BannerSlider";
import FeaturedSection from "@/components/FeaturedSection";
import CategorySection from "@/components/CategorySection";
import PopularProducts from "@/components/PopularProducts";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import { ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBasket className="mx-auto h-12 w-12 text-green-600 animate-bounce" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Loading Isokonatirele...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Banner Slider */}
      <BannerSlider />
      
      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-orange-50 p-6 rounded-lg text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBasket className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh Selection</h3>
              <p className="text-gray-600">
                Hand-picked fresh produce sourced directly from local farms.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBasket className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your groceries delivered within hours of placing your order.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBasket className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600">
                Not satisfied? Our hassle-free return policy has got you covered.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <FeaturedSection />
      
      {/* Categories */}
      <CategorySection />
      
      {/* Popular Products */}
      <PopularProducts />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Newsletter */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Stay updated with our latest products, special offers, and healthy recipes.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md text-gray-900 focus:outline-none"
            />
            <Button className="bg-orange-500 hover:bg-orange-600 text-white border-none py-3">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
