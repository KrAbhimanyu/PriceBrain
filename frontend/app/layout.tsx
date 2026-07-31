import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar, Footer } from '@/components/layout';
import { AskBrainWrapper } from '@/components/askbrain';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'PriceBrain - AI-Powered Price Comparison Platform',
    template: '%s | PriceBrain',
  },
  description: 'Compare prices across Amazon, Flipkart, Myntra, and more. Find the best deals and save money on every purchase with AI-powered recommendations.',
  keywords: ['price comparison', 'online shopping', 'deals', 'coupons', 'Amazon', 'Flipkart', 'Myntra', 'best prices'],
  authors: [{ name: 'PriceBrain Team' }],
  creator: 'PriceBrain',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://pricebrain.com',
    siteName: 'PriceBrain',
    title: 'PriceBrain - AI-Powered Price Comparison Platform',
    description: 'Compare prices across Amazon, Flipkart, Myntra, and more. Find the best deals.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PriceBrain - AI-Powered Price Comparison',
    description: 'Compare prices across Amazon, Flipkart, Myntra, and more.',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {/* AskBrain - Global AI Operating Layer */}
          <AskBrainWrapper position="bottom-right" buttonSize="md">
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AskBrainWrapper>
        </Providers>
      </body>
    </html>
  );
}
