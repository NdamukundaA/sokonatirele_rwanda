// ApiConfiguration.tsx
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
});

// Function to get current token
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    // Basic token validation
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('Invalid token format');
      localStorage.removeItem('authToken');
      return null;
    }
    
    // Ensure proper Bearer format
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  } catch (error) {
    console.error('Token validation error:', error);
    localStorage.removeItem('authToken');
    return null;
  }
};

// Function to handle token refresh
const refreshAuthToken = async () => {
  try {
    const response = await axios.post(`${API}/admin/refresh-token`, {}, {
      withCredentials: true
    });
    const newToken = response.data.token;
    if (newToken) {
      localStorage.setItem('authToken', `Bearer ${newToken}`);
      return `Bearer ${newToken}`;
    }
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

apiClient.interceptors.request.use(
  async (config) => {
    const isAuthRoute = config.url?.includes('/admin/login') || config.url?.includes('/admin/refresh-token');
    
    if (!isAuthRoute) {
      let token = getAuthToken();
      
      // If no token exists or token is invalid format
      if (!token || !token.startsWith('Bearer ')) {
        // Try to refresh token
        token = await refreshAuthToken();
        if (!token) {
          // Redirect to login if no token available
          window.location.href = '/login';
          throw new Error('Authentication required');
        }
      }
      
      // Ensure proper token format and set in headers
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    
    if (import.meta.env.DEV) {
      console.debug('Request:', {
        url: config.url,
        method: config.method,
        hasToken: !!config.headers.Authorization,
        token: typeof config.headers.Authorization === 'string' 
          ? `${config.headers.Authorization.slice(0, 20)}...` 
          : null
      });
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle different error scenarios
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const newToken = await refreshAuthToken();
        if (newToken) {
          // Retry the original request with new token
          originalRequest.headers.Authorization = newToken;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // If we reach here, refresh failed
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    
    if (error.response?.status === 403) {
      // Handle forbidden errors
      console.error('Access forbidden:', error.response.data);
      return Promise.reject(new Error('You do not have permission to perform this action'));
    }
    
    // Network errors
    if (!error.response) {
      console.error('Network error:', error);
      // Check if it's a CORS error
      if (error.message?.includes('CORS')) {
        return Promise.reject(new Error('CORS error: Unable to access the API. Please ensure the API server is running and configured correctly.'));
      }
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // All other errors
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error 
      || 'An unexpected error occurred';
    
    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      url: originalRequest?.url
    });
    
    return Promise.reject(new Error(errorMessage));
  }
);

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  status: 'Active' | 'Inactive';
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  companyAddress: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface GetSellersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const loginAdmin = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/admin/login', { email, password });

    if (!response.data.token) {
      throw new Error('No token received from server');
    }

    // Ensure token is properly formatted
    const token = response.data.token.startsWith('Bearer ') 
      ? response.data.token 
      : `Bearer ${response.data.token}`;
    
    localStorage.setItem('authToken', token);
    apiClient.defaults.headers.common['Authorization'] = token;
    console.log('Admin token stored and headers updated:', { tokenSet: !!token });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Invalid email or password. Please check your credentials and try again.';
    console.error('Login failed:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const logoutAdmin = async () => {
  try {
    localStorage.removeItem("authToken");
    console.log("Admin logged out, token removed");
    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error);
    localStorage.removeItem("authToken");
    return Promise.reject(error);
  }
};

export const getAllSellers = async (params: GetSellersParams = {}) => {
  try {
    const response = await apiClient.get('/seller/getAllSeller', { params });
    console.log('Raw API response:', response);
    // Check if the data is in response.data.data or response.data
    const data = response.data.data || response.data;
    return data;
  } catch (error: any) {
    console.error('Get sellers error:', error);
    console.error('Error details:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to fetch sellers');
  }
};

export const getSellerById = async (id: string) => {
  try {
    const response = await apiClient.get(`/seller/getSeller/${id}`);
    console.log('Seller details response:', response);
    // Handle both possible response formats
    const sellerData = response.data.data || response.data;
    return sellerData;
  } catch (error: any) {
    console.error('Get seller details error:', error);
    console.error('Error response:', error.response);
    throw new Error(error.response?.data?.message || 'Failed to fetch seller details');
  }
};

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getAllCustomers = async (params: GetCustomersParams = {}) => {
  try {
    const response = await apiClient.get('/customer/getAllCustomers', { params });
    console.log('Get customers response:', response);
    return {
      customers: response.data.customers,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
      totalCustomers: response.data.totalCustomers
    };
  } catch (error: any) {
    console.error('Get customers error:', error);
    console.error('Error details:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to fetch customers');
  }
};

export const getCustomerById = async (id: string) => {
  try {
    const response = await apiClient.get(`/customer/getCustomerById/${id}`);
    console.log('Customer details response:', response);
    return response.data;
  } catch (error: any) {
    console.error('Get customer details error:', error);
    console.error('Error response:', error.response);
    throw new Error(error.response?.data?.message || 'Failed to fetch customer details');
  }
};

export const getCustomerOrders = async (id: string) => {
  try {
    const response = await apiClient.get(`/customer/getCustomerOrders/${id}`);
    console.log('Customer orders response:', response);
    return response.data;
  } catch (error: any) {
    console.error('Get customer orders error:', error);
    console.error('Error response:', error.response);
    throw new Error(error.response?.data?.message || 'Failed to fetch customer orders');
  }
};

export interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  image?: File[];
  status?: 'active' | 'inactive';
}

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await apiClient.get('/category/getAllCategories');
    return response.data.categories;
  } catch (error: any) {
    console.error('Get categories error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

// Add new category
export const addCategory = async (categoryData: CategoryFormData) => {
  try {
    const formData = new FormData();
    
    if (categoryData.image && categoryData.image.length > 0) {
      categoryData.image.forEach(file => {
        formData.append('image', file);
      });
    }

    // Add other category data
    formData.append('categoryData', JSON.stringify({
      name: categoryData.name,
      description: categoryData.description,
      status: categoryData.status
    }));

    const response = await apiClient.post('/category/addCategory', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Add category error:', error);
    throw new Error(error.response?.data?.message || 'Failed to add category');
  }
};

// Update category
export const updateCategory = async (id: string, categoryData: CategoryFormData) => {
  try {
    const formData = new FormData();
    
    if (categoryData.image && categoryData.image.length > 0) {
      categoryData.image.forEach(file => {
        formData.append('image', file);
      });
    }

    // Add other category data
    formData.append('categoryData', JSON.stringify({
      name: categoryData.name,
      description: categoryData.description,
      status: categoryData.status
    }));

    const response = await apiClient.put(`/category/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Update category error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update category');
  }
};

// Delete category
export const deleteCategory = async (id: string) => {
  try {
    const response = await apiClient.delete(`/category/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Delete category error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
};

// Get products by category
export const getProductsByCategory = async (categoryId: string, params?: { page?: number; limit?: number }) => {
  try {
    const response = await apiClient.get(`/category/${categoryId}/products`, { params });
    return response.data;
  } catch (error: any) {
    console.error('Get products by category error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

export interface Rating {
  user: string;
  rating: number;
  createdAt: string;
}

export interface Product {
  _id: string;
  productname: string;
  description: string;
  productUnit: string;
  price: number;
  offerPrice?: number;
  productImage: string;
  productCategory: string | Category;
  ratings: Rating[];
  inStock: boolean;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  productname: string;
  description: string;
  productUnit: string;
  price: number;
  offerPrice?: number;
  image?: File[];
  productCategory: string;
  inStock?: boolean;
}

export interface ProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

// Get all products
export const getAllProducts = async (params: ProductsParams = {}) => {
  try {
    const response = await apiClient.get('/product/getAllProducts', { params });
    return {
      products: response.data.productList,
      pagination: response.data.pagination
    };
  } catch (error: any) {
    console.error('Get products error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

// Get product details
export const getProductDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`/product/getProductDetails/${id}`);
    return response.data.product;
  } catch (error: any) {
    console.error('Get product details error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch product details');
  }
};

// Add new product
export const addProduct = async (productData: ProductFormData) => {
  try {
    const formData = new FormData();
    
    if (productData.image && productData.image.length > 0) {
      productData.image.forEach(file => {
        formData.append('image', file);
      });
    }

    // Add other product data
    formData.append('productData', JSON.stringify({
      productname: productData.productname,
      description: productData.description,
      productUnit: productData.productUnit,
      price: productData.price,
      offerPrice: productData.offerPrice,
      productCategory: productData.productCategory,
      inStock: productData.inStock
    }));

    const response = await apiClient.post('/product/addProduct', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Add product error:', error);
    throw new Error(error.response?.data?.message || 'Failed to add product');
  }
};

// Update product
export const updateProduct = async (id: string, productData: ProductFormData) => {
  try {
    const formData = new FormData();
    
    if (productData.image && productData.image.length > 0) {
      productData.image.forEach(file => {
        formData.append('image', file);
      });
    }

    // Add other product data
    formData.append('productData', JSON.stringify({
      productname: productData.productname,
      description: productData.description,
      productUnit: productData.productUnit,
      price: productData.price,
      offerPrice: productData.offerPrice,
      productCategory: productData.productCategory,
      inStock: productData.inStock
    }));

    const response = await apiClient.put(`/product/updateProduct/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Update product error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
};

// Delete product
export const deleteProduct = async (id: string) => {
  try {
    const response = await apiClient.delete(`/product/deleteProduct/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Delete product error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
};

// Change product stock status
export const changeProductStock = async (id: string) => {
  try {
    const response = await apiClient.post(`/product/stock/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Change stock error:', error);
    throw new Error(error.response?.data?.message || 'Failed to change product stock status');
  }
};

// Rate product
export const rateProduct = async (id: string) => {
  try {
    const response = await apiClient.put(`/product/rateProduct/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Rate product error:', error);
    throw new Error(error.response?.data?.message || 'Failed to rate product');
  }
};

// Get all orders
export const getAllOrders = async (params?: { page?: number; limit?: number; search?: string }) => {
  try {
    const response = await apiClient.get('/order/getAllOrders', { params });
    console.log('Orders API Response:', response.data); // Debug log
    return {
      orders: response.data.orders || response.data,
      pagination: response.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: response.data.length || 0,
        itemsPerPage: 20
      }
    };
  } catch (error: any) {
    console.error('Get orders error:', error);
    console.error('Error response:', error.response?.data); // Debug log
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

// Get order details
export const getOrderDetails = async (id: string) => {
  try {
    // Use the admin endpoint since we're in the admin frontend
    const response = await apiClient.get(`/order/admin/getOrderDetails/${id}`);
    console.log('Order details response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get order details error:', error);
    // Check for specific error conditions
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to access this order. Please ensure you are logged in as an admin.');
    } else if (error.response?.status === 401) {
      // Token might be expired, try to refresh
      localStorage.removeItem('authToken'); // Clear invalid token
      window.location.href = '/login'; // Redirect to login
      throw new Error('Your session has expired. Please login again.');
    }
    throw error; // Let the interceptor handle other errors
  }
};

// Update order status
export const updateOrderStatus = async (id: string, status: string) => {
  try {
    const response = await apiClient.put(`/order/updateStatus/${id}`, { status });
    console.log('Update status response:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    console.error('Update order status error:', error);
    console.error('Error response:', error.response?.data); // Debug log
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
};

export const ApiConfig = {
  apiClient,
};