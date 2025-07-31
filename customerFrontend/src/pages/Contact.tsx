
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Set content visibility after a small delay for entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      setIsSubmitting(false);
    }, 1000);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Increased top padding to move content further down */}
      <div className="pt-48 pb-16">
        <motion.div 
          className="container mx-auto px-4"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Back to Home button */}
          <motion.div 
            className="mb-6"
            variants={itemVariants}
          >
            <Link to="/" className="flex items-center text-gray-600 hover:text-green-600 w-fit">
              <ArrowLeft size={20} className="mr-2" />
              <span>Back to Home</span>
            </Link>
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-bold mb-2 text-center"
            variants={itemVariants}
          >
            Contact Us
          </motion.h1>
          <motion.p 
            className="text-gray-600 mb-16 text-center max-w-2xl mx-auto"
            variants={itemVariants}
          >
            {/* We'd love to hear from you! Please fill out the form below or reach out to us using the contact information. */}
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="md:col-span-2"
              variants={itemVariants}
            >
              <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">
                        Your Name
                      </label>
                      <Input 
                        id="name"
                        name="name" 
                        type="text" 
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="transition-all duration-300 focus:scale-105"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
                        Email Address
                      </label>
                      <Input 
                        id="email"
                        name="email" 
                        type="email" 
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="transition-all duration-300 focus:scale-105"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 mb-2 font-medium">
                      Subject
                    </label>
                    <Input 
                      id="subject"
                      name="subject" 
                      type="text" 
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="transition-all duration-300 focus:scale-105"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-gray-700 mb-2 font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 focus:scale-105"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button 
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 px-8 py-2 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <motion.div 
                className="bg-white shadow-md rounded-lg p-8 mb-8 hover:shadow-lg transition-shadow duration-300"
                whileHover={{ y: -5 }}
              >
                <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <motion.div 
                    className="flex items-start"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <MapPin className="text-green-600 mr-4 flex-shrink-0 h-6 w-6" />
                    <p>Nyarugenge<br />Kigali<br />Rwanda</p>
                  </motion.div>
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Phone className="text-green-600 mr-4 h-6 w-6" />
                    <p>(+250) 793885689</p>
                  </motion.div>
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Mail className="text-green-600 mr-4 h-6 w-6" />
                    <p>isokonatirele@gmail.com</p>
                  </motion.div>
                  <motion.div 
                    className="flex items-start"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Clock className="text-green-600 mr-4 flex-shrink-0 h-6 w-6" />
                    <div>
                      <p className="font-semibold">Business Hours:</p>
                      <p>Mon-Fri: 9AM - 6PM<br />Sat: 10AM - 4PM<br />Sun: Closed</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-green-50 rounded-lg p-8"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <h2 className="text-xl font-semibold mb-4">Looking to Become a Vendor?</h2>
                <p className="mb-6">
                  If you're a local farmer or producer interested in partnering with us,
                  we'd love to hear from you!
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-green-600 hover:bg-green-700 w-full py-2 text-lg"
                    onClick={() => toast.success("Vendor information has been sent to your email!")}
                  >
                    Get Vendor Information
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <style>
        {`
        .bg-green-50 {
          background-color: #f0fdf4;
        }
        `}
      </style>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Contact;
