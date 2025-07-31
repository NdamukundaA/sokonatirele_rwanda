import { create } from 'zustand';
import { AddressData } from '@/types/address';
import { 
  addAddress, 
  getAllAddresses, 
  updateAddress, 
  deleteAddress 
} from '@/ApiConfig/ApiConfiguration';

interface ShippingState {
  addresses: AddressData[];
  isLoading: boolean;
  error: string | null;
  addNewAddress: (addressData: Omit<AddressData, '_id' | 'userId'>) => Promise<boolean>;
  fetchAddresses: () => Promise<void>;
  updateExistingAddress: (id: string, addressData: Partial<AddressData>) => Promise<boolean>;
  removeAddress: (id: string) => Promise<boolean>;
}

export const useShippingStore = create<ShippingState>((set) => ({
  addresses: [],
  isLoading: false,
  error: null,

  addNewAddress: async (addressData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await addAddress(addressData);
      if (response.success && response.data) {
        set(state => ({
          addresses: [...state.addresses, response.data]
        }));
        return true;
      }
      set({ error: response.message });
      return false;
    } catch (error: any) {
      set({ error: error.message || 'Failed to add address' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllAddresses();
      if (response.success && response.data) {
        set({ addresses: response.data });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch addresses' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateExistingAddress: async (id, addressData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateAddress(id, addressData);
      if (response.success && response.data) {
        set(state => ({
          addresses: state.addresses.map(addr => 
            addr._id === id ? { ...addr, ...response.data } : addr
          )
        }));
        return true;
      }
      set({ error: response.message });
      return false;
    } catch (error: any) {
      set({ error: error.message || 'Failed to update address' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  removeAddress: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteAddress(id);
      if (response.success) {
        set(state => ({
          addresses: state.addresses.filter(addr => addr._id !== id)
        }));
        return true;
      }
      set({ error: response.message });
      return false;
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete address' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));
