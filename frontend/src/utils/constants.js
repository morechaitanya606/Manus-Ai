export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const PRODUCT_TYPES = [
  { value: 'tshirt-oversized', label: 'T-Shirts (Oversized)' },
  { value: 'tshirt-polo', label: 'T-Shirts (Polo)' },
  { value: 'tshirt-roundneck', label: 'T-Shirts (Round Neck)' },
  { value: 'hoodie', label: 'Hoodies' },
  { value: 'shirt', label: 'Shirts' },
  { value: 'jacket', label: 'Jackets' }
];

export const CATEGORIES = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' }
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const COLORS = ['Black', 'White', 'Navy', 'Olive', 'Beige', 'Burgundy', 'Gray'];

export const ORDER_STATUSES = ['placed', 'paid', 'shipped', 'delivered', 'cancelled'];
