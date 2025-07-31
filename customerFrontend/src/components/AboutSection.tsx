import cheff from "@/data/HomeNavbar/sheff2.webp";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AboutSection = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/about');
  };

  return (
    <section className="py-20 bg-gray-50" id="about">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center">
          <div className="w-full lg:w-1/2 mb-10 lg:mb-0 px-4">
            <div className="relative lg:-ml-8">
              {/* Main chef image with enhanced styling, moved to the left */}
              <img
                src={cheff}
                alt="About Isokonatirele"
                className="rounded-lg shadow-xl w-full object-cover h-96 md:h-[550px] z-10 relative"
              />
              
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-green-600 hidden md:block" />
              <div className="absolute -top-4 -left-4 h-32 w-32 rounded-full border-4 border-green-200 hidden md:block" />
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 lg:pl-16">
            <span className="inline-block py-1 px-3 mb-4 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
              About Isokonatirele
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              We Deliver Fresh Groceries At Your Doorstep
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Isokonatirele started with a simple mission: to make fresh, high-quality groceries accessible
              to everyone. We believe that healthy eating starts with fresh ingredients, which is why
              we work directly with local farmers and producers to bring you the best products.
            </p>
            <p className="text-gray-600 mb-8 text-lg">
              Our team is dedicated to providing an exceptional shopping experience from the moment
              you visit our store to the delivery of your groceries to your doorstep.
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg" onClick={handleNavigate}>
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;