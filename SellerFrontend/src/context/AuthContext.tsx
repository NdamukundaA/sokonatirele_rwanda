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
        const response = await fetch(`${import.meta.env.VITE_API_CONNECTION || 'http://localhost:3000'}/api/admin/is-auth`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('Auth check response:', data);
        
        if (response.ok && data.success && data.admin) {
          const admin = data.admin;
          setCurrentUser({
            id: admin._id || admin.id,
            name: admin.fullName || 'Unknown',
            email: admin.email || '',
            phoneNumber: admin.phoneNumber,
            role: 'admin',
            createdAt: admin.createdAt || new Date().toISOString(),
          });
          setIsAuthenticated(true);
        } else {
          throw new Error(data.message || 'Authentication failed');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Only clear auth data if it's an authentication error
        if (error.message === 'Authentication failed' || error.message.includes('401')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('admin');
          setIsAuthenticated(false);
          setCurrentUser(null);
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
