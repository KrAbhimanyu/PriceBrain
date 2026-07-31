'use client';

import { useState, useEffect } from 'react';
import { Settings, Palette, Bell, ShoppingCart, Shield, Sparkles, Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/services/api';
import type { ApiResponse } from '@/types';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'kn' | 'ml';
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';
type AIServiceLevel = 'minimal' | 'balanced' | 'aggressive';

interface UserPreferences {
  id: string;
  userId: string;
  theme: Theme;
  language: Language;
  currency: Currency;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  priceAlerts: boolean;
  dealAlerts: boolean;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  favoriteCategories: string[];
  favoriteBrands: string[];
  shoppingInterests: string[];
  budgetLimit: number | null;
  profilePublic: boolean;
  showWishlistPublic: boolean;
  aiRecommendationLevel: AIServiceLevel;
  highContrast: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
}

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी (Hindi)' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'bn', label: 'বাংলা (Bengali)' },
  { value: 'mr', label: 'मराठी (Marathi)' },
  { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { value: 'ml', label: 'മലയാളം (Malayalam)' },
];

const CURRENCY_OPTIONS = [
  { value: 'INR', label: '₹ INR (Indian Rupee)' },
  { value: 'USD', label: '$ USD (US Dollar)' },
  { value: 'EUR', label: '€ EUR (Euro)' },
  { value: 'GBP', label: '£ GBP (British Pound)' },
];

const AI_LEVEL_OPTIONS = [
  { value: 'minimal', label: 'Minimal', description: 'Only essential recommendations' },
  { value: 'balanced', label: 'Balanced', description: 'Moderate personalization' },
  { value: 'aggressive', label: 'Aggressive', description: 'Maximum personalization' },
];

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'ai', label: 'AI Preferences', icon: Sparkles },
    { id: 'language', label: 'Language', icon: Globe },
  ];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<UserPreferences>>('/preferences');
      if (response.data?.data) {
        setPreferences(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: any) => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const response = await api.patch<ApiResponse<UserPreferences>>('/preferences', { [key]: value });
      if (response.data?.data) {
        setPreferences(response.data.data);
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-4 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 col-span-3" />
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Unable to load preferences</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your PriceBrain experience
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="col-span-1 h-fit">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="col-span-3 space-y-6">
          {/* Appearance */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    {THEME_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updatePreference('theme', option.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          preferences.theme === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Font Size</label>
                  <Select
                    value={preferences.fontSize || 'medium'}
                    onValueChange={(value) => updatePreference('fontSize', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">High Contrast</label>
                    <p className="text-xs text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch
                    checked={preferences.highContrast}
                    onCheckedChange={(checked) => updatePreference('highContrast', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Reduce Motion</label>
                    <p className="text-xs text-muted-foreground">Minimize animations</p>
                  </div>
                  <Switch
                    checked={preferences.reducedMotion}
                    onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Email Notifications</label>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Push Notifications</label>
                    <p className="text-xs text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">SMS Notifications</label>
                    <p className="text-xs text-muted-foreground">Text message alerts</p>
                  </div>
                  <Switch
                    checked={preferences.smsNotifications}
                    onCheckedChange={(checked) => updatePreference('smsNotifications', checked)}
                  />
                </div>

                <hr className="my-4" />

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Price Alerts</label>
                    <p className="text-xs text-muted-foreground">Get notified on price drops</p>
                  </div>
                  <Switch
                    checked={preferences.priceAlerts}
                    onCheckedChange={(checked) => updatePreference('priceAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Deal Alerts</label>
                    <p className="text-xs text-muted-foreground">Flash sales and special offers</p>
                  </div>
                  <Switch
                    checked={preferences.dealAlerts}
                    onCheckedChange={(checked) => updatePreference('dealAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Order Updates</label>
                    <p className="text-xs text-muted-foreground">Shipping and delivery updates</p>
                  </div>
                  <Switch
                    checked={preferences.orderUpdates}
                    onCheckedChange={(checked) => updatePreference('orderUpdates', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Language & Region */}
          {activeTab === 'language' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language & Region
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Language</label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => updatePreference('language', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Currency</label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) => updatePreference('currency', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shopping */}
          {activeTab === 'shopping' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Budget Limit (Monthly)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">₹</span>
                    <input
                      type="number"
                      value={preferences.budgetLimit || ''}
                      onChange={(e) => updatePreference('budgetLimit', parseInt(e.target.value) || null)}
                      placeholder="No limit"
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Set a monthly spending limit for alerts
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Favorite Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {['Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          const cats = preferences.favoriteCategories || [];
                          const newCats = cats.includes(cat)
                            ? cats.filter((c) => c !== cat)
                            : [...cats, cat];
                          updatePreference('favoriteCategories', newCats);
                        }}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          preferences.favoriteCategories?.includes(cat)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy */}
          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Public Profile</label>
                    <p className="text-xs text-muted-foreground">Allow others to view your profile</p>
                  </div>
                  <Switch
                    checked={preferences.profilePublic}
                    onCheckedChange={(checked) => updatePreference('profilePublic', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Public Wishlist</label>
                    <p className="text-xs text-muted-foreground">Share your wishlist publicly</p>
                  </div>
                  <Switch
                    checked={preferences.showWishlistPublic}
                    onCheckedChange={(checked) => updatePreference('showWishlistPublic', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Data Collection</label>
                    <p className="text-xs text-muted-foreground">Help us improve by sharing usage data</p>
                  </div>
                  <Switch
                    checked={preferences.aiRecommendationLevel !== 'minimal'}
                    onCheckedChange={(checked) => updatePreference('allowDataCollection', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Preferences */}
          {activeTab === 'ai' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Recommendation Level</label>
                  <div className="space-y-3">
                    {AI_LEVEL_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updatePreference('aiRecommendationLevel', option.value)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          preferences.aiRecommendationLevel === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Screen Reader Support</label>
                    <p className="text-xs text-muted-foreground">Optimize for assistive technologies</p>
                  </div>
                  <Switch
                    checked={preferences.screenReader}
                    onCheckedChange={(checked) => updatePreference('screenReader', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm">
          Saving...
        </div>
      )}
    </div>
  );
}
