
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useIsAuthenticated = (redirectToLogin = true) => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're not loading, explicitly not authenticated, and redirect is enabled
    if (!isLoading && !isAuthenticated && redirectToLogin) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, redirectToLogin, navigate]);

  return {
    isAuthenticated,
    isLoading,
    currentUser,
    isAdmin: currentUser?.role === 'admin'
  };
};
