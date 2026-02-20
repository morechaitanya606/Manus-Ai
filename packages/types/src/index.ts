export const ROLE_VALUES = [
  'PLATFORM_ADMIN',
  'STORE_OWNER',
  'STORE_MANAGER',
  'CUSTOMER'
] as const;

export type Role = (typeof ROLE_VALUES)[number];

export const ORDER_STATUS_VALUES = [
  'CREATED',
  'PAYMENT_PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'PAYMENT_FAILED'
] as const;

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];
