// Utility functions for address handling

export interface AddressData {
  firstName?: string;
  lastName?: string;
  street?: string;
  village?: string;
  cell?: string;
  sector?: string;
  district?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  description?: string;
}

/**
 * Formats an address object into a readable, labeled string for display
 */
export const formatAddress = (address: AddressData | null | undefined): string => {
  if (!address) return 'No address provided';
  
  const parts = [];
  
  if (address.description) parts.push(`Delivery Description: ${address.description}`);
  if (address.district) parts.push(`District: ${address.district}`);
  if (address.city) parts.push(`City: ${address.city}`);
  if (address.sector) parts.push(`Sector: ${address.sector}`);
  if (address.cell) parts.push(`Cell: ${address.cell}`);
  if (address.village) parts.push(`Village: ${address.village}`);
  
  return parts.join('\n');
};

/**
 * Formats an address for display in a compact format
 */
export const formatAddressCompact = (address: AddressData | null | undefined): string => {
  if (!address) return 'No address provided';
  
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.district) parts.push(address.district);
  if (address.city) parts.push(address.city);
  
  return parts.join(', ');
};

/**
 * Validates if an address has the minimum required fields
 */
export const validateAddress = (address: AddressData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!address.street?.trim()) {
    errors.push('Street is required');
  }
  
  if (!address.city?.trim()) {
    errors.push('City is required');
  }
  
  if (!address.district?.trim()) {
    errors.push('District is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Creates a short address identifier
 */
export const createAddressIdentifier = (address: AddressData): string => {
  const parts = [];
  
  if (address.description) {
    parts.push(address.description);
  } else if (address.street) {
    parts.push(address.street.split(' ')[0]); // First word of street
  }
  
  if (address.city) {
    parts.push(address.city);
  }
  
  return parts.join(' - ') || 'Unknown Address';
};

/**
 * Formats address for CSV export
 */
export const formatAddressForExport = (address: AddressData): string => {
  if (!address) return '';
  
  const parts = [];
  
  if (address.firstName && address.lastName) {
    parts.push(`${address.firstName} ${address.lastName}`);
  }
  if (address.street) parts.push(address.street);
  if (address.village) parts.push(address.village);
  if (address.cell) parts.push(address.cell);
  if (address.sector) parts.push(address.sector);
  if (address.district) parts.push(address.district);
  if (address.city) parts.push(address.city);
  if (address.country) parts.push(address.country);
  if (address.postalCode) parts.push(address.postalCode);
  
  return parts.join(', ');
};

/**
 * Improved address formatting function
 */
interface AddressType {
  street?: string;
  city?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  description?: string;
}

export const formatAddressImproved = (address: AddressType): string => {
  if (!address) return 'No address provided';

  const components = [];

  // Add name if available
  if (address.firstName || address.lastName) {
    components.push(`${address.firstName || ''} ${address.lastName || ''}`.trim());
  }

  // Add description if available
  if (address.description) {
    components.push(address.description);
  }

  // Add street address
  if (address.street) {
    components.push(address.street);
  }

  // Add detailed location hierarchy
  const locationParts = [
    address.village && `Village: ${address.village}`,
    address.cell && `Cell: ${address.cell}`,
    address.sector && `Sector: ${address.sector}`,
    address.district && `District: ${address.district}`,
    address.city && `City: ${address.city}`,
    address.country && address.country
  ].filter(Boolean);

  if (locationParts.length > 0) {
    components.push(locationParts.join(', '));
  }

  // Add postal code if available
  if (address.postalCode) {
    components.push(`Postal Code: ${address.postalCode}`);
  }

  return components.filter(Boolean).join('\n');
};