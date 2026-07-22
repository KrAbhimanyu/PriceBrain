'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ExternalLink, Clock, CheckCircle, XCircle, Package } from 'lucide-react';

const orders = [
  {
    id: 'ORD-001',
    date: '2026-07-01',
    product: { name: 'iPhone 15 Pro 128GB', price: 119900, retailer: 'Amazon' },
    status: 'completed',
    commission: 4196,
    cashback: 500,
  },
  {
    id: 'ORD-002',
    date: '2026-06-28',
    product: { name: 'Samsung Galaxy Watch 6', price: 29999, retailer: 'Flipkart' },
    status: 'pending',
    commission: 1200,
    cashback: null,
  },
  {
    id: 'ORD-003',
    date: '2026-06-25',
    product: { name: 'Sony WH-1000XM5', price: 24990, retailer: 'Amazon' },
    status: 'completed',
    commission: 875,
    cashback: 200,
  },
  {
    id: 'ORD-004',
    date: '2026-06-20',
    product: { name: 'MacBook Air M2', price: 84990, retailer: 'Croma' },
    status: 'cancelled',
    commission: null,
    cashback: null,
  },
];

export default function OrdersPage() {
  const [filter, setFilter] = useState('all');

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const totalCommission = orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + (o.commission || 0), 0);
  const totalCashback = orders.filter((o) => o.status === 'completed' && o.cashback).reduce((sum, o) => sum + (o.cashback || 0), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Package className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Orders</h1>
          <p className="text-slate-600">Track your affiliate orders and earnings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{orders.filter((o) => o.status === 'completed').length}</p>
                <p className="text-sm text-slate-500">Completed Orders</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">₹{totalCommission.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Total Commission</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">₹{totalCashback.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Cashback Earned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'completed', 'pending', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-slate-500">Order ID: {order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBg(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">Placed on {order.date}</p>
                </div>
                {getStatusIcon(order.status)}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-lg" />
                  <div>
                    <p className="font-medium text-slate-900">{order.product.name}</p>
                    <p className="text-sm text-slate-500">from {order.product.retailer}</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">₹{order.product.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  {order.commission && (
                    <div>
                      <p className="text-sm text-slate-500">Commission</p>
                      <p className="text-lg font-bold text-green-600">+₹{order.commission.toLocaleString()}</p>
                    </div>
                  )}
                  {order.cashback && (
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">Cashback</p>
                      <p className="text-lg font-bold text-purple-600">+₹{order.cashback.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  View on {order.product.retailer}
                </button>
                {order.status === 'pending' && (
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-500">You haven&apos;t made any purchases through PriceBrain yet</p>
            <Link href="/" className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}