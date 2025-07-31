import axios from 'axios';
import { toast } from 'sonner';
import { AddressData, AddressResponse } from '@/types/address';

// Fallback base URL if VITE_API_BASE_URL is not defined
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const apiClient = axios.create({
  baseURL: VITE_API_BASE_URL + '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Validate baseURL to prevent undefined issues
if (!VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not defined. Using fallback: http://localhost:3000');
}

const handleTokenExpiration = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  import('@/store/cartStore').then(({ useCartStore }) => {
    useCartStore.getState().setAuthenticated(false);
  });
  
  toast.error('Session expired. Please log in again.');
  window.location.href = '/login';
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 and 403 (token invalid/expired)
    if (
      error.response?.status === 401 ||
      (error.response?.status === 403 &&
        (error.response?.data?.message?.toLowerCase().includes('token') ||
         error.response?.data?.error?.toLowerCase().includes('token')))
    ) {
      handleTokenExpiration();
      return Promise.reject({
        success: false,
        message: 'Session expired. Please login again.',
        error: 'unauthorized'
      });
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const registerUser = async (userData: { fullName: string; email?: string; phoneNumber?: string; password: string }) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    console.error('Error registering user:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      // Always return errors as { field, message }
      const validationErrors = error.response.data.errors.map((err: any) => ({
        message: err.msg,
        field: err.param,
      }));
      throw { errors: validationErrors };
    }
    throw {
      message: error.response?.data?.message || 'Registration failed. Please check the server configuration or try again.',
      error: error.response?.data?.error || 'unknown_error',
    };
  }
};

export const loginUser = async (loginData: { identifier: string; password: string }) => {
  try {
    const response = await apiClient.post('/auth/login', loginData);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      return response.data;
    }
    throw new Error('No token received from server');
  } catch (error: any) {
    console.error('Error logging in user:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw {
        success: false,
        message: 'Invalid credentials',
        errors: [{ message: 'Invalid credentials' }]
      };
    }
    if (error.response?.data?.errors) {
      throw {
        success: false,
        message: error.response.data.message || 'Login failed',
        errors: error.response.data.errors.map((err: any) => ({
          message: err.msg || err.message || 'Invalid credentials',
          field: err.param || err.field
        }))
      };
    }
    throw {
      success: false,
      message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      error: error.response?.data?.error || 'auth_error'
    };
  }
};

