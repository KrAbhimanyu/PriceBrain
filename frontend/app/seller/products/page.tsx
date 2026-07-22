'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MOCK_PRODUCTS = [
  { id: '1', name: 'iPhone 15 Pro', price: 119900, mrp: 159900, stock: 45, status: 'active', category: 'Electronics', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200' },
  { id: '2', name: 'Samsung Galaxy S24', price: 79999, mrp: 99999, stock: 32, status: 'active', category: 'Electronics', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200' },
  { id: '3', name: 'MacBook Air M3', price: 114900, mrp: 149900, stock: 18, status: 'active', category: 'Electronics', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200' },
  { id: '4', name: 'Sony WH-1000XM5', price: 24990, mrp: 34990, stock: 67, status: 'inactive', category: 'Electronics', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200' },
  { id: '5', name: 'Nike Air Max', price: 5995, mrp: 9995, stock: 120, status: 'active', category: 'Fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
  { id: '6', name: 'Adidas Ultraboost', price: 7995, mrp: 12995, stock: 85, status: 'active', category: 'Fashion', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200' },
];

export default function SellerProducts() {
  const [search, setSearch] = useState('');
  const [products] = useState(MOCK_PRODUCTS);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product listings</p>
        </div>
        <Button asChild>
          <Link href="/seller/products/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select className="px-3 py-2 border rounded-lg bg-background text-sm">
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="home">Home & Kitchen</option>
        </select>
        <select className="px-3 py-2 border rounded-lg bg-background text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative h-40 bg-muted">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
              <Badge
                className={`absolute top-2 right-2 ${
                  product.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                } text-white`}
              >
                {product.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/product/${product.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/seller/products/edit/${product.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-bold">₹{product.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{product.stock} in stock</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((1 - product.price / product.mrp) * 100)}% off
                  </p>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/seller/products/edit/${product.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
          <Button className="mt-4" asChild>
            <Link href="/seller/products/add">Add your first product</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
