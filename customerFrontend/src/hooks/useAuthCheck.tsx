
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { checkUserIsAuthenticated } from '@/ApiConfig/ApiConfiguration';
import { toast } from 'sonner';

export const useAuthCheck = (redirectTo: string = '/login') => {
  const navigate = useNavigate();
  const { isAuthenticated, setAuthenticated } = useCartStore();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAuthenticated(false);
          toast.error('Please log in to access this page');
          navigate(redirectTo);
          return;
        }

        const response = await checkUserIsAuthenticated();
        if (response.success) {
          setAuthenticated(true);
        } else {
          // Token is invalid, clear everything and redirect
          setAuthenticated(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please log in again');
          navigate(redirectTo);
        }
      } catch (error: any) {
        console.error('Auth check failed:', error);
        
        // Check if error is token-related
        if (error.error === 'token_expired' || 
            error.message?.includes('expired') || 
            error.message?.includes('invalid')) {
          // Token expired, already handled by interceptor
          return;
        }
        
        setAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Authentication failed. Please log in');
        navigate(redirectTo);
      }
    };

    if (!isAuthenticated) {
      verifyAuth();
    }
  }, [isAuthenticated, setAuthenticated, navigate, redirectTo]);

  return isAuthenticated;
};
