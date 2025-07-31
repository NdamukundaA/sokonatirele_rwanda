import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LazySectionProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  placeholder?: React.ReactNode;
  className?: string;
}

const LazySection: React.FC<LazySectionProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  placeholder,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Add a small delay to simulate loading
          setTimeout(() => setIsLoaded(true), 100);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const defaultPlaceholder = (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );

  return (
    <div ref={sectionRef} className={className}>
      {!isVisible ? (
        placeholder || defaultPlaceholder
      ) : (
        <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default LazySection; 