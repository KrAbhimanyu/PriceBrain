'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TIME_RANGES = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Year', value: '1y' },
];

const ANALYTICS_DATA = {
  revenue: { value: 245890, change: 12.5, trend: 'up' },
  orders: { value: 1234, change: 8.2, trend: 'up' },
  customers: { value: 892, change: -3.1, trend: 'down' },
  avgOrderValue: { value: 4567, change: 5.8, trend: 'up' },
};

const TOP_PRODUCTS = [
  { name: 'iPhone 15 Pro', sales: 45, revenue: 5395500, growth: 15 },
  { name: 'Samsung Galaxy S24', sales: 32, revenue: 2559968, growth: 8 },
  { name: 'MacBook Air M3', sales: 18, revenue: 2068200, growth: -2 },
  { name: 'Sony WH-1000XM5', sales: 56, revenue: 1399440, growth: 22 },
  { name: 'Nike Air Max', sales: 89, revenue: 533555, growth: 12 },
];

const SALES_BY_CATEGORY = [
  { category: 'Electronics', sales: 125000, percentage: 51 },
  { category: 'Fashion', sales: 65000, percentage: 26 },
  { category: 'Home & Kitchen', sales: 35000, percentage: 14 },
  { category: 'Others', sales: 20890, percentage: 9 },
];

export default function SellerAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your store performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                ANALYTICS_DATA.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {ANALYTICS_DATA.revenue.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {ANALYTICS_DATA.revenue.change}%
              </div>
            </div>
            <h3 className="text-2xl font-bold">₹{ANALYTICS_DATA.revenue.value.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                ANALYTICS_DATA.orders.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {ANALYTICS_DATA.orders.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {ANALYTICS_DATA.orders.change}%
              </div>
            </div>
            <h3 className="text-2xl font-bold">{ANALYTICS_DATA.orders.value.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                ANALYTICS_DATA.customers.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {ANALYTICS_DATA.customers.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {ANALYTICS_DATA.customers.change}%
              </div>
            </div>
            <h3 className="text-2xl font-bold">{ANALYTICS_DATA.customers.value.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                ANALYTICS_DATA.avgOrderValue.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {ANALYTICS_DATA.avgOrderValue.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {ANALYTICS_DATA.avgOrderValue.change}%
              </div>
            </div>
            <h3 className="text-2xl font-bold">₹{ANALYTICS_DATA.avgOrderValue.value.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground">Avg. Order Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Your revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                <p className="font-medium">Revenue Chart</p>
                <p className="text-sm text-muted-foreground">Integrate with Recharts or Chart.js</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SALES_BY_CATEGORY.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm text-muted-foreground">₹{item.sales.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>Your best sellers by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sales</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Growth</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS.map((product, index) => (
                  <tr key={product.name} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{product.sales} units</td>
                    <td className="py-3 px-4 font-semibold">₹{product.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={product.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.growth >= 0 ? '+' : ''}{product.growth}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
