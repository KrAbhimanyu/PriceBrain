'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import {
  Sparkles, MessageSquare, Search, Mic, Eye, History, Brain,
  CheckSquare, Wand2, ShoppingBag, Briefcase, Settings, Zap,
  ChevronLeft, ChevronRight, Plus, Pin, Archive, Folder,
  Clock, TrendingUp, Percent, Timer, DollarSign, Heart,
  Star, BarChart3, Activity, Bell, X, MoreVertical,
  Send, Paperclip, RefreshCw, Volume2, Camera, Moon, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { RootState } from '@/store';
import type { 
  AICommand, AIConversation, AITask, AIMemory, PriceDropItem,
  TrendingProduct, AIDeal, FlashSale, BudgetProgress, WishlistIntelligence
} from '@/types';

const COMMAND_NAVIGATION: Array<{ id: AICommand; label: string; icon: string; badge?: number }> = [
  { id: 'ask_brain', label: 'Ask Brain AI', icon: 'Sparkles', badge: 0 },
  { id: 'ai_chat', label: 'AI Chat', icon: 'MessageSquare', badge: 3 },
  { id: 'ai_search', label: 'AI Search', icon: 'Search' },
  { id: 'ai_voice', label: 'AI Voice', icon: 'Mic' },
  { id: 'ai_vision', label: 'AI Vision', icon: 'Eye' },
  { id: 'ai_history', label: 'AI History', icon: 'History' },
  { id: 'ai_memory', label: 'AI Memory', icon: 'Brain' },
  { id: 'ai_tasks', label: 'AI Tasks', icon: 'CheckSquare', badge: 2 },
  { id: 'ai_recommendations', label: 'AI Recommendations', icon: 'Wand2' },
  { id: 'ai_shopping', label: 'AI Shopping', icon: 'ShoppingBag' },
  { id: 'ai_business', label: 'AI Business', icon: 'Briefcase' },
  { id: 'ai_settings', label: 'AI Settings', icon: 'Settings' },
];

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, MessageSquare, Search, Mic, Eye, History, Brain,
  CheckSquare, Wand2, ShoppingBag, Briefcase, Settings, Plus,
  Pin, Archive, Folder, Clock, TrendingUp, Percent, Timer,
  DollarSign, Heart, Star, BarChart3, Activity, Bell, X,
  Send, Paperclip, RefreshCw, Volume2, Camera, Moon, Sun,
};

