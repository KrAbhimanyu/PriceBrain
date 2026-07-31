export const APP_NAME = 'PriceBrain';
export const APP_DESCRIPTION = 'AI-Powered Price Comparison Platform';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const RETAILERS = [
  { id: 'amazon', name: 'Amazon', logo: '/retailers/amazon.svg' },
  { id: 'flipkart', name: 'Flipkart', logo: '/retailers/flipkart.svg' },
  { id: 'myntra', name: 'Myntra', logo: '/retailers/myntra.svg' },
  { id: 'ajio', name: 'AJIO', logo: '/retailers/ajio.svg' },
  { id: 'croma', name: 'Croma', logo: '/retailers/croma.svg' },
  { id: 'tatacliq', name: 'Tata Cliq', logo: '/retailers/tatacliq.svg' },
  { id: 'reliance', name: 'Reliance Digital', logo: '/retailers/reliance.svg' },
  { id: 'meesho', name: 'Meesho', logo: '/retailers/meesho.svg' },
  { id: 'nykaa', name: 'Nykaa', logo: '/retailers/nykaa.svg' },
] as const;

export const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: 'Laptop', slug: 'electronics' },
  { id: 'fashion', name: 'Fashion', icon: 'Shirt', slug: 'fashion' },
  { id: 'home', name: 'Home & Kitchen', icon: 'Home', slug: 'home-kitchen' },
  { id: 'beauty', name: 'Beauty', icon: 'Sparkles', slug: 'beauty' },
  { id: 'sports', name: 'Sports & Fitness', icon: 'Dumbbell', slug: 'sports-fitness' },
  { id: 'books', name: 'Books', icon: 'BookOpen', slug: 'books' },
  { id: 'toys', name: 'Toys & Games', icon: 'Gamepad2', slug: 'toys-games' },
  { id: 'grocery', name: 'Grocery', icon: 'ShoppingCart', slug: 'grocery' },
] as const;

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
] as const;

export const PRICE_RANGES = [
  { min: 0, max: 500, label: 'Under ₹500' },
  { min: 500, max: 1000, label: '₹500 - ₹1000' },
  { min: 1000, max: 5000, label: '₹1000 - ₹5000' },
  { min: 5000, max: 10000, label: '₹5000 - ₹10000' },
  { min: 10000, max: 20000, label: '₹10000 - ₹20000' },
  { min: 20000, max: 50000, label: '₹20000 - ₹50000' },
  { min: 50000, max: null, label: 'Above ₹50000' },
] as const;

export const RATING_FILTERS = [
  { min: 4, label: '4★ & above' },
  { min: 3, label: '3★ & above' },
  { min: 2, label: '2★ & above' },
  { min: 1, label: '1★ & above' },
] as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/deals', label: 'Deals' },
  { href: '/categories', label: 'Categories' },
  { href: '/dashboard', label: 'Dashboard', icon: 'Rocket' },
  { href: '/missions', label: 'Missions', icon: 'Target' },
  { href: '/about', label: 'About' },
] as const;

export const USER_MENU_LINKS = [
  { href: '/profile', label: 'Profile', icon: 'User' },
  { href: '/dashboard', label: 'Mission Control', icon: 'Rocket' },
  { href: '/missions', label: 'My Missions', icon: 'Target' },
  { href: '/approvals', label: 'Approvals', icon: 'Shield' },
  { href: '/automation', label: 'Automations', icon: 'Zap' },
  { href: '/seller', label: 'Seller Dashboard', icon: 'Store' },
  { href: '/wishlist', label: 'Wishlist', icon: 'Heart' },
  { href: '/orders', label: 'Price Alerts', icon: 'Bell' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
] as const;

export const FOOTER_LINKS = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/careers', label: 'Careers' },
    { href: '/blog', label: 'Blog' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
  ],
  support: [
    { href: '/help', label: 'Help Center' },
    { href: '/faq', label: 'FAQ' },
    { href: '/feedback', label: 'Feedback' },
  ],
};

export const SOCIAL_LINKS = [
  { href: 'https://twitter.com/pricebrain', label: 'Twitter', icon: 'Twitter' },
  { href: 'https://facebook.com/pricebrain', label: 'Facebook', icon: 'Facebook' },
  { href: 'https://instagram.com/pricebrain', label: 'Instagram', icon: 'Instagram' },
  { href: 'https://linkedin.com/company/pricebrain', label: 'LinkedIn', icon: 'LinkedIn' },
];

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'An account with this email already exists',
  WEAK_PASSWORD: 'Password must be at least 8 characters with numbers and letters',
  TOKEN_EXPIRED: 'Your session has expired. Please login again',
  ACCOUNT_LOCKED: 'Your account has been locked. Please try again later',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
} as const;

export const TOAST_DURATION = 5000;
export const TOAST_DURATION_LONG = 8000;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const SEARCH_DEBOUNCE_MS = 300;
export const AUTOCOMPLETE_MIN_CHARS = 2;
export const AUTOCOMPLETE_MAX_RESULTS = 8;

export const IMAGE_PLACEHOLDER = '/images/placeholder.svg';
export const AVATAR_PLACEHOLDER = '/images/avatar.svg';
