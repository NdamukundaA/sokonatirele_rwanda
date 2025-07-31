// Navbar.jsx
import { useEffect, useState, useCallback } from "react";
import { Menu, Search, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import AuthButton from "./ui/auth-button";
import CartDrawer from "./CartDrawer";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "@/ApiConfig/ApiConfiguration";

const Navbar = () => {
  const { isAuthenticated, setAuthenticated } = useCartStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearch = useCallback(
    debounce((searchValue) => {
      if (searchValue && searchValue.trim()) {
        navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      }
    }, 300),
    [navigate]
  );

  const onSubmitSearch = (e) => {
    e.preventDefault();
    if (searchTerm && searchTerm.trim()) {
      handleSearch(searchTerm);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      handleSearch(value);
    } else if (value === "") {
      // If search is cleared, navigate back to products without search parameter
      navigate('/products');
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await logoutUser();
      localStorage.removeItem("user");
      setAuthenticated(false);
      setIsMobileMenuOpen(false);
      navigate("/");
      console.log("Logged out successfully:", response);
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthenticated(false);
      setIsMobileMenuOpen(false);
      navigate("/");
    } finally {
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 3000);
    }
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[9999] transition-all duration-300",
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-green-600 pl-0">
              Isokonatirele
            </Link>
            <div className="hidden md:flex items-center space-x-6 ml-6">
              <Link to="/" className="text-gray-700 hover:text-green-600">
                Home
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-green-600">
                All Products
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-green-600">
                Contact us
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-green-600">
                About us
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={onSubmitSearch} className="relative w-64">
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                value={searchTerm}
                onChange={handleInputChange}
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <Search size={18} />
              </button>
            </form>
            <CartDrawer />
            <AuthButton />
          </div>
          <div className="md:hidden flex items-center">
            <CartDrawer />
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        <div 
          className={cn(
            "md:hidden absolute left-0 right-0 top-full transition-all duration-300 ease-in-out transform origin-top",
            isMobileMenuOpen 
              ? "opacity-100 scale-y-100 translate-y-0" 
              : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
          )}
        >
          <div className="bg-white shadow-lg border-t border-gray-200 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4">
              <form onSubmit={onSubmitSearch} className="relative mb-4">
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 w-full"
                  value={searchTerm}
                  onChange={handleInputChange}
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <Search size={18} />
                </button>
              </form>
              
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-green-600 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleLinkClick}
                >
                  Home
                </Link>
                <Link 
                  to="/products" 
                  className="text-gray-700 hover:text-green-600 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleLinkClick}
                >
                  All Products
                </Link>
                <Link 
                  to="/contact" 
                  className="text-gray-700 hover:text-green-600 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleLinkClick}
                >
                  Contact
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-700 hover:text-green-600 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleLinkClick}
                >
                  About
                </Link>
                
                <div className="pt-2 border-t border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <Link 
                        to="/profile" 
                        className="block py-2 px-2 text-gray-700 hover:text-green-600 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={handleLinkClick}
                      >
                        Profile
                      </Link>
                      <Link 
                        to="/track-orders" 
                        className="block py-2 px-2 text-gray-700 hover:text-green-600 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={handleLinkClick}
                      >
                        Track Orders
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full mt-3 justify-start"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                            Logging out...
                          </>
                        ) : (
                          <>
                            <LogOut size={16} className="mr-2" />
                            Logout
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2 pt-2">
                      <Button variant="outline" asChild onClick={handleLinkClick}>
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700" asChild onClick={handleLinkClick}>
                        <Link to="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-20 z-[-1]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;