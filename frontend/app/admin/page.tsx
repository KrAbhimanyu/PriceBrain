'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Package, Users, ShoppingBag, Tag, Bell, 
  Settings, BarChart3, TrendingUp, TrendingDown, Eye, Edit, 
  Trash2, Plus, Search, Filter, FileText 
} from 'lucide-react';

const stats = [
  { label: 'Total Products', value: '12,456', change: '+12%', trend: 'up', icon: Package },
  { label: 'Active Users', value: '8,234', change: '+8%', trend: 'up', icon: Users },
  { label: 'Total Retailers', value: '24', change: '0%', trend: 'neutral', icon: ShoppingBag },
  { label: 'Commission Earned', value: '₹1,45,678', change: '+23%', trend: 'up', icon: TrendingUp },
];

const recentProducts = [
  { id: '1', name: 'iPhone 15 Pro Max', brand: 'Apple', price: 119900, status: 'active', views: 1245 },
  { id: '2', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 109999, status: 'active', views: 987 },
  { id: '3', name: 'MacBook Pro M3', brand: 'Apple', price: 169900, status: 'pending', views: 756 },
  { id: '4', name: 'Sony WH-1000XM5', brand: 'Sony', price: 24990, status: 'active', views: 543 },
];

const topProducts = [
  { name: 'iPhone 15 Pro', clicks: 4521, conversions: 234, revenue: 28742 },
  { name: 'OnePlus 12', clicks: 3892, conversions: 198, revenue: 21354 },
  { name: 'Samsung TV', clicks: 3211, conversions: 167, revenue: 18923 },
  { name: 'Noise Headphones', clicks: 2890, conversions: 145, revenue: 12345 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'retailers', label: 'Retailers', icon: ShoppingBag },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0">
          <div className="p-6 border-b border-slate-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="font-bold text-slate-900">PriceBrain</span>
            </Link>
            <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
          </div>
          
          <nav className="p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {tabs.find((t) => t.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-slate-500 mt-1">
                {activeTab === 'dashboard' && 'Overview of your platform'}
                {activeTab === 'products' && 'Manage your product catalog'}
                {activeTab === 'users' && 'View and manage users'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">A</span>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-slate-600" />
                      </div>
                      <span className={`flex items-center gap-1 text-sm ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                         stat.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Products */}
                <div className="bg-white rounded-xl border border-slate-200">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">Recent Products</h2>
                    <Link href="/admin/products" className="text-sm text-blue-600 hover:text-blue-700">
                      View All
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {recentProducts.map((product) => (
                      <div key={product.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg" />
                          <div>
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <p className="text-sm text-slate-500">{product.brand}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">₹{product.price.toLocaleString()}</p>
                          <p className="text-sm text-slate-500">{product.views} views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Performing */}
                <div className="bg-white rounded-xl border border-slate-200">
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-900">Top Performing Products</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.name} className="flex items-center gap-4">
                        <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-500">{product.clicks} clicks</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">₹{product.revenue.toLocaleString()}</p>
                          <p className="text-sm text-slate-500">{product.conversions} conversions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Add Product</span>
                  </button>
                  <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Generate Report</span>
                  </button>
                  <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Tag className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Add Coupon</span>
                  </button>
                  <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Bell className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium">Send Notification</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <Filter className="w-4 h-4" />
                      Filters
                    </button>
                  </div>
                  <select className="px-4 py-2 border border-slate-200 rounded-lg">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Brand</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Views</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {recentProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded" />
                              <span className="font-medium text-slate-900">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{product.brand}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">₹{product.price.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.status === 'active' ? 'bg-green-100 text-green-700' : 
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{product.views}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-2 hover:bg-slate-100 rounded-lg">
                                <Eye className="w-4 h-4 text-slate-600" />
                              </button>
                              <button className="p-2 hover:bg-slate-100 rounded-lg">
                                <Edit className="w-4 h-4 text-slate-600" />
                              </button>
                              <button className="p-2 hover:bg-slate-100 rounded-lg">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {['users', 'retailers', 'coupons', 'analytics', 'notifications', 'settings'].includes(activeTab) && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {(() => {
                  const tab = tabs.find((t) => t.id === activeTab);
                  const Icon = tab?.icon;
                  return Icon ? <Icon className="w-8 h-8 text-slate-400" /> : null;
                })()}
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {tabs.find((t) => t.id === activeTab)?.label} Management
              </h3>
              <p className="text-slate-500 mb-4">This section is under development</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
