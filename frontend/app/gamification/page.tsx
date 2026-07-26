'use client';

import { useState } from 'react';
import {
  Trophy, Medal, Award, Star, Zap, Gift, ChevronRight, Flame, Target,
  TrendingUp, Clock, CheckCircle, Lock, Sparkles, Crown, Shield, Rocket,
  Users, ShoppingBag, BarChart3, Bot, TrendingDown, Calendar, Bell, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Mock Data
const mockBadges = [
  { id: '1', name: 'Smart Shopper', description: 'Complete 50 product comparisons', icon: Target, rarity: 'common', progress: 35, maxProgress: 50, isUnlocked: false, color: 'blue' },
  { id: '2', name: 'Bargain Hunter', description: 'Save 10,000 through deals', icon: TrendingDown, rarity: 'rare', progress: 7500, maxProgress: 10000, isUnlocked: false, color: 'green' },
  { id: '3', name: 'AI Explorer', description: 'Use Ask Brain AI 100 times', icon: Bot, rarity: 'epic', progress: 100, maxProgress: 100, isUnlocked: true, color: 'purple' },
  { id: '4', name: 'Fashion Expert', description: 'Buy 20 fashion items', icon: Sparkles, rarity: 'uncommon', progress: 20, maxProgress: 20, isUnlocked: true, color: 'pink' },
  { id: '5', name: 'Gadget Guru', description: 'Purchase 10 electronics', icon: Trophy, rarity: 'rare', progress: 7, maxProgress: 10, isUnlocked: false, color: 'cyan' },
  { id: '6', name: 'Early Adopter', description: 'Join during beta', icon: Rocket, rarity: 'legendary', progress: 1, maxProgress: 1, isUnlocked: true, color: 'yellow' },
  { id: '7', name: 'Loyalty Champion', description: 'Shop for 30 consecutive days', icon: Crown, rarity: 'epic', progress: 45, maxProgress: 30, isUnlocked: true, color: 'orange' },
  { id: '8', name: 'Review Master', description: 'Write 50 reviews', icon: Star, rarity: 'rare', progress: 28, maxProgress: 50, isUnlocked: false, color: 'amber' },
];

const mockStreaks = [
  { type: 'Daily Login', current: 12, longest: 45, reward: 120, icon: Flame, color: 'orange' },
  { type: 'AI Searches', current: 8, longest: 30, reward: 80, icon: Bot, color: 'purple' },
  { type: 'Comparisons', current: 5, longest: 20, reward: 50, icon: BarChart3, color: 'blue' },
  { type: 'Purchases', current: 3, longest: 15, reward: 150, icon: ShoppingBag, color: 'green' },
];

const mockChallenges = [
  { id: '1', title: 'AI Shopping Spree', description: 'Complete 10 AI-powered searches', progress: 7, target: 10, rewards: 500, daysLeft: 3, isAI: true },
  { id: '2', title: 'Save Big', description: 'Save 5000 on your purchases this month', progress: 3200, target: 5000, rewards: 1000, daysLeft: 12, isAI: true },
  { id: '3', title: 'Review Champion', description: 'Write 5 product reviews', progress: 3, target: 5, rewards: 300, daysLeft: 7, isAI: false },
  { id: '4', title: 'Comparison Expert', description: 'Compare 20 products', progress: 15, target: 20, rewards: 400, daysLeft: 5, isAI: false },
];

const mockWallet = {
  points: 12500,
  cashback: 2340,
  aiCredits: 500,
  coupons: [
    { code: 'SAVE20', discount: 20, expires: '2024-12-31' },
    { code: 'FIRST50', discount: 50, expires: '2024-11-30' },
    { code: 'AISPECIAL', discount: 15, expires: '2024-12-15' },
  ],
};

const mockLeaderboard = [
  { rank: 1, name: 'Rahul S.', points: 45600, avatar: 'R', badge: '🏆' },
  { rank: 2, name: 'Priya M.', points: 42300, avatar: 'P', badge: '🥈' },
  { rank: 3, name: 'Amit K.', points: 38900, avatar: 'A', badge: '🥉' },
  { rank: 4, name: 'You', points: 12500, avatar: 'Y', badge: '⭐', isCurrentUser: true },
  { rank: 5, name: 'Sneha G.', points: 11200, avatar: 'S', badge: '⭐' },
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'text-slate-600 bg-slate-100 border-slate-200';
    case 'uncommon': return 'text-green-600 bg-green-100 border-green-200';
    case 'rare': return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'epic': return 'text-purple-600 bg-purple-100 border-purple-200';
    case 'legendary': return 'text-amber-500 bg-amber-100 border-amber-200';
    default: return 'text-slate-600 bg-slate-100';
  }
};

const getRarityGlow = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'shadow-amber-500/50';
    case 'epic': return 'shadow-purple-500/50';
    case 'rare': return 'shadow-blue-500/50';
    default: return '';
  }
};

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState('badges');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  
  const unlockedBadges = mockBadges.filter(b => b.isUnlocked);
  const lockedBadges = mockBadges.filter(b => !b.isUnlocked);
  const totalProgress = unlockedBadges.length / mockBadges.length * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 dark:border-purple-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  PriceBrain Rewards
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Your journey to rewards starts here</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 text-lg">
                <Star className="h-5 w-5 mr-2" />
                {mockWallet.points.toLocaleString()} Points
              </Badge>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur border-purple-100">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-100 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{unlockedBadges.length}</p>
              <p className="text-sm text-slate-600">Badges Earned</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur border-purple-100">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">12</p>
              <p className="text-sm text-slate-600">Day Streak</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur border-purple-100">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">₹{mockWallet.cashback.toLocaleString()}</p>
              <p className="text-sm text-slate-600">Cashback</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur border-purple-100">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{mockWallet.aiCredits}</p>
              <p className="text-sm text-slate-600">AI Credits</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Progress Overview */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Journey Progress</h3>
                <p className="text-white/80">Unlock more rewards as you explore</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{Math.round(totalProgress)}%</p>
                <p className="text-sm text-white/80">{unlockedBadges.length}/{mockBadges.length} Badges</p>
              </div>
            </div>
            <Progress value={totalProgress} className="h-3 bg-white/30 [&>div]:bg-white" />
          </CardContent>
        </Card>
        
        <Tabs defaultValue="badges" onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 backdrop-blur border border-purple-100 mb-6">
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          
          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            {/* Unlocked Badges */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Your Badges ({unlockedBadges.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {unlockedBadges.map((badge) => (
                  <Card 
                    key={badge.id} 
                    className={cn(
                      'bg-white/80 backdrop-blur border-2 hover:scale-105 transition-all cursor-pointer',
                      getRarityColor(badge.rarity),
                      getRarityGlow(badge.rarity)
                    )}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={cn(
                        'w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center',
                        `bg-${badge.color}-100`
                      )}>
                        <badge.icon className={cn('h-8 w-8', `text-${badge.color}-600`)} />
                      </div>
                      <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                      <Badge variant="outline" className="text-xs capitalize">{badge.rarity}</Badge>
                      <p className="text-xs text-slate-500 mt-2">{badge.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Locked Badges */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-slate-400" />
                Badges to Unlock ({lockedBadges.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lockedBadges.map((badge) => (
                  <Card 
                    key={badge.id} 
                    className="bg-white/50 backdrop-blur border-slate-200 opacity-75 hover:opacity-100 transition-all cursor-pointer"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center relative">
                        <Lock className="h-6 w-6 text-slate-400" />
                        <div className="absolute inset-0 bg-slate-200/50 rounded-full" />
                      </div>
                      <h4 className="font-bold text-sm mb-1 text-slate-600">{badge.name}</h4>
                      <Badge variant="outline" className="text-xs capitalize bg-slate-50">{badge.rarity}</Badge>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{badge.progress}/{badge.maxProgress}</span>
                        </div>
                        <Progress value={(badge.progress / badge.maxProgress) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Streaks Tab */}
          <TabsContent value="streaks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockStreaks.map((streak, i) => (
                <Card key={i} className="bg-white/80 backdrop-blur border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={cn(
                        'w-14 h-14 rounded-xl flex items-center justify-center',
                        `bg-${streak.color}-100`
                      )}>
                        <streak.icon className={cn('h-7 w-7', `text-${streak.color}-600`)} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{streak.type}</h4>
                        <p className="text-sm text-slate-500">Keep it going!</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-500">{streak.current}</p>
                        <p className="text-xs text-slate-500">days</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Current Streak</p>
                        <p className="text-xl font-bold">{streak.current} 🔥</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Longest Streak</p>
                        <p className="text-xl font-bold">{streak.longest} 🏆</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-700">Daily Reward</p>
                        <p className="text-xs text-amber-600">{streak.reward} points/day</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-amber-200 text-amber-700">
                        Claim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Active Challenges
              </h3>
              <Badge className="bg-purple-100 text-purple-700">{mockChallenges.length} available</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockChallenges.map((challenge) => (
                <Card 
                  key={challenge.id} 
                  className={cn(
                    'bg-white/80 backdrop-blur border-2 transition-all',
                    challenge.isAI ? 'border-purple-200 hover:border-purple-400' : 'border-slate-200'
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">{challenge.title}</h4>
                          {challenge.isAI && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              <Bot className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{challenge.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-lg font-bold text-amber-600">+{challenge.rewards}</p>
                        <p className="text-xs text-slate-500">points</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium">{challenge.progress}/{challenge.target}</span>
                      </div>
                      <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        {challenge.daysLeft} days left
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                        Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Star className="h-8 w-8" />
                    <Badge className="bg-white/20 text-white">Points</Badge>
                  </div>
                  <p className="text-4xl font-bold mb-1">{mockWallet.points.toLocaleString()}</p>
                  <p className="text-white/80">Available to redeem</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Wallet className="h-8 w-8" />
                    <Badge className="bg-white/20 text-white">Cashback</Badge>
                  </div>
                  <p className="text-4xl font-bold mb-1">₹{mockWallet.cashback.toLocaleString()}</p>
                  <p className="text-white/80">Ready to use</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Bot className="h-8 w-8" />
                    <Badge className="bg-white/20 text-white">AI Credits</Badge>
                  </div>
                  <p className="text-4xl font-bold mb-1">{mockWallet.aiCredits}</p>
                  <p className="text-white/80">For AI features</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle>Your Coupons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockWallet.coupons.map((coupon, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Gift className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{coupon.code}</p>
                          <p className="text-sm text-slate-500">{coupon.discount}% off</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          <Clock className="h-3 w-3 mr-1" />
                          Expires {coupon.expires}
                        </Badge>
                        <Button size="sm">Apply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 p-6 text-white text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold">Top Shoppers</h3>
                  <p className="text-white/80">Compete for exclusive rewards</p>
                </div>
                
                <div className="divide-y">
                  {mockLeaderboard.map((user, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        'flex items-center justify-between p-4 hover:bg-slate-50 transition-colors',
                        user.isCurrentUser && 'bg-purple-50'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                          user.rank === 1 ? 'bg-amber-100 text-amber-700' :
                          user.rank === 2 ? 'bg-slate-200 text-slate-600' :
                          user.rank === 3 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        )}>
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-bold flex items-center gap-2">
                            {user.name}
                            {user.isCurrentUser && <Badge className="text-xs">You</Badge>}
                          </p>
                          <p className="text-sm text-slate-500">{user.points.toLocaleString()} points</p>
                        </div>
                      </div>
                      <div className="text-2xl">{user.badge}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
