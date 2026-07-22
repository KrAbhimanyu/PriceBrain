'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, TrendingUp, Users, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for seller dashboard
const MOCK_STATS = [
  { title: 'Total Revenue', value: '₹2,45,890', change: '+12.5%', trend: 'up', icon: DollarSign },
  { title: 'Total Orders', value: '1,234', change: '+8.2%', trend: 'up', icon: ShoppingCart },
  { title: 'Products Listed', value: '156', change: '+23', trend: 'up', icon: Package },
  { title: 'Total Customers', value: '892', change: '-3.1%', trend: 'down', icon: Users },
];

const MOCK_RECENT_ORDERS = [
  { id: 'ORD-001', customer: 'Rahul Sharma', product: 'iPhone 15 Pro', amount: '₹1,19,900', status: 'Delivered', date: '2024-01-15' },
  { id: 'ORD-002', customer: 'Priya Patel', product: 'Samsung Galaxy S24', amount: '₹79,999', status: 'Processing', date: '2024-01-15' },
  { id: 'ORD-003', customer: 'Amit Kumar', product: 'MacBook Air M3', amount: '₹1,14,900', status: 'Shipped', date: '2024-01-14' },
  { id: 'ORD-004', customer: 'Sneha Gupta', product: 'Sony WH-1000XM5', amount: '₹24,990', status: 'Pending', date: '2024-01-14' },
];

const STATUS_COLORS: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  Pending: 'bg-orange-100 text-orange-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function SellerDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your store overview.</p>
        </div>
        <Button asChild>
          <Link href="/seller/products/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          MOCK_STATS.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Your revenue for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Chart will appear here</p>
                <p className="text-sm text-muted-foreground">Integrate with charting library</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Your best selling products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'iPhone 15 Pro', sales: 45, revenue: '₹53,95,500' },
                { name: 'Samsung Galaxy S24', sales: 32, revenue: '₹25,59,968' },
                { name: 'MacBook Air M3', sales: 18, revenue: '₹20,68,200' },
                { name: 'Sony WH-1000XM5', sales: 56, revenue: '₹13,99,440' },
              ].map((product, i) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">{i + 1}</span>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                    </div>
                  </div>
                  <p className="font-semibold">{product.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your store</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/seller/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RECENT_ORDERS.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{order.id}</td>
                      <td className="py-3 px-4">{order.customer}</td>
                      <td className="py-3 px-4">{order.product}</td>
                      <td className="py-3 px-4 font-semibold">{order.amount}</td>
                      <td className="py-3 px-4">
                        <Badge className={STATUS_COLORS[order.status]}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