export const checkUserIsAuthenticated = async () => {
  try {
    const response = await apiClient.get('/user/is-auth');
    return response.data;
  } catch (error) {
    console.error('Error checking user authentication:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/user/account');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const updatePassword = async (passwordData) => {
  try {
    const response = await apiClient.put('/user/updatePassword', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/user/updateProfile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.get('/user/logout');
    localStorage.removeItem('token');
    return response.data;
  } catch (error) {
    console.error('Error logging out user:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Category API
export const getAllCategories = async () => {
  try {
    const response = await apiClient.get('/category/getAllCategories');
    return response.data;
  } catch (error) {
    console.error('Error fetching category data:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const getCategoryByProduct = async (categoryId, page = 1, limit = 8) => {
  try {
    const response = await apiClient.get(`/category/${categoryId}/products`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching category by product:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Product API
export const getAllProducts = async (page = 1, limit = 15, search = '', category = null) => {
  try {
    const response = await apiClient.get('/product/getAllProducts', {
      params: { page, limit, search, category },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all products:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const getProductDetails = async (productId) => {
  try {
    const response = await apiClient.get(`/product/getProductDetails/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const rateProduct = async (productId) => {
  try {
    const response = await apiClient.put(`/product/rateProduct/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error rating product:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Cart API
export const addToCart = async (productId: string | number): Promise<ApiResponse> => {
  try {
    console.log('API: Adding product to cart:', productId);
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      cart: {
        _id: string;
        userId: string;
        products: Array<{
          productId: string;
          quantity: number;
          _id: string;
        }>;
        totalPrice: number;
        shippingPrice: string;
        createdAt: string;
        updatedAt: string;
      };
    }>('/cart/add', {
      productId: String(productId),
      quantity: 1,
    });
    console.log('API: Add to cart response:', response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add product to cart');
    }
    return {
      success: true,
      message: response.data.message || 'Product added to cart successfully',
      data: response.data.cart,
    };
  } catch (error: any) {
    console.error('Error adding to cart:', error.response?.data || error);
    if (error.response?.status === 404) {
      throw {
        success: false,
        message: 'Product not found',
        error: 'product_not_found',
      };
    }
    if (error.response?.status === 401) {
      throw {
        success: false,
        message: 'Please login to add items to cart',
        error: 'unauthorized',
      };
    }
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add product to cart',
      error: error.response?.data?.error || 'unknown_error',
    };
  }
};

export const removeFromCart = async (productId: string | number) => {
  try {
    const response = await apiClient.delete(`/cart/remove/${String(productId)}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: true, message: 'Product already removed from cart' };
    }
    console.error('Error removing from cart:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const updateCartItemQuantity = async (productId, quantity) => {
  try {
    const response = await apiClient.put(`/cart/update/${String(productId)}`, {
      quantity: Number(quantity),
    });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item quantity:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const getCartItems = async () => {
  try {
    const response = await apiClient.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await apiClient.delete('/cart/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Address API functions
export const addAddress = async (addressData: Omit<AddressData, '_id' | 'userId'>): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<AddressResponse>('/address/create', addressData);
    return {
      success: true,
      message: response.data.message,
      data: response.data.address
    };
  } catch (error: any) {
    console.error('Error adding address:', error.response?.data || error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to add address',
      error: error.response?.data?.error || 'unknown_error'
    };
  }
};

export const getAllAddresses = async (): Promise<ApiResponse> => {
  try {
    const response = await apiClient.get('/address/allAddress');
    return {
      success: true,
      message: 'Addresses fetched successfully',
      data: response.data.addresses
    };
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch addresses',
      error: error.response?.data?.error || 'unknown_error'
    };
  }
};

export const updateAddress = async (addressId: string, addressData: Partial<AddressData>): Promise<ApiResponse> => {
  try {
    const response = await apiClient.put<AddressResponse>(`/address/update/${addressId}`, addressData);
    return {
      success: true,
      message: response.data.message,
      data: response.data.address
    };
  } catch (error: any) {
    console.error('Error updating address:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to update address',
      error: error.response?.data?.error || 'unknown_error'
    };
  }
};

export const deleteAddress = async (addressId: string): Promise<ApiResponse> => {
  try {
    if (!addressId) {
      throw new Error('Address ID is required');
    }

    const response = await apiClient.delete(`/address/delete/${addressId}`);
    
    return {
      success: true,
      message: response.data?.message || 'Address deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting address:', error);
    
    if (error.response?.status === 401) {
      throw {
        success: false,
        message: 'Please login to delete address',
        error: 'unauthorized'
      };
    }
    
    if (error.response?.status === 404) {
      throw {
        success: false,
        message: 'Address not found',
        error: 'not_found'
      };
    }

    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete address',
      error: error.response?.data?.error || 'unknown_error'
    };
  }
};

// Order API
export const placeOrder = async (orderData: {
  addressId: string;
  paymentType: 'online' | 'cash';
}): Promise<ApiResponse> => {
  try {
    console.log('API: Placing order with data:', orderData);
    const callbackUrl = `${window.location.origin}/order-confirmation`;
    console.log('API: Callback URL:', callbackUrl);
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      order: any;
      invoiceNumber?: string;
      paymentUrl?: string;
    }>('/order/placeOrder', {
      ...orderData,
      callbackUrl,
    });
    console.log('API: Order placement response:', response.data);
    if (!response.data) {
      throw new Error('No response data received');
    }
    if (response.data.order?._id) {
      localStorage.setItem('lastOrderId', response.data.order._id);
      console.log('API: Stored order ID in localStorage:', response.data.order._id);
    }
    return {
      success: true,
      message: response.data.message,
      data: {
        order: response.data.order,
        invoiceNumber: response.data.invoiceNumber,
        paymentUrl: response.data.paymentUrl,
      },
    };
  } catch (error: any) {
    console.error('Error placing order:', error);
    console.error('Full error response:', error.response?.data); // Log the full error response
    if (error.response?.data) {
      throw {
        success: false,
        message: error.response.data.message || 'Failed to place order',
        error: error.response.data.error || 'unknown_error',
        details: error.response.data, // Include full error details
      };
    }
    throw {
      success: false,
      message: error.message || 'Failed to place order',
      error: 'unknown_error',
    };
  }
};

export const getAllUserOrders = async (page = 1, limit = 10): Promise<ApiResponse> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      orders: any[];
      pagination: {
        totalOrders: number;
        totalPages: number;
        currentPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>('/order/getUserOrders', {
      params: { page, limit },
    });
    return {
      success: true,
      message: 'Orders fetched successfully',
      data: {
        orders: response.data.orders,
        pagination: response.data.pagination,
      },
    };
  } catch (error: any) {
    console.error('Error fetching all user orders:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const getOrderDetails = async (orderId: string): Promise<ApiResponse> => {
  try {
    console.log('API: Fetching order details for ID:', orderId);
    const response = await apiClient.get<{
      success: boolean;
      order: any;
    }>(`/order/getOrderDetails/${orderId}`);
    console.log('API: Order details response:', response.data);
    return {
      success: true,
      message: 'Order details fetched successfully',
      data: response.data.order,
    };
  } catch (error: any) {
    console.error('Error fetching OrderDetails:', error);
    throw error.response?.data || error.message;
  }
};

export default apiClient;