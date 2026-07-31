import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI-Powered Deals | PriceBrain - Smart Shopping Deals 2024',
  description: 'Discover the smartest deals with PriceBrain\'s AI Deal Intelligence. Get real-time AI Deal Scores, price predictions, and personalized recommendations. Shop smarter, save more on Amazon, Flipkart, and 500+ retailers.',
  keywords: [
    'deals',
    'price comparison',
    'AI deals',
    'best deals today',
    'discount offers',
    'shopping deals',
    'Amazon deals',
    'Flipkart deals',
    'price tracker',
    'deal alerts',
    'smart shopping',
    'price drop',
    'coupon codes',
    'bank offers',
    'EMI deals',
  ],
  authors: [{ name: 'PriceBrain Team' }],
  creator: 'PriceBrain',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://pricebrain.com/deal',
    siteName: 'PriceBrain',
    title: 'AI-Powered Deals | PriceBrain - Smart Shopping Deals 2024',
    description: 'Discover the smartest deals with PriceBrain\'s AI Deal Intelligence. Get real-time AI Deal Scores, price predictions, and personalized recommendations.',
    images: [
      {
        url: '/og-deals.jpg',
        width: 1200,
        height: 630,
        alt: 'PriceBrain AI Deals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Powered Deals | PriceBrain',
    description: 'Discover the smartest deals with AI Deal Intelligence. Shop smarter, save more.',
    images: ['/og-deals.jpg'],
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
    canonical: 'https://pricebrain.com/deal',
  },
};

// Structured data for rich snippets
export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'PriceBrain AI Deals',
  description: 'AI-powered deal discovery and price comparison platform',
  url: 'https://pricebrain.com/deal',
  mainEntity: {
    '@type': 'CollectionPage',
    name: 'Today\'s Best Deals',
    description: 'Curated deals with AI Deal Scores',
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://pricebrain.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Deals',
        item: 'https://pricebrain.com/deal',
      },
    ],
  },
};
