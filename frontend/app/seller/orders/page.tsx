'use client';

import { useState } from 'react';
import { Search, Filter, Download, Eye, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MOCK_ORDERS = [
  { id: 'ORD-001', customer: 'Rahul Sharma', email: 'rahul@example.com', product: 'iPhone 15 Pro', quantity: 1, amount: 119900, status: 'Delivered', date: '2024-01-15', address: 'Mumbai, Maharashtra' },
  { id: 'ORD-002', customer: 'Priya Patel', email: 'priya@example.com', product: 'Samsung Galaxy S24', quantity: 1, amount: 79999, status: 'Processing', date: '2024-01-15', address: 'Delhi, NCR' },
  { id: 'ORD-003', customer: 'Amit Kumar', email: 'amit@example.com', product: 'MacBook Air M3', quantity: 1, amount: 114900, status: 'Shipped', date: '2024-01-14', address: 'Bangalore, Karnataka' },
  { id: 'ORD-004', customer: 'Sneha Gupta', email: 'sneha@example.com', product: 'Sony WH-1000XM5', quantity: 2, amount: 49980, status: 'Pending', date: '2024-01-14', address: 'Pune, Maharashtra' },
  { id: 'ORD-005', customer: 'Vikram Singh', email: 'vikram@example.com', product: 'Nike Air Max', quantity: 1, amount: 5995, status: 'Cancelled', date: '2024-01-13', address: 'Jaipur, Rajasthan' },
  { id: 'ORD-006', customer: 'Ananya Reddy', email: 'ananya@example.com', product: 'Adidas Ultraboost', quantity: 2, amount: 15990, status: 'Delivered', date: '2024-01-13', address: 'Hyderabad, Telangana' },
];

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  Pending: { color: 'bg-orange-100 text-orange-700', icon: Clock },
  Processing: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  Shipped: { color: 'bg-blue-100 text-blue-700', icon: Truck },
  Delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  Cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function SellerOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const filteredOrders = MOCK_ORDERS.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage and track your orders</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Orders
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: MOCK_ORDERS.length, color: 'text-primary' },
          { label: 'Pending', value: MOCK_ORDERS.filter(o => o.status === 'Pending').length, color: 'text-orange-600' },
          { label: 'Processing', value: MOCK_ORDERS.filter(o => o.status === 'Processing').length, color: 'text-yellow-600' },
          { label: 'Delivered', value: MOCK_ORDERS.filter(o => o.status === 'Delivered').length, color: 'text-green-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Order List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const config = STATUS_CONFIG[order.status];
                  return (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{order.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="line-clamp-1">{order.product}</p>
                        <p className="text-xs text-muted-foreground">Qty: {order.quantity}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold">₹{order.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge className={config.color}>
                          <config.icon className="h-3 w-3 mr-1" />
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === 'Pending' && (
                          <Button variant="ghost" size="sm" className="text-green-600">
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
