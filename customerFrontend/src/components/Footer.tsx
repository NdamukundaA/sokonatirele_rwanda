
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Isokonatirele</h3>
            <p className="text-gray-300 mb-4">
              Your one-stop shop for fresh, high-quality groceries delivered straight to your door.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white">Home</a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-white">All Products</a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white">Contact</a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white">About</a>
              </li>
            </ul>
          </div>
          
          {/* <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <a href="/products?category=1" className="text-gray-300 hover:text-white">Fresh Fruits</a>
              </li>
              <li>
                <a href="/products?category=2" className="text-gray-300 hover:text-white">Drinks</a>
              </li>
              <li>
                <a href="/products?category=3" className="text-gray-300 hover:text-white">Bakery</a>
              </li>
              <li>
                <a href="/products?category=4" className="text-gray-300 hover:text-white">Meat & Seafood</a>
              </li>
              <li>
                <a href="/products?category=5" className="text-gray-300 hover:text-white">Beverages</a>
              </li>
            </ul>
          </div> */}
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                <span>Nyarugenge Kigali Rwanda</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 flex-shrink-0" />
                <span>+2507938856689</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 flex-shrink-0" />
                <span>isokonatirele@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Isokonatirele. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Shipping Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
