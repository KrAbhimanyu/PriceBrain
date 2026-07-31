import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About PriceBrain - The Future of Intelligent Shopping',
  description: 'Discover how PriceBrain is revolutionizing online shopping with AI-powered price comparison, deal detection, fake review prevention, and intelligent purchase recommendations. Learn about our mission to make every online purchase transparent, intelligent, and confidence-driven.',
  keywords: [
    'PriceBrain about',
    'AI shopping assistant',
    'price comparison platform',
    'smart shopping',
    'deal detection',
    'fake review prevention',
    'online shopping AI',
    'e-commerce intelligence',
    'price tracking',
    'warranty management',
  ],
  authors: [{ name: 'PriceBrain Team' }],
  creator: 'PriceBrain',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://pricebrain.com/deal',
    siteName: 'PriceBrain',
    title: 'About PriceBrain - The Future of Intelligent Shopping',
    description: 'Discover how PriceBrain is revolutionizing online shopping with AI-powered price comparison, deal detection, and intelligent purchase recommendations.',
    images: [
      {
        url: '/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'PriceBrain - AI-Powered Commerce Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About PriceBrain - The Future of Intelligent Shopping',
    description: 'Discover how PriceBrain is revolutionizing online shopping with AI-powered price comparison and intelligent recommendations.',
    images: ['/og-about.jpg'],
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
  '@type': 'Organization',
  name: 'PriceBrain',
  description: 'AI-powered Commerce Platform for intelligent shopping',
  url: 'https://pricebrain.com',
  logo: 'https://pricebrain.com/logo.png',
  sameAs: [
    'https://twitter.com/pricebrain',
    'https://linkedin.com/company/pricebrain',
    'https://github.com/pricebrain',
    'https://youtube.com/pricebrain',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'support@pricebrain.com',
  },
};
