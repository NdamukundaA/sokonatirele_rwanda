// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { loginAdmin, registerAdmin, deleteAdmin } from '@/ApiConfig/ApiConfiguration';

export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  setUsers: (users: User[]) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addUser: (user: { fullName: string; email: string; phoneNumber: string; password: string; role: UserRole }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Use the correct admin authentication endpoint
        const response = await fetch(`${import.meta.env.VITE_API_CONNECTION || 'http://localhost:3000'}/api/seller/is-auth`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Full auth check response:', data);
        
        if (!data) {
          throw new Error('No data received from server');
        }

        // Check for different possible response structures
        const admin = data.admin || data.user || data.seller || data;
        console.log('Extracted admin data:', admin);

        if (!admin || (typeof admin !== 'object')) {
          console.error('Invalid admin data structure:', data);
          throw new Error('Invalid or missing admin data in response');
        }

        // Check for ID in different possible properties
        const userId = admin._id || admin.id || admin.userId || admin.sellerId;
        if (!userId) {
          console.error('Missing ID in admin data:', admin);
          throw new Error('Invalid admin data: missing ID');
        }

        const userData: User = {
          id: userId,
          name: admin.fullName || admin.name || admin.displayName || 'Unknown',
          email: admin.email || '',
          phoneNumber: admin.phoneNumber || admin.phone || '',
          role: 'admin' as UserRole,
          createdAt: admin.createdAt || admin.created_at || new Date().toISOString(),
        };
        
        console.log('Processed user data:', userData);
        setCurrentUser(userData);
        setIsAuthenticated(true);
      } catch (error: any) {
        console.error('Auth check failed:', error);
        
        // Handle different types of errors appropriately
        if (
          error.message.includes('401') || 
          error.message.includes('403') ||
          error.message.includes('authentication failure') ||
          error.message.includes('No admin data') ||
          error.message.includes('Invalid admin data')
        ) {
          // Clear auth data for authentication-related errors
          localStorage.removeItem('authToken');
          localStorage.removeItem('admin');
          setIsAuthenticated(false);
          setCurrentUser(null);
        } else if (error.message.includes('HTTP error! status: 500')) {
          console.error('Server error during authentication');
          // Don't clear auth data for server errors
        } else if (error.message.includes('Failed to fetch')) {
          console.error('Network error during authentication');
          // Don't clear auth data for network errors
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await loginAdmin({ email, password });
      const { token, user } = response.data;

      if (!token || !user || !user._id) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('authToken', token);
      const authUser: User = {
        id: user._id,
        name: user.fullName || 'Unknown',
        email: user.email || '',
        phoneNumber: user.phoneNumber,
        role: user.isAdmin ? 'admin' : 'customer',
        createdAt: user.createdAt || new Date().toISOString(),
      };

      setCurrentUser(authUser);
      setIsAuthenticated(true);
      toast.success('Login successful');
      console.log('Login successful:', authUser);
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Invalid credentials';
      if (error.response?.status === 404) {
        message = 'Login endpoint not found. Please contact support.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsers([]);
    localStorage.removeItem('authToken');
    localStorage.removeItem('admin');
    toast.success('Logged out successfully');
  };

  const addUser = async (user: { fullName: string; email: string; phoneNumber: string; password: string; role: UserRole }) => {
    try {
      const response = await registerAdmin({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        password: user.password,
        role: user.role,
      });

      const newUser: User = {
        id: response.data._id,
        name: response.data.fullName || 'Unknown',
        email: response.data.email || '',
        phoneNumber: response.data.phoneNumber,
        role: response.data.isAdmin ? 'admin' : 'customer',
        createdAt: response.data.createdAt || new Date().toISOString(),
      };

      setUsers([...users, newUser]);
      toast.success('User added successfully');
    } catch (error: any) {
      console.error('Error adding user in AuthContext:', error);
      const message = error.response?.data?.message || 'Failed to add user';
      toast.error(message);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        users,
        setUsers,
        login,
        logout,
        addUser,
        deleteUser,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
