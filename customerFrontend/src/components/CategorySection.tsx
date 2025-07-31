import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllCategories } from "@/ApiConfig/ApiConfiguration";

const CategorySection = () => {
  const scrollRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await getAllCategories();
        setCategories(response.categories || []);
      } catch (err) {
        setError(err.message || "Failed to fetch categories");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Scroll function
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400; // Increased scroll amount for wider cards
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" id="categories">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center tracking-tight">
          Explore Our Categories
        </h2>

        <div className="relative">
          {/* Left Arrow */}
          <button
            className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={() => scroll("left")}
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="w-6 h-6 text-green-600 dark:text-green-400" />
          </button>

          {/* Category Cards */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto space-x-4 scrollbar-hide scroll-smooth px-6 md:px-10 py-4"
          >
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/category/${category.name}`}
                  className="min-w-[200px] max-w-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center flex-shrink-0 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  aria-label={`View ${category.name} category`}
                >
                  <div className="w-full h-40 mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                    <img
                      src={category.image || "/placeholder-image.png"}
                      alt={category.name}
                      className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg truncate">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {category.description || "Explore our range of products"}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center w-full">No categories available</p>
            )}
          </div>

          {/* Right Arrow */}
          <button
            className="absolute right-0 md:-right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={() => scroll("right")}
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-6 h-6 text-green-600 dark:text-green-400" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;