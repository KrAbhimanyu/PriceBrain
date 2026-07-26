'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Bell, Sparkles, ShoppingCart, Package, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, X, Filter, Settings, Check, Eye,
  Zap, Lightbulb, Heart, Tag, Truck, User, Bot, Shield, Activity, Server,
  ChevronRight, Volume2, VolumeX, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import type { Notification } from '@/types';

// Mock Notifications
interface NotificationData {
  productId?: string;
  oldPrice?: number;
  newPrice?: number;
  dropPercent?: number;
  retailer?: string;
  saleEnd?: Date;
  discount?: number;
  originalProductId?: string;
  alternativeProductId?: string;
  savings?: number;
  lowestPrice?: boolean;
  category?: string;
  productCount?: number;
  confidence?: number;
}

const mockNotifications = [
  {
    id: '1',
    userId: 'user1',
    type: 'price_drop',
    title: 'Price Drop Alert!',
    message: 'iPhone 15 Pro dropped by 12% in the last hour. Down to ₹1,39,900 from ₹1,59,900',
    isRead: false,
    createdAt: new Date(Date.now() - 300000),
    data: { productId: '1', oldPrice: 159900, newPrice: 139900, dropPercent: 12 } as NotificationData,
  },
  {
    id: '2',
    userId: 'user1',
    type: 'wishlist_update',
    title: 'Wishlist Item Back in Stock',
    message: 'Samsung Galaxy S24 Ultra is now back in stock at Flipkart',
    isRead: false,
    createdAt: new Date(Date.now() - 900000),
    data: { productId: '2', retailer: 'Flipkart' } as NotificationData,
  },
  {
    id: '3',
    userId: 'user1',
    type: 'promotion',
    title: 'Flash Sale Starting Soon!',
    message: 'Amazon Great Indian Festival starts in 2 hours. Up to 80% off on electronics!',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000),
    data: { saleEnd: new Date(Date.now() + 86400000), discount: 80 } as NotificationData,
  },
  {
    id: '4',
    userId: 'user1',
    type: 'system',
    title: 'AI Found a Better Deal',
    message: 'We found a ₹2,000 cheaper alternative for the laptop you viewed. AI confidence: 95%',
    isRead: true,
    createdAt: new Date(Date.now() - 7200000),
    data: { originalProductId: '3', alternativeProductId: '4', savings: 2000 } as NotificationData,
  },
  {
    id: '5',
    userId: 'user1',
    type: 'price_drop',
    title: 'Price Alert: Sony Headphones',
    message: 'Sony WH-1000XM5 is now at its lowest price ever! ₹24,999 (was ₹29,990)',
    isRead: false,
    createdAt: new Date(Date.now() - 14400000),
    data: { productId: '5', lowestPrice: true } as NotificationData,
  },
  {
    id: '6',
    userId: 'user1',
    type: 'promotion',
    title: 'Personalized For You',
    message: 'Based on your browsing history, we think you will love these trending smartwatches',
    isRead: true,
    createdAt: new Date(Date.now() - 28800000),
    data: { category: 'smartwatches', productCount: 5 } as NotificationData,
  },
];

const mockAISuggestions = [
  { type: 'shopping', title: 'Better deal found', description: 'iPhone 14 is 15% cheaper than the one you viewed', action: 'View Now', savings: 15000 },
  { type: 'trending', title: 'Trending in your area', description: 'Gaming laptops are 20% off in Mumbai right now', action: 'Explore', productCount: 12 },
  { type: 'reminder', title: 'Price might drop soon', description: 'Historical data suggests prices will drop by 10% next week', action: 'Set Alert', confidence: 87 },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications as Array<{
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    data?: NotificationData;
  }>);
  const [filterType, setFilterType] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };
  
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  const getTimeAgo = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price_drop': return <TrendingDown className="h-5 w-5 text-green-500" />;
      case 'wishlist_update': return <Heart className="h-5 w-5 text-red-500" />;
      case 'promotion': return <Tag className="h-5 w-5 text-purple-500" />;
      case 'system': return <Bot className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const filteredNotifications = filterType === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filterType);
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Smart Notifications</h1>
                <p className="text-sm text-slate-500">AI-powered alerts & recommendations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="all" onValueChange={setFilterType}>
              <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="price_drop">Price Drops</TabsTrigger>
                <TabsTrigger value="wishlist_update">Wishlist</TabsTrigger>
                <TabsTrigger value="promotion">Deals</TabsTrigger>
                <TabsTrigger value="system">AI Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value={filterType}>
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`bg-white dark:bg-slate-900 transition-all ${
                        !notification.isRead ? 'border-l-4 border-l-purple-500 shadow-md' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            !notification.isRead ? 'bg-purple-100' : 'bg-slate-100 dark:bg-slate-800'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{notification.title}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {notification.message}
                                </p>
                                {notification.data && (
                                  <div className="flex gap-2 mt-2">
                                    {notification.data.savings && (
                                      <Badge className="bg-green-100 text-green-700">
                                        Save ₹{notification.data.savings.toLocaleString()}
                                      </Badge>
                                    )}
                                    {notification.data.dropPercent && (
                                      <Badge className="bg-green-100 text-green-700">
                                        -{notification.data.dropPercent}%
                                      </Badge>
                                    )}
                                    {notification.data.confidence && (
                                      <Badge variant="outline">
                                        AI: {notification.data.confidence}%
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-slate-500">
                                  {getTimeAgo(notification.createdAt)}
                                </span>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3">
                              {!notification.isRead ? (
                                <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)}>
                                  <Check className="h-4 w-4 mr-1" />
                                  Mark Read
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredNotifications.length === 0 && (
                    <Card className="bg-white dark:bg-slate-900">
                      <CardContent className="p-12 text-center">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                        <h3 className="text-lg font-medium mb-2">No notifications</h3>
                        <p className="text-slate-500">You are all caught up!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
              <CardHeader className="border-b border-purple-100">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAISuggestions.map((suggestion, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-purple-100">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        {suggestion.type === 'shopping' && <ShoppingCart className="h-4 w-4 text-purple-600" />}
                        {suggestion.type === 'trending' && <TrendingUp className="h-4 w-4 text-orange-600" />}
                        {suggestion.type === 'reminder' && <Clock className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{suggestion.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          {suggestion.savings && (
                            <span className="text-xs text-green-600 font-medium">
                              Save ₹{suggestion.savings.toLocaleString()}
                            </span>
                          )}
                          <Button size="sm" variant="ghost" className="text-purple-600">
                            {suggestion.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Notification Settings */}
            <Card className="bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-500" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-medium text-sm">Sound</p>
                      <p className="text-xs text-slate-500">Play sound for new notifications</p>
                    </div>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-medium text-sm">Push Notifications</p>
                      <p className="text-xs text-slate-500">Browser notifications</p>
                    </div>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-medium text-sm">Email Digest</p>
                      <p className="text-xs text-slate-500">Daily summary email</p>
                    </div>
                  </div>
                  <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
                </div>
              </CardContent>
            </Card>
            
            {/* Notification Stats */}
            <Card className="bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Notification Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">{unreadCount}</p>
                    <p className="text-xs text-slate-600">Unread</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
                    <p className="text-xs text-slate-600">Read</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {notifications.filter(n => n.type === 'price_drop').length}
                    </p>
                    <p className="text-xs text-slate-600">Price Alerts</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {notifications.filter(n => n.type === 'promotion').length}
                    </p>
                    <p className="text-xs text-slate-600">Deals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
