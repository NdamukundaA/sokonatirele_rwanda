import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import image1 from '@/data/HomeNavbar/image1.jpg';
import image3 from '@/data/HomeNavbar/image3.jpg';
import image2 from '@/data/HomeNavbar/image2.jpg';

interface BannerSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

const slides: BannerSlide[] = [
  {
    id: 1,
    image: image1,
    title: 'Fresh Vegetables & Fruits',
    subtitle: 'Get farm-fresh produce delivered to your doorstep'
  },
  {
    id: 2,
    image: image2,
    title: 'Quality Grocery Products',
    subtitle: 'Shop our premium selection of grocery items'
  },
  {
    id: 3,
    image: image3,
    title: 'Fast & Reliable Delivery',
    subtitle: 'Get your orders within hours of placing them'
  }
];

const BannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate(); // Initialize the navigate function

  const handleNavigate = () => {
    navigate('/products');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[60vh] overflow-hidden mt-20">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center z-20">
            <div className="container mx-auto px-4">
              <div className="max-w-lg text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">{slide.title}</h2>
                <p className="text-xl mb-8">{slide.subtitle}</p>
                <button 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium" 
                  onClick={handleNavigate}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 mx-1 rounded-full ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default BannerSlider;
