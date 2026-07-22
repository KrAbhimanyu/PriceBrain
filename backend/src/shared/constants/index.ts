export const RETAILERS = {
  AMAZON: 'amazon',
  FLIPKART: 'flipkart',
  MYNTRA: 'myntra',
  AJIO: 'ajio',
  CROMA: 'croma',
  TATACLIQ: 'tatacliq',
  RELIANCE: 'reliance',
  MEESHO: 'meesho',
  NYKAA: 'nykaa',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

export const JOB_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const NOTIFICATION_TYPES = {
  PRICE_DROP: 'price_drop',
  WISHLIST_UPDATE: 'wishlist_update',
  SYSTEM: 'system',
  PROMOTION: 'promotion',
} as const;

export const COUPON_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;
