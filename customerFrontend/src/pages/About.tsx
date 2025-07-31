
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import image2 from "@/data/HomeNavbar/image2.jpg";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Large spacer to push content down significantly */}
      <div className="h-48 md:h-56"></div>
      
      <div className="container mx-auto px-4 pb-24">
        {/* Back to Home button */}
        <div className="mb-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-green-600 w-fit">
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>
      
        <h1 className="text-3xl font-bold mb-12 animate-fade-in-down text-center">About Isokonatirele</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 mt-16">
          <div className="order-2 md:order-1 animate-fade-in-left">
            <h2 className="text-2xl font-bold text-green-600 mb-6">We Deliver Fresh Groceries At Your Doorstep</h2>
            <p className="mb-4 text-gray-700">
              Isokonatirele started with a simple mission: to make fresh, high-quality groceries accessible to everyone. 
              We believe that healthy eating starts with fresh ingredients, which is why we work directly with local 
              farmers and producers to bring you the best products.
            </p>
            <p className="mb-4 text-gray-700">
              Our team is dedicated to providing an exceptional shopping experience from the moment you visit our 
              store to the delivery of your groceries to your doorstep.
            </p>
            <p className="mb-6 text-gray-700">
              By cutting out the middleman, we're able to offer fresher produce at better prices while ensuring 
              that farmers receive fair compensation for their hard work. Our commitment to sustainability means 
              we prioritize locally-grown, seasonal produce to reduce our carbon footprint.
            </p>
          </div>
          <div className="order-1 md:order-2 animate-fade-in-right">
            <img 
              src={image2}
              alt="Fresh produce" 
              className="w-full h-80 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            />
          </div>
        </div>
        
        <div className="bg-green-50 p-8 rounded-lg mb-24 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-green-600 mb-3">Quality First</h3>
              <p className="text-gray-700">
                We never compromise on the quality of our products. Each item is carefully selected and inspected to 
                ensure it meets our high standards.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-green-600 mb-3">Supporting Local</h3>
              <p className="text-gray-700">
                We partner with local farmers and small businesses to strengthen our community and reduce environmental impact.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-green-600 mb-3">Customer Satisfaction</h3>
              <p className="text-gray-700">
                We're committed to making your shopping experience enjoyable with fast delivery and responsive customer service.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-24 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-6">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Same-Day Delivery</h3>
              <p className="text-sm text-gray-600">Fresh groceries delivered to your door within hours</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Scheduled Delivery</h3>
              <p className="text-sm text-gray-600">Set up recurring deliveries on your schedule</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-semibold">Customized Meal Plans</h3>
              <p className="text-sm text-gray-600">Personalized grocery lists based on your dietary needs</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-semibold">Contactless Payment</h3>
              <p className="text-sm text-gray-600">Safe and secure payment options</p>
            </div>
          </div>
        </div>
        
        {/* <div className="text-center animate-bounce-slow pb-16">
          <Button asChild className="bg-green-600 hover:bg-green-700 px-6 transform transition-transform duration-300 hover:scale-105">
            <a href="/contact">Contact Us</a>
          </Button>
        </div> */}
      </div>
      
      {/* Fixed footer positioning */}
      <div className="mt-auto">
        <Footer />
      </div>

      <style>
        {`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-bounce-slow {
          animation: bounceSlow 2s infinite;
        }
        `}
      </style>
    </div>
  );
};

export default About;
