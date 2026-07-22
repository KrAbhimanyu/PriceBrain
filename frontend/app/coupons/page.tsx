'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, Copy, Check, Clock, Percent, ShoppingBag, TrendingDown } from 'lucide-react';

const retailers = [
  { id: 'all', name: 'All Stores', logo: '/logos/all.png' },
  { id: 'amazon', name: 'Amazon', logo: '/logos/amazon.png' },
  { id: 'flipkart', name: 'Flipkart', logo: '/logos/flipkart.png' },
  { id: 'myntra', name: 'Myntra', logo: '/logos/myntra.png' },
  { id: 'ajio', name: 'AJIO', logo: '/logos/ajio.png' },
  { id: 'croma', name: 'Croma', logo: '/logos/croma.png' },
];

const coupons = [
  {
    id: '1',
    code: 'FLAT500',
    description: 'Get flat ₹500 off on orders above ₹2999',
    type: 'percentage',
    value: 500,
    minPurchase: 2999,
    expiresAt: '2026-07-15',
    retailer: { id: 'amazon', name: 'Amazon' },
    isHot: true,
    usageCount: 2341,
  },
  {
    id: '2',
    code: 'SUMMER30',
    description: '30% off on summer collection',
    type: 'percentage',
    value: 30,
    maxDiscount: 1500,
    minPurchase: 999,
    expiresAt: '2026-07-20',
    retailer: { id: 'myntra', name: 'Myntra' },
    isHot: false,
    usageCount: 1876,
  },
  {
    id: '3',
    code: 'TECH1000',
    description: '₹1000 off on electronics above ₹9999',
    type: 'fixed',
    value: 1000,
    minPurchase: 9999,
    expiresAt: '2026-07-25',
    retailer: { id: 'flipkart', name: 'Flipkart' },
    isHot: true,
    usageCount: 3421,
  },
  {
    id: '4',
    code: 'NEWUSER',
    description: 'Extra 15% off for new users',
    type: 'percentage',
    value: 15,
    maxDiscount: 2000,
    expiresAt: '2026-08-01',
    retailer: { id: 'ajio', name: 'AJIO' },
    isHot: false,
    usageCount: 987,
  },
  {
    id: '5',
    code: 'ELECTRONICS20',
    description: '20% off on all electronics',
    type: 'percentage',
    value: 20,
    maxDiscount: 3000,
    minPurchase: 1999,
    expiresAt: '2026-07-18',
    retailer: { id: 'croma', name: 'Croma' },
    isHot: false,
    usageCount: 1543,
  },
  {
    id: '6',
    code: 'BANK10',
    description: 'Additional 10% off with HDFC cards',
    type: 'percentage',
    value: 10,
    maxDiscount: 1000,
    expiresAt: '2026-07-30',
    retailer: { id: 'amazon', name: 'Amazon' },
    isHot: true,
    usageCount: 4521,
  },
];

export default function CouponsPage() {
  const [selectedRetailer, setSelectedRetailer] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesRetailer = selectedRetailer === 'all' || coupon.retailer.id === selectedRetailer;
    const matchesSearch = searchQuery === '' || 
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRetailer && matchesSearch;
  });

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getDaysUntilExpiry = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const today = new Date();
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Percent className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Deals & Coupons</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Save money with exclusive coupons and deals from top retailers. 
            We verify all codes daily to ensure they work.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Retailer Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {retailers.map((retailer) => (
            <button
              key={retailer.id}
              onClick={() => setSelectedRetailer(retailer.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedRetailer === retailer.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {retailer.name}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <div className="text-3xl font-bold text-slate-900">{coupons.length}+</div>
            <div className="text-slate-500">Active Coupons</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600">₹5,000+</div>
            <div className="text-slate-500">Avg. Savings</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">98%</div>
            <div className="text-slate-500">Success Rate</div>
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => {
            const daysLeft = getDaysUntilExpiry(coupon.expiresAt);
            const isExpiringSoon = daysLeft <= 3;

            return (
              <div
                key={coupon.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-500">{coupon.retailer.name}</span>
                    {coupon.isHot && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Hot
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{coupon.description}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    {coupon.minPurchase && (
                      <span>Min. order: ₹{coupon.minPurchase.toLocaleString()}</span>
                    )}
                    {coupon.maxDiscount && (
                      <span>Max. discount: ₹{coupon.maxDiscount.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Code Section */}
                <div className="p-6 bg-slate-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 bg-white border-2 border-dashed border-blue-300 rounded-lg px-4 py-3 text-center">
                      <span className="text-xl font-mono font-bold text-blue-600 tracking-wider">
                        {coupon.code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className={`p-3 rounded-lg transition-all ${
                        copiedCode === coupon.code
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`flex items-center gap-1 ${
                      isExpiringSoon ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      <Clock className="w-4 h-4" />
                      {isExpiringSoon ? `${daysLeft} days left` : `Expires ${coupon.expiresAt}`}
                    </span>
                    <span className="text-slate-500">{coupon.usageCount.toLocaleString()} uses</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No coupons found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Never miss a deal!</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Get notified when new coupons are added or when prices drop on items in your wishlist
          </p>
          <div className="flex max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
