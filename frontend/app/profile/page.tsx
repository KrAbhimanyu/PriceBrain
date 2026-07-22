'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  User, Mail, Bell, Shield, CreditCard, Heart, 
  ShoppingBag, History, LogOut, Settings, Eye, Trash2, 
  BellOff, BellRing, TrendingDown
} from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const notifications = [
  { id: '1', title: 'Price Drop Alert!', message: 'iPhone 15 Pro price dropped from ₹129,900 to ₹119,900', time: '2 hours ago', read: false, type: 'price_drop' },
  { id: '2', title: 'Wishlist Item Back in Stock', message: 'Sony WH-1000XM5 is now available at ₹24,990', time: '5 hours ago', read: false, type: 'back_in_stock' },
  { id: '3', title: 'New Coupon Available', message: 'Amazon has a new 20% off coupon for electronics', time: '1 day ago', read: true, type: 'coupon' },
  { id: '4', title: 'Price Target Reached!', message: 'MacBook Air M2 has reached your target price of ₹84,990', time: '2 days ago', read: true, type: 'price_alert' },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notificationSettings, setNotificationSettings] = useState({
    priceDrops: true,
    backInStock: true,
    newCoupons: true,
    emailNotifications: true,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price_drop': return <TrendingDown className="w-5 h-5 text-green-600" />;
      case 'back_in_stock': return <BellRing className="w-5 h-5 text-purple-600" />;
      case 'coupon': return <CreditCard className="w-5 h-5 text-yellow-600" />;
      default: return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'price_drop': return 'bg-green-100';
      case 'back_in_stock': return 'bg-purple-100';
      case 'coupon': return 'bg-yellow-100';
      default: return 'bg-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">JD</div>
                <div>
                  <p className="font-semibold text-slate-900">John Doe</p>
                  <p className="text-sm text-slate-500">john@example.com</p>
                </div>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <tab.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {tab.id === 'notifications' && unreadCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">{unreadCount}</span>
                    )}
                  </button>
                ))}
              </nav>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg mt-4 transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </aside>

          <main className="flex-1">
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-slate-500 mt-1">{unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}</p>
                  </div>
                  {unreadCount > 0 && <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Mark all as read</button>}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="font-semibold text-slate-900 mb-4">Notification Preferences</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <p className="font-medium text-slate-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <button onClick={() => setNotificationSettings(p => ({...p, [key]: !value}))}
                          className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-slate-300'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getNotificationBg(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900">{notification.title}</h3>
                          {!notification.read && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                        </div>
                        <p className="text-sm text-slate-600 mt-0.5">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button className="p-2 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4 text-slate-400" /></button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg"><Trash2 className="w-4 h-4 text-slate-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Information</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                      <input type="text" defaultValue="John" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                      <input type="text" defaultValue="Doe" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input type="email" defaultValue="john@example.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                    <input type="tel" defaultValue="+91 98765 43210" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save Changes</button>
                </form>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Shield className="w-8 h-8 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">Change Password</p>
                        <p className="text-sm text-slate-500">Update your password regularly</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Change</button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <History className="w-8 h-8 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">Search History</p>
                        <p className="text-sm text-slate-500">Manage your search history</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Clear</button>
                  </div>
                </div>
              </div>
            )}

            {['wishlist', 'orders'].includes(activeTab) && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'wishlist' ? <Heart className="w-8 h-8 text-slate-400" /> : <ShoppingBag className="w-8 h-8 text-slate-400" />}
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2 capitalize">{activeTab}</h3>
                <Link href={activeTab === 'wishlist' ? '/wishlist' : '/orders'} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Go to {activeTab}
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
