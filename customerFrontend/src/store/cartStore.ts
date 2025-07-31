import { create } from 'zustand';
import { Product } from '../data/products';
import { addToCart, removeFromCart, updateCartItemQuantity, getCartItems, clearCart, placeOrder } from '@/ApiConfig/ApiConfiguration';
import { toast } from 'sonner';

interface CartItem extends Product {
  quantity: number;
  description?: string;
  productUnit?: string;
  offerPrice?: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: number | string) => Promise<void>;
  updateQuantity: (productId: number | string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  setAuthenticated: (value: boolean) => void;
  fetchCart: () => Promise<void>;
  placeOrder: (orderData: { addressId: string; paymentType: 'online' | 'cash' }) => Promise<any>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  isRefreshing: false,

  addItem: async (product: Product) => {
    console.log('cartStore: Attempting to add item', { product });
    try {
      set({ isRefreshing: true });

      if (!product?.id) {
        console.error('cartStore: Invalid product ID', { product });
        toast.error('Invalid product data');
        return;
      }

      const response = await addToCart(product.id);
      console.log('cartStore: addToCart response', response);

      if (response.success) {
        await get().fetchCart();
        toast.success(`Added ${product.name || 'item'} to your cart!`);
      } else {
        throw new Error(response.message || 'Failed to add item to cart');
      }
    } catch (error: any) {
      console.error('cartStore: Error adding item to cart', error);
      toast.error(error.message || 'Failed to add item to cart');
    } finally {
      set({ isRefreshing: false });
    }
  },

  removeItem: async (productId: number | string) => {
    console.log('cartStore: Attempting to remove item', { productId });
    try {
      set({ isRefreshing: true });

      const response = await removeFromCart(productId);
      console.log('cartStore: removeFromCart response', response);

      if (response.success) {
        await get().fetchCart();
        toast.success('Item removed from cart');
      } else {
        throw new Error(response.message || 'Failed to remove item from cart');
      }
    } catch (error: any) {
      console.error('cartStore: Error removing item from cart', error);
      toast.error(error.message || 'Failed to remove item from cart');
    } finally {
      set({ isRefreshing: false });
    }
  },

  updateQuantity: async (productId: number | string, quantity: number) => {
    console.log('cartStore: Attempting to update quantity', { productId, quantity });
    try {
      set({ isRefreshing: true });

      const response = await updateCartItemQuantity(productId, quantity);
      console.log('cartStore: updateCartItemQuantity response', response);

      if (response.success) {
        await get().fetchCart();
        toast.success('Cart updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update quantity');
      }
    } catch (error: any) {
      console.error('cartStore: Error updating cart quantity', error);
      toast.error(error.message || 'Failed to update quantity');
    } finally {
      set({ isRefreshing: false });
    }
  },

  clearCart: async () => {
    console.log('cartStore: Attempting to clear cart');
    try {
      set({ isRefreshing: true });

      const response = await clearCart();
      console.log('cartStore: clearCart response', response);

      if (response.success) {
        set({ items: [], totalItems: 0, totalPrice: 0 });
        toast.success('Cart cleared successfully');
      } else {
        throw new Error(response.message || 'Failed to clear cart');
      }
    } catch (error: any) {
      console.error('cartStore: Error clearing cart', error);
      toast.error(error.message || 'Failed to clear cart');
    } finally {
      set({ isRefreshing: false });
    }
  },

  toggleCart: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  setAuthenticated: (value: boolean) => {
    console.log('cartStore: Setting authenticated', { value });
    set({ isAuthenticated: value });
    if (value) {
      get().fetchCart();
    } else {
      set({ items: [], totalItems: 0, totalPrice: 0 });
    }
  },

  fetchCart: async () => {
    console.log('cartStore: Fetching cart');
    try {
      set({ isLoading: true });
      const response = await getCartItems();
      console.log('cartStore: getCartItems response', response);

      if (!response.success || !response.cart) {
        console.log('cartStore: No cart found, resetting state');
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          isLoading: false,
        });
        return;
      }

      const transformedItems = response.cart.products.map((item: any) => {
        if (!item?.productId) {
          console.warn('cartStore: Invalid item in cart', item);
          return null;
        }
        return {
          id: item.productId._id,
          name: item.productId.productname,
          price: item.productId.offerPrice || item.productId.price,
          image: item.productId.productImage,
          description: item.productId.description,
          productUnit: item.productId.productUnit,
          offerPrice: item.productId.offerPrice,
          category: item.productId.productCategory?.name || "Unknown",
          unit: item.productId.productUnit || "unit",
          quantity: item.quantity,
          discount: item.productId.offerPrice
            ? ((item.productId.price - item.productId.offerPrice) / item.productId.price * 100)
            : 0,
        };
      }).filter(Boolean);

      const totalItems = transformedItems.reduce((total, item) => total + item.quantity, 0);
      const totalPrice = transformedItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      console.log('cartStore: Cart state updated', { items: transformedItems, totalItems, totalPrice });

      set({
        items: transformedItems,
        totalItems,
        totalPrice,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('cartStore: Failed to fetch cart', error);
      set({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isLoading: false,
      });
      toast.error(error.message || 'Failed to fetch cart');
    }
  },

  placeOrder: async (orderData: { addressId: string; paymentType: 'online' | 'cash' }) => {
    console.log('cartStore: Attempting to place order', { orderData });
    try {
      set({ isLoading: true });

      const response = await placeOrder(orderData);
      console.log('cartStore: placeOrder response', response);

      if (response.success) {
        set({ items: [], totalItems: 0, totalPrice: 0 });
        console.log('cartStore: Order placed successfully, cart cleared');
        toast.success('Order placed successfully and cart cleared!');
        return response;
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('cartStore: Error placing order', error);
      toast.error(error.message || 'Failed to place order');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));