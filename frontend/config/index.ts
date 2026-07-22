export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'PriceBrain',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    description: 'AI-Powered Price Comparison Platform',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    timeout: 30000,
    retries: 3,
  },
  auth: {
    jwtExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
    tokenKey: 'pricebrain_token',
    refreshTokenKey: 'pricebrain_refresh_token',
  },
  search: {
    debounceMs: 300,
    minChars: 2,
    maxResults: 10,
    maxSuggestions: 8,
  },
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },
  cache: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  animation: {
    duration: 300,
    spring: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableAIRecommendations: process.env.NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS === 'true',
    enableNotifications: true,
    enablePriceHistory: true,
    enableWishlist: true,
  },
};

export type Config = typeof config;
