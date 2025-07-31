import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyRoute: React.FC<LazyRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
        <p className="mt-4 text-gray-600">Loading page...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

export default LazyRoute; 