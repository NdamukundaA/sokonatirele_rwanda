export interface UserDetails {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface AddressData {
  _id?: string;
  description: string;
  city: string;
  street: string;
  district: string;
  phoneNumber: string;
  userId?: UserDetails;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address extends AddressData {
  _id: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressResponse {
  success: boolean;
  message: string;
  address: AddressData;
}