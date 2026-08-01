'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, ChevronDown, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OutfitCard } from '@/components/fashion/OutfitCard';
import { OutfitComparison } from '@/components/fashion/OutfitComparison';
import { getFashionRecommendations, fashionConversationService } from '@/services/fashionAI';
import type { FashionChatMessage, Outfit, FashionRecommendationResponse } from '@/types';

const QUICK_PROMPTS = [
  { label: 'Wedding Outfit', prompt: 'I need an outfit for a wedding', icon: '💒' },
  { label: 'Office Look', prompt: 'Suggest office appropriate outfits', icon: '💼' },
  { label: 'Casual Date', prompt: 'What should I wear for a casual date?', icon: '💑' },
  { label: 'Festival Ready', prompt: 'Suggest festive outfit ideas', icon: '🎉' },
  { label: 'Budget Friendly', prompt: 'Show me budget-friendly outfit options', icon: '💰' },
  { label: 'Premium Look', prompt: 'I want a premium outfit suggestion', icon: '✨' },
];

export default function AskBrainAIPage() {
  const [messages, setMessages] = useState<FashionChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<FashionRecommendationResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'best_selling' | 'budget_friendly' | 'mid_range'>('all');
  const [showComparison, setShowComparison] = useState(false);
  const [selectedOutfits, setSelectedOutfits] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize conversation
  useEffect(() => {
    const initialMessages = fashionConversationService.initializeConversation();
    setMessages(initialMessages);
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = fashionConversationService.addMessage('user', input);
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    try {
      // Get recommendations
      const context = fashionConversationService.getContext();
      const response = await getFashionRecommendations(
        currentInput,
        context as any
      );
      
      setRecommendations(response);
      
      // Update context with detected info
      fashionConversationService.updateContext(response.context);
      
      // Generate assistant message
      let assistantContent = '';
      if (response.missingInfo?.length) {
        assistantContent = `I'd love to help you find the perfect outfit! I noticed we could improve recommendations if you share:\n\n• ${response.missingInfo.join('\n• ')}\n\nBut no worries, I've already prepared some great options based on your request!`;
      } else {
        assistantContent = `I found ${response.totalCount} perfect outfit combinations for you! Each includes complete looks with tops, bottoms, footwear, accessories, and more.\n\nHere are your personalized recommendations organized into three categories:\n\n🎯 **Best Selling Looks** - Top-rated outfits loved by customers\n💰 **Budget Friendly** - Great style at accessible prices\n⚖️ **Mid Range** - Perfect balance of quality and value\n\nBrowse through the recommendations below!`;
      }
      
      const assistantMessage = fashionConversationService.addMessage('assistant', assistantContent, response.outfits);
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error getting recommendations:', error);
      const errorMessage = fashionConversationService.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };
  
  const handleRefresh = () => {
    if (input.trim()) {
      handleSend();
    }
  };
  
  const handleOutfitSelect = (outfitId: string) => {
    setSelectedOutfits(prev => {
      if (prev.includes(outfitId)) {
        return prev.filter(id => id !== outfitId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), outfitId];
      }
      return [...prev, outfitId];
    });
  };
  
  const filteredOutfits = recommendations?.outfits.filter(outfit => {
    if (selectedCategory === 'all') return true;
    return outfit.category === selectedCategory;
  }) || [];
  
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      all: 'All Outfits',
      best_selling: 'Best Sellers',
      budget_friendly: 'Budget Friendly',
      mid_range: 'Mid Range',
    };
    return labels[category] || category;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ask Brain AI
                </h1>
                <p className="text-sm text-muted-foreground">Your Personal Fashion Stylist</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chat Messages */}
            <Card className="border-purple-100 shadow-lg shadow-purple-100/50">
              <CardContent className="p-4">
                <div className="h-[400px] overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : message.role === 'system'
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-slate-700 border border-purple-100'
                            : 'bg-white border border-purple-100 shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-purple-100 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-purple-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Finding perfect outfits for you...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="flex items-center gap-2 pt-4 border-t border-purple-100">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe what you're looking for... (e.g., 'wedding outfit under 10k')"
                    className="flex-1 border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={!input.trim() || isLoading}
                    className="border-purple-200 hover:bg-purple-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <Card className="border-purple-100">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-purple-700">Try these prompts</h3>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <Button
                        key={prompt.label}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickPrompt(prompt.prompt)}
                        className="border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                      >
                        <span className="mr-1">{prompt.icon}</span>
                        {prompt.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Recommendations Sidebar */}
          <div className="space-y-4">
            {/* Category Tabs */}
            {recommendations && (
              <Card className="border-purple-100 shadow-lg shadow-purple-100/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-purple-700">Outfit Recommendations</h3>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {filteredOutfits.length} outfits
                    </Badge>
                  </div>
                  
                  <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
                    <TabsList className="w-full grid grid-cols-4 bg-purple-50">
                      <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                      <TabsTrigger value="best_selling" className="text-xs">Best</TabsTrigger>
                      <TabsTrigger value="budget_friendly" className="text-xs">Budget</TabsTrigger>
                      <TabsTrigger value="mid_range" className="text-xs">Mid</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  {selectedOutfits.length >= 2 && (
                    <Button
                      variant="outline"
                      className="w-full mt-3 border-purple-300 bg-purple-50 hover:bg-purple-100"
                      onClick={() => setShowComparison(true)}
                    >
                      Compare Selected ({selectedOutfits.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Outfit List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredOutfits.map((outfit) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  isSelected={selectedOutfits.includes(outfit.id)}
                  onSelect={() => handleOutfitSelect(outfit.id)}
                />
              ))}
              
              {!recommendations && (
                <Card className="border-dashed border-2 border-purple-200 bg-purple-50/50">
                  <CardContent className="p-8 text-center">
                    <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                    <h3 className="font-medium text-purple-700 mb-2">Your Outfits Will Appear Here</h3>
                    <p className="text-sm text-muted-foreground">
                      Tell me what you are looking for and I will find perfect outfit combinations!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Comparison Modal */}
      {showComparison && selectedOutfits.length >= 2 && recommendations && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-purple-100">
              <h2 className="text-xl font-bold text-purple-700">Outfit Comparison</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowComparison(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <OutfitComparison
                outfits={recommendations.outfits.filter(o => selectedOutfits.includes(o.id))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
