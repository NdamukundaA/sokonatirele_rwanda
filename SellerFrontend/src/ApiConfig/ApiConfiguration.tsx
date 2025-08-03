// src/ApiConfig/ApiConfiguration.tsx
import axios from 'axios';

const VITE_BASE_URL = import.meta.env.VITE_API_CONNECTION;
const apiClient = axios.create({
  baseURL: VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with token:', token); // Debug
    } else {
      console.warn('No authToken found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized for request:', error.config.url);
      // Only clear auth data and redirect if it's not an auth check request
      if (!error.config.url.includes('/api/admin/is-auth')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('admin');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


// Seller Authentication APIs
export const loginAdmin = async (logindata: { email: string; password: string }) => {
  try {
    const response = await apiClient.post('/api/seller/login', logindata);
    console.log('loginAdmin response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    if (error.response?.status === 400) {
      throw new Error('Invalid credentials');
    }
    throw error;
  }
};

export const registerAdmin = async (userData: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  companyName: string;
  companyAddress: string;
}) => {
  try {
    const response = await apiClient.post("/api/seller/register", userData);
    return response;
  } catch (error: any) {
    console.error("Error in registerAdmin: ", error);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw error;
  }
};

export const gettingAllAdmin = async () => {
  try {
    const response = await apiClient.get("/api/seller/getAllAdmins");
    return response;
  } catch (error) {
    console.error("Error in gettingAllAdmin:", error);
    throw error;
  }
};

export const updateAdmin = async (adminId, adminData) => {
  try {
    const response = await apiClient.put(`/api/seller/update/${adminId}`, adminData);
    return response;
  } catch (error) {
    console.error("Error in updateAdmin:", error);
    throw error;
  }
};

export const UserIsAuthenticated = async () => {
  try {
    const response = await apiClient.get('/api/seller/is-auth');
    console.log('UserIsAuthenticated response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in UserIsAuthenticated:', error);
    throw error;
  }
};

export const deleteAdmin = async (adminId) => {
  try {
    const response = await apiClient.delete(`/api/seller/delete/${adminId}`);
    return response;
  } catch (error) {
    console.error("Error in deleteAdmin:", error);
    throw error;
  }
};

// Category APIs
export const createCategory = async (categoryData) => {
  try {
    const formData = new FormData();
    formData.append("name", categoryData.name);
    formData.append("description", categoryData.description);
    if (categoryData.image) {
      formData.append("image", categoryData.image);
    }

    const response = await apiClient.post("/api/category/addCategory", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error) {
    console.error("Error in createCategory:", error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await apiClient.get("/api/category/getAllCategories");
    return response;
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    throw error;
  }
};

export const getCategoryByProduct = async (categoryId: string) => {
  try {
    if (!categoryId) {
      throw new Error('Category ID is required');
    }
    const response = await apiClient.get(`/api/category/${categoryId}/products`);
    console.log('getCategoryByProduct response:', response.data);
    return response;
  } catch (error: any) {
    console.error("Error in getCategoryByProduct:", error);
    if (error.response?.status === 404) {
      throw new Error('Category not found');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid category ID');
    } else if (error.code === 'ECONNRESET') {
      throw new Error('Connection reset. Please try again.');
    }
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const formData = new FormData();
    if (categoryData.name) formData.append("name", categoryData.name);
    if (categoryData.description) formData.append("description", categoryData.description);
    if (categoryData.status) formData.append("status", categoryData.status);
    if (categoryData.image) formData.append("image", categoryData.image);

    console.log('updateCategory sending:', Object.fromEntries(formData));

    const response = await apiClient.put(`/api/category/${categoryId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log('updateCategory response:', response.data);
    return response;
  } catch (error) {
    console.error("Error in updateCategory:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await apiClient.delete(`/api/category/${categoryId}`);
    return response;
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    throw error;
  }
};

// Product APIs
export const addProduct = async (formData) => {
  try {
    const response = await apiClient.post("/api/product/addProduct", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log('addProduct response:', response.data);
    return response;
  } catch (error) {
    console.error("Error in addProduct:", error);
    throw error;
  }
};

export const getAllProducts = async ({
  page = 1,
  limit = 15,
  search = '',
  category = null,
} = {}) => {
  try {
    const response = await apiClient.get('/api/product/getAllProducts', {
      params: { page, limit, search, category },
    });
    console.log('getAllProducts response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw error;
  }
};

export const getProductDetails = async (productId) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    const response = await apiClient.get(`/api/product/getProductDetails/${productId}`);
    console.log('getProductDetails response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getProductDetails:', error);
    throw error;
  }
};

export const changeStockStatus = async (productId, inStock) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    const response = await apiClient.post(`/api/product/stock/${productId}`, { inStock });
    console.log('changeStockStatus response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in changeStockStatus:', error);
    throw error;
  }
};

export const updateProduct = async (productId, formData) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    const response = await apiClient.put(`/api/product/updateProduct/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('updateProduct response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    const response = await apiClient.delete(`/api/product/deleteProduct/${productId}`);
    console.log('deleteProduct response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};

export const getAllOrders = async ({
  page = 1,
  limit = 15,
  search = '',
  startDate = null,
  endDate = null
} = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (search) params.append('search', search);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/api/order/getAllOrders?${params.toString()}`);
    console.log('getAllOrders response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    throw error;
  }
};

export interface OrderProduct {
  productId: string;
  productQuantity: number;
  unit: string;
  price: number;
  productImage?: string;
  productName?: string;
  subtotal?: string;
  productDetails?: {
    productname: string;
    description: string;
    productUnit: string;
    productImage: string;
    offerPrice: number;
    inStock: boolean;
  };
}

export interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  products: OrderProduct[];
  address: any;
  amount: number;
  paymentType: string;
  status: string;
  paymentStatus: string;
  user_fullName?: string;
  user_email?: string;
  createdAt: string;
  updatedAt: string;
}

export const getOrderDetails = async (orderId: string) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    const response = await apiClient.get(`/api/order/admin/getOrderDetails/${orderId}`);
    console.log('getOrderDetails response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getOrderDetails:', error);
    if (error.response?.status === 401) {
      // Don't handle 401 here, let the interceptor handle it
      throw error;
    }
    throw error;
  }
};

export const updateOrderStatus = async (orderId, { status, paymentStatus }) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    const response = await apiClient.put(`/api/order/updateOrderStatus/${orderId}`, {
      status,
      paymentStatus
    });
    console.log('updateOrderStatus response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    throw error;
  }
};

export const getOrderStatistics = async () => {
  try {
    const response = await apiClient.get('/api/order/getOrderStatistics');
    console.log('getOrderStatistics response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getOrderStatistics:', error);
    throw error;
  }
};

export const confirmCashPayment = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    const response = await apiClient.put(`/api/order/confirmCashPayment/${orderId}`);
    console.log('confirmCashPayment response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in confirmCashPayment:', error);
    throw error;
  }
};


// Customer APIs
export const getAllCustomers = async ({
  page = 1,
  limit = 10,
  search = '',
  sortBy = 'createdAt',
  sortOrder = 'desc'
} = {}) => {
  try {
    const response = await apiClient.get('/api/customer/getAllCustomers', {
      params: { page, limit, search, sortBy, sortOrder }
    });
    console.log('getAllCustomers response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    throw error;
  }
};

export const getCustomerById = async (customerId) => {
  try {
    if (!customerId) {
      throw new Error('Customer ID is required');
    }
    const response = await apiClient.get(`/api/customer/getCustomerById/${customerId}`);
    console.log('getCustomerById response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    throw error;
  }
};

export const getCustomerOrders = async (customerId) => {
  try {
    if (!customerId) {
      throw new Error('Customer ID is required');
    }
    const response = await apiClient.get(`/api/customer/getCustomerOrders/${customerId}`);
    console.log('getCustomerOrders response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getCustomerOrders:', error);
    throw error;
  }
};

// Nofication  endpoints 
export const getNotifications = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const response = await apiClient.get('/api/order/notifications', { params: { page, limit } });
    console.log('getNotifications response:', response.data);
    return response;
  }
  catch (error) {
    console.error('Error in getNotifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }
    const response = await apiClient.put(`/api/order/notifications/${notificationId}/read`);
    console.log("MakingNotificationRead response:", response.data);
    return response;
  }
  catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    throw error;
  }
};

export const clearReadNotifications = async () => {
  try {
    const response = await apiClient.delete('/api/order/notifications/clear-read');
    return response;
  } catch (error) {
    console.error('Error in clearReadNotifications:', error);
    throw error;
  }
};

// Address APIs with improved error handling
export const getAllAddresses = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await apiClient.get('/api/address/allAddress');
    return response.data;
  } catch (error: any) {
    console.error('Error in getAllAddresses:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch addresses');
  }
};

export const createAddress = async (addressData: {
  description: string;
  city: string;
  street: string;
  district: string;
  isDefault?: boolean;
  postalCode?: string;
  phoneNumber?: string;
  additionalInfo?: string;
}) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post('/api/address/create', addressData);
    return response.data;
  } catch (error: any) {
    console.error('Error in createAddress:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(error.response?.data?.message || 'Failed to create address');
  }
};

export const updateAddress = async (addressId: string, addressData: Partial<{
  description: string;
  city: string;
  street: string;
  district: string;
  isDefault: boolean;
  postalCode: string;
  phoneNumber: string;
  additionalInfo: string;
}>) => {
  try {
    if (!addressId) {
      throw new Error('Address ID is required');
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.put(`/api/address/update/${addressId}`, addressData);
    return response.data;
  } catch (error: any) {
    console.error('Error in updateAddress:', error);
    if (error.response?.status === 404) {
      throw new Error('Address not found');
    }
    throw new Error(error.response?.data?.message || 'Failed to update address');
  }
};

export const deleteAddress = async (addressId: string) => {
  try {
    if (!addressId) {
      throw new Error('Address ID is required');
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.delete(`/api/address/delete/${addressId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error in deleteAddress:', error);
    if (error.response?.status === 404) {
      throw new Error('Address not found');
    }
    throw new Error(error.response?.data?.message || 'Failed to delete address');
  }
};

// Get addresses for a specific user
export const getUserAddresses = async (userId) => {
  try {
    const response = await apiClient.get(`/api/address/user/${userId}`);
    console.log('getUserAddresses response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getUserAddresses:', error);
    throw error;
  }
};

// Test function to check if address routes are working
export const testAddressRoutes = async () => {
  try {
    const response = await apiClient.get('/api/test/address-routes');
    console.log('Address routes test response:', response.data);
    return response;
  } catch (error) {
    console.error('Error testing address routes:', error);
    throw error;
  }
};

export default apiClient;
