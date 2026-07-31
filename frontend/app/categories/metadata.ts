import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories | PriceBrain - AI-Powered Product Discovery',
  description: 'Explore millions of products organized intelligently by AI, interests, trends, lifestyle, and shopping goals. Discover products effortlessly with PriceBrain\'s AI-powered category discovery platform.',
  keywords: [
    'categories',
    'product categories',
    'shop by category',
    'AI categories',
    'product discovery',
    'online shopping',
    'electronics',
    'fashion',
    'home',
    'lifestyle shopping',
    'trending products',
    'brand discovery',
  ],
  authors: [{ name: 'PriceBrain Team' }],
  creator: 'PriceBrain',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://pricebrain.com/categories',
    siteName: 'PriceBrain',
    title: 'Categories | PriceBrain - AI-Powered Product Discovery',
    description: 'Explore millions of products organized intelligently by AI, interests, trends, lifestyle, and shopping goals.',
    images: [
      {
        url: '/og-categories.jpg',
        width: 1200,
        height: 630,
        alt: 'PriceBrain Categories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Categories | PriceBrain - AI-Powered Product Discovery',
    description: 'Explore millions of products organized intelligently by AI.',
    images: ['/og-categories.jpg'],
    creator: '@pricebrain',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://pricebrain.com/categories',
  },
};

// Structured data for rich snippets
export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'PriceBrain Product Categories',
  description: 'AI-powered product discovery platform with categories organized by interests, trends, and lifestyle',
  url: 'https://pricebrain.com/categories',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Electronics', url: 'https://pricebrain.com/categories/electronics' },
      { '@type': 'ListItem', position: 2, name: 'Fashion', url: 'https://pricebrain.com/categories/fashion' },
      { '@type': 'ListItem', position: 3, name: 'Home & Kitchen', url: 'https://pricebrain.com/categories/home-kitchen' },
      { '@type': 'ListItem', position: 4, name: 'Beauty', url: 'https://pricebrain.com/categories/beauty' },
      { '@type': 'ListItem', position: 5, name: 'Sports', url: 'https://pricebrain.com/categories/sports' },
    ],
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pricebrain.com' },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://pricebrain.com/categories' },
    ],
  },
};