// Mock data
const mockPriceDrops: PriceDropItem[] = [
  { productId: '1', productName: 'iPhone 15 Pro Max', productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100', previousPrice: 159900, currentPrice: 139900, dropPercentage: 12.5, retailer: 'Amazon', aiRecommendation: 'buy_now', confidenceScore: 92 },
  { productId: '2', productName: 'Samsung 65" OLED TV', productImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100', previousPrice: 189999, currentPrice: 159999, dropPercentage: 15.8, retailer: 'Flipkart', aiRecommendation: 'buy_now', confidenceScore: 88 },
  { productId: '3', productName: 'MacBook Air M3', productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100', previousPrice: 134900, currentPrice: 124900, dropPercentage: 7.4, retailer: 'Amazon', aiRecommendation: 'watch', confidenceScore: 75 },
];

const mockTrendingProducts: TrendingProduct[] = [
  { productId: '1', productName: 'Noise ColorFit Pro 5', productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100', price: 3499, originalPrice: 5999, discount: 42, viewCount: 45890, purchaseCount: 2341, aiTrendScore: 95, category: 'Wearables', isViral: true },
  { productId: '2', productName: 'boAt Rockerz 450', productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100', price: 1299, originalPrice: 2990, discount: 57, viewCount: 32450, purchaseCount: 1876, aiTrendScore: 89, category: 'Audio', isViral: true },
  { productId: '3', productName: 'Fire-Boltt Phoenix', productImage: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100', price: 2499, originalPrice: 7999, discount: 69, viewCount: 28900, purchaseCount: 1456, aiTrendScore: 85, category: 'Wearables', isViral: false },
];

const mockAIDeals: AIDeal[] = [
  { id: '1', title: 'Laptop Combo Deal', description: 'Laptop + Bag + Mouse + Headphones', discount: 35, originalPrice: 125000, currentPrice: 81250, expiresAt: new Date(Date.now() + 86400000 * 2), productId: '1', productImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100', retailer: 'Amazon', dealType: 'bundle', aiSavingsScore: 94 },
  { id: '2', title: 'Home Theater System', description: '5.1 Channel Soundbar with Subwoofer', discount: 45, originalPrice: 45000, currentPrice: 24750, expiresAt: new Date(Date.now() + 86400000 * 5), productId: '2', productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', retailer: 'Flipkart', dealType: 'ai_savings', aiSavingsScore: 91 },
];

const mockFlashSales: FlashSale[] = [
  { id: '1', title: 'Premium Headphones', discount: 60, originalPrice: 12999, salePrice: 5199, endsAt: new Date(Date.now() + 3600000 * 2), stockRemaining: 23, totalStock: 100, productId: '1', productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100', retailer: 'Amazon', aiUrgencyScore: 97 },
  { id: '2', title: 'Smart Watch Pro', discount: 50, originalPrice: 8999, salePrice: 4499, endsAt: new Date(Date.now() + 3600000 * 4), stockRemaining: 45, totalStock: 200, productId: '2', productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100', retailer: 'Flipkart', aiUrgencyScore: 88 },
];

const mockBudget: BudgetProgress = {
  monthlyBudget: 50000,
  spent: 32450,
  remaining: 17550,
  savingsGoal: 10000,
  currentSavings: 6500,
  forecastedSpend: 48500,
  categoryBreakdown: { Electronics: 15000, Clothing: 8000, Home: 6000, Other: 3450 },
  aiSuggestions: ['You are on track for your savings goal!', 'Consider waiting for the electronics sale next week'],
};

const mockTasks: AITask[] = [
  { id: '1', title: 'Monitor iPhone 15 Price', description: 'Alert when price drops below 130000', status: 'running', progress: 65, createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(), agentsWorking: ['Price Monitor', 'Market Scanner'] },
  { id: '2', title: 'Find Best Laptop under 70000', description: 'Research and compare laptops', status: 'completed', progress: 100, createdAt: new Date(Date.now() - 172800000), updatedAt: new Date(), finalReport: 'Found 5 laptops matching criteria', result: {} },
  { id: '3', title: 'Compare Competitor Prices', description: 'Track competitor pricing for electronics', status: 'pending', progress: 0, createdAt: new Date(), updatedAt: new Date(), estimatedCompletion: new Date(Date.now() + 86400000 * 3) },
];

const mockConversations: AIConversation[] = [
  { id: '1', title: 'Best laptops for gaming under 80k', messages: [], createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(), isPinned: true, isArchived: false, tags: ['electronics', 'gaming'] },
  { id: '2', title: 'Wedding outfit recommendations', messages: [], createdAt: new Date(Date.now() - 172800000), updatedAt: new Date(Date.now() - 86400000), isPinned: false, isArchived: false, tags: ['fashion'] },
  { id: '3', title: 'Compare iPhone vs Samsung flagships', messages: [], createdAt: new Date(Date.now() - 604800000), updatedAt: new Date(Date.now() - 604800000), isPinned: false, isArchived: true, tags: ['comparison'] },
];

const mockMemory: AIMemory[] = [
  { id: '1', key: 'Preferred Brands', value: 'Apple, Samsung, Sony', category: 'brands', confidence: 95, lastUpdated: new Date(), source: 'learned' },
  { id: '2', key: 'Budget Range', value: '50,000 - 100,000', category: 'budget', confidence: 90, lastUpdated: new Date(), source: 'explicit' },
  { id: '3', key: 'Shopping Category', value: 'Electronics, Fashion', category: 'shopping', confidence: 88, lastUpdated: new Date(), source: 'learned' },
];

export default function AICommandCenterPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [widgetsCollapsed, setWidgetsCollapsed] = useState(false);
  const [activeCommand, setActiveCommand] = useState<AICommand>('ask_brain');
  const [chatInput, setChatInput] = useState('');
  const [conversations, setConversations] = useState(mockConversations);
  const [tasks, setTasks] = useState(mockTasks);
  const [memories, setMemories] = useState(mockMemory);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role || 'buyer';
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatTimeRemaining = (date: Date) => {
    const diff = new Date(date).getTime() - Date.now();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  const getStatusColor = (status: AITask['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'buy_now': return { label: 'Buy Now', color: 'bg-green-500 text-white' };
      case 'wait': return { label: 'Wait', color: 'bg-yellow-500 text-white' };
      case 'watch': return { label: 'Watch', color: 'bg-blue-500 text-white' };
      default: return { label: 'Unknown', color: 'bg-gray-500 text-white' };
    }
  };
  
  const getCommandIcon = (iconName: string) => {
    const Icon = IconMap[iconName] || Sparkles;
    return <Icon className="h-5 w-5" />;
  };
  
  const renderMainContent = () => {
    switch (activeCommand) {
      case 'ask_brain':
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                Ask Brain AI
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your personal AI shopping assistant and fashion stylist
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-2">Hello! I am Brain AI</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    I can help you with:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Find the best products',
                      'Compare prices',
                      'Style outfits',
                      'Plan your budget',
                      'Track price drops',
                      'Get personalized recommendations',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-purple-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Try asking me:</h4>
                  {[
                    'I need a wedding outfit under 15000',
                    'What is the best laptop for coding?',
                    'Compare iPhone 15 vs Samsung S24',
                    'Help me find gifts for my parents',
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setChatInput(prompt)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1"
                />
                <Button size="icon" variant="ghost">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Camera className="h-5 w-5" />
                </Button>
                <Button size="icon">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'ai_chat':
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                    AI Chat
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your persistent AI conversation history
                  </p>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Chat
                </Button>
              </div>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Conversation List */}
              <div className={`w-64 border-r border-border p-3 space-y-2 overflow-y-auto ${showConversationList ? '' : 'hidden md:block'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Button variant="ghost" size="sm" className="flex-1 justify-start">
                    <Folder className="h-4 w-4 mr-2" />
                    All Chats
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Pin className="h-4 w-4" />
                  </Button>
                </div>
                
                {conversations.filter(c => !c.isArchived).map((conversation) => (
                  <button
                    key={conversation.id}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{conversation.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        {conversation.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {conversation.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
                
                <div className="pt-2 mt-2 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                    <Archive className="h-4 w-4 mr-2" />
                    Archived ({conversations.filter(c => c.isArchived).length})
                  </Button>
                </div>
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a conversation or start a new one</p>
                  </div>
                </div>
                
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Type a message..." className="flex-1" />
                    <Button size="icon"><Send className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'ai_tasks':
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <CheckSquare className="h-6 w-6 text-green-500" />
                    AI Tasks
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Long-running AI tasks and automations
                  </p>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Task
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      
                      {task.status === 'running' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                          {task.agentsWorking && (
                            <div className="flex gap-2 mt-2">
                              {task.agentsWorking.map((agent, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  <Activity className="h-3 w-3 mr-1" />
                                  {agent}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                        {task.estimatedCompletion && (
                          <span>ETA: {formatTimeRemaining(task.estimatedCompletion)}</span>
                        )}
                      </div>
                      
                      {task.finalReport && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <CheckSquare className="h-4 w-4 inline mr-1" />
                            {task.finalReport}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'ai_memory':
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-500" />
                    AI Memory
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your AI-learned preferences and context
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Memory
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {memories.map((memory) => (
                  <Card key={memory.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{memory.key}</h3>
                            <Badge variant="outline" className="text-xs">{memory.category}</Badge>
                            <Badge variant={memory.source === 'explicit' ? 'default' : 'secondary'} className="text-xs">
                              {memory.source}
                            </Badge>
                          </div>
                          <p className="text-sm mt-2">{memory.value}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>Confidence: {memory.confidence}%</span>
                            <span>Updated: {new Date(memory.lastUpdated).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">{COMMAND_NAVIGATION.find(c => c.id === activeCommand)?.label}</h3>
              <p className="text-sm mt-2">This feature is coming soon</p>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex-1 bg-background">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Command Center
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden md:flex">
                <Activity className="h-3 w-3 mr-1" />
                AI Active
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Left Sidebar - Navigation */}
          <aside className={`border-r border-border bg-background transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto py-3">
                {COMMAND_NAVIGATION.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveCommand(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative group ${
                      activeCommand === item.id
                        ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-500'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    {getCommandIcon(item.icon)}
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="p-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
                </Button>
              </div>
            </div>
          </aside>
          
          {/* Main Workspace */}
          <main className="flex-1 overflow-hidden">
            {renderMainContent()}
          </main>
          
          {/* Right Sidebar - Widgets */}
          <aside className={`border-l border-border bg-background transition-all duration-300 ${widgetsCollapsed ? 'w-16' : 'w-80'}`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-3 border-b border-border">
                {!widgetsCollapsed && <span className="text-sm font-medium">AI Widgets</span>}
                <Button
                  variant="ghost"
                  size="sm"
                  className={widgetsCollapsed ? 'mx-auto' : ''}
                  onClick={() => setWidgetsCollapsed(!widgetsCollapsed)}
                >
                  {widgetsCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {!widgetsCollapsed && (
                  <>
                    {/* Price Drop Widget */}
                    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          Price Drops
                          <Badge className="ml-auto bg-purple-600 text-white text-xs">LIVE</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {mockPriceDrops.map((item) => {
                          const badge = getRecommendationBadge(item.aiRecommendation);
                          return (
                            <div key={item.productId} className="flex gap-2">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0">
                                <Image src={item.productImage} alt={item.productName} width={48} height={48} className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.productName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-bold text-green-600">-{item.dropPercentage}%</span>
                                  <Badge className={`${badge.color} text-xs`}>{badge.label}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{formatCurrency(item.currentPrice)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                    
                    {/* Trending Products Widget */}
                    <Card className="border-orange-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Star className="h-4 w-4 text-orange-500" />
                          Trending Now
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {mockTrendingProducts.slice(0, 3).map((item) => (
                          <div key={item.productId} className="flex gap-2">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                              <Image src={item.productImage} alt={item.productName} width={48} height={48} className="object-cover" />
                              {item.isViral && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">🔥</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.productName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold">{formatCurrency(item.price)}</span>
                                <span className="text-xs text-muted-foreground line-through">{formatCurrency(item.originalPrice)}</span>
                              </div>
                              <Progress value={item.aiTrendScore} className="h-1 mt-1" />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    {/* AI Deals Widget */}
                    <Card className="border-green-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Percent className="h-4 w-4 text-green-600" />
                          AI Savings Deals
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {mockAIDeals.map((deal) => (
                          <div key={deal.id} className="p-2 bg-green-50 rounded-lg">
                            <div className="flex gap-2">
                              <div className="w-10 h-10 rounded bg-white overflow-hidden flex-shrink-0">
                                <Image src={deal.productImage} alt={deal.title} width={40} height={40} className="object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{deal.title}</p>
                                <p className="text-xs text-muted-foreground">{deal.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="bg-green-500 text-white text-xs">{deal.discount}% OFF</Badge>
                                  <span className="text-xs text-green-600 font-medium">{formatCurrency(deal.currentPrice)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    {/* Flash Sale Widget */}
                    <Card className="border-red-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Timer className="h-4 w-4 text-red-500" />
                          Flash Sales
                          <Badge className="ml-auto bg-red-500 text-white text-xs">HOT</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {mockFlashSales.map((sale) => (
                          <div key={sale.id} className="p-2 bg-red-50 rounded-lg">
                            <div className="flex gap-2">
                              <div className="w-10 h-10 rounded bg-white overflow-hidden flex-shrink-0">
                                <Image src={sale.productImage} alt={sale.title} width={40} height={40} className="object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{sale.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="destructive" className="text-xs">{sale.discount}% OFF</Badge>
                                  <span className="text-xs text-red-600 font-medium">
                                    <Timer className="h-3 w-3 inline mr-1" />
                                    {formatTimeRemaining(sale.endsAt)}
                                  </span>
                                </div>
                                <div className="mt-1">
                                  <Progress value={(sale.stockRemaining / sale.totalStock) * 100} className="h-1" />
                                  <p className="text-xs text-muted-foreground mt-1">{sale.stockRemaining} left</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    {/* Budget Progress Widget */}
                    {userRole === 'buyer' && (
                      <Card className="border-blue-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            Budget Progress
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Spent</span>
                              <span className="font-medium">{formatCurrency(mockBudget.spent)} / {formatCurrency(mockBudget.monthlyBudget)}</span>
                            </div>
                            <Progress value={(mockBudget.spent / mockBudget.monthlyBudget) * 100} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Remaining: {formatCurrency(mockBudget.remaining)}</span>
                              <span>Goal: {formatCurrency(mockBudget.savingsGoal)} ({formatCurrency(mockBudget.currentSavings)} saved)</span>
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-800">
                              <Zap className="h-3 w-3 inline mr-1" />
                              {mockBudget.aiSuggestions[0]}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Seller Analytics Widget */}
                    {userRole === 'seller' && (
                      <Card className="border-indigo-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-indigo-600" />
                            Today&apos;s Performance
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-indigo-50 rounded-lg text-center">
                              <p className="text-lg font-bold text-indigo-700">₹45,230</p>
                              <p className="text-xs text-muted-foreground">Revenue</p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg text-center">
                              <p className="text-lg font-bold text-indigo-700">23</p>
                              <p className="text-xs text-muted-foreground">Orders</p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg text-center">
                              <p className="text-lg font-bold text-indigo-700">4.6</p>
                              <p className="text-xs text-muted-foreground">Rating</p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg text-center">
                              <p className="text-lg font-bold text-indigo-700">8</p>
                              <p className="text-xs text-muted-foreground">Low Stock</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* AI Recommendations Widget */}
                    <Card className="border-amber-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Wand2 className="h-4 w-4 text-amber-500" />
                          AI Curated
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[
                          'Premium headphones under 3000',
                          'Smart home devices on sale',
                          'Trending summer fashion',
                        ].map((rec, i) => (
                          <button key={i} className="w-full text-left p-2 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors">
                            <p className="text-sm font-medium">{rec}</p>
                            <p className="text-xs text-muted-foreground mt-1">View products</p>
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}
                
                {widgetsCollapsed && (
                  <div className="space-y-3">
                    <Button variant="ghost" size="icon" className="w-full h-12">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-full h-12">
                      <Star className="h-5 w-5 text-orange-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-full h-12">
                      <Percent className="h-5 w-5 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-full h-12">
                      <Timer className="h-5 w-5 text-red-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-full h-12">
                      <Wand2 className="h-5 w-5 text-amber-500" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
