'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Brain, ShoppingCart, Target, Eye, AlertTriangle, Search, Star, Shield, 
  Clock, TrendingDown, CheckCircle2, ChevronDown, ChevronRight, Play, 
  Zap, BarChart3, Users, Globe, Lock, Database, Server, Cloud, Code, 
  Smartphone, CreditCard, LineChart, Settings, Layers, Sparkles, Heart,
  Package, Wallet, Headphones, MessageSquare, Bell, Leaf, Calendar, 
  TrendingUp, Bot, MessageCircle, Building, Palette, GitBranch, 
  Download, Store, ArrowRight, Mail, MapPin, Phone, Twitter, Linkedin,
  Github, Youtube, Instagram, Send, ExternalLink, Award, Cog, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CounterStat {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
}

interface ProblemCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  impact: string;
  solution: string;
}

interface AIFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefit: string;
}

interface ComparisonItem {
  attribute: string;
  traditional: string | boolean;
  pricebrain: string | boolean;
}

interface TechnologyStack {
  category: string;
  icon: React.ReactNode;
  items: string[];
}

interface TrustFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface CoreValue {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface RoadmapItem {
  title: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  date?: string;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface TimelineStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// ============================================================================
// ANIMATED COUNTER COMPONENT
// ============================================================================

const AnimatedCounter = ({ 
  value, 
  suffix = '', 
  duration = 2000 
}: { 
  value: number; 
  suffix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, value, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// ============================================================================
// FLOATING PARTICLES COMPONENT
// ============================================================================

const FloatingParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// GLASSMORPHISM CARD COMPONENT
// ============================================================================

const GlassCard = ({ 
  children, 
  className = '',
  hover = true 
}: { 
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) => (
  <motion.div
    whileHover={hover ? { y: -4, scale: 1.01 } : {}}
    transition={{ duration: 0.3 }}
    className={cn(
      'backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 rounded-2xl shadow-xl',
      hover && 'hover:shadow-2xl',
      className
    )}
  >
    {children}
  </motion.div>
);

// ============================================================================
// SECTION WRAPPER COMPONENT
// ============================================================================

const SectionWrapper = ({ 
  children, 
  className = '',
  id,
  gradient = false
}: { 
  children: React.ReactNode;
  className?: string;
  id?: string;
  gradient?: boolean;
}) => (
  <section 
    id={id}
    className={cn(
      'relative py-20 md:py-32 overflow-hidden',
      gradient && 'bg-gradient-to-b from-muted/30 via-background to-muted/30',
      className
    )}
  >
    {gradient && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl -z-10" />
    )}
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

// ============================================================================
// ACCORDION COMPONENT
// ============================================================================

const AccordionItem = ({ 
  question, 
  answer 
}: { 
  question: string; 
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="border-b border-border"
      initial={false}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="pb-5 text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// TESTIMONIAL CARD COMPONENT
// ============================================================================

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <GlassCard className="p-8 h-full">
    <div className="flex items-center gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <p className="text-lg mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold">
        {testimonial.name.charAt(0)}
      </div>
      <div>
        <p className="font-semibold">{testimonial.name}</p>
        <p className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
      </div>
    </div>
  </GlassCard>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AboutPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  // Data
  const stats: CounterStat[] = [
    { label: 'Active Users', value: 2500000, suffix: '+', icon: <Users className="h-6 w-6" /> },
    { label: 'Products Tracked', value: 50000000, suffix: '+', icon: <Package className="h-6 w-6" /> },
    { label: 'Brand Partners', value: 10000, suffix: '+', icon: <Building className="h-6 w-6" /> },
    { label: 'Retailer Stores', value: 500, suffix: '+', icon: <Store className="h-6 w-6" /> },
    { label: 'Price Comparisons', value: 100000000, suffix: '+', icon: <BarChart3 className="h-6 w-6" /> },
    { label: 'Money Saved', value: 500000000, suffix: '₹', icon: <TrendingDown className="h-6 w-6" /> },
    { label: 'Orders Tracked', value: 10000000, suffix: '+', icon: <ShoppingCart className="h-6 w-6" /> },
    { label: 'Seller Partners', value: 25000, suffix: '+', icon: <Store className="h-6 w-6" /> },
    { label: 'Countries', value: 50, suffix: '+', icon: <Globe className="h-6 w-6" /> },
    { label: 'AI Recommendations', value: 75000000, suffix: '+', icon: <Brain className="h-6 w-6" /> },
    { label: 'Deal Alerts Sent', value: 200000000, suffix: '+', icon: <Bell className="h-6 w-6" /> },
    { label: 'Products Monitored', value: 100000000, suffix: '+', icon: <Eye className="h-6 w-6" /> },
  ];

  const problems: ProblemCard[] = [
    { icon: <Search className="h-6 w-6" />, title: 'Choice Overload', description: 'Thousands of similar products make decision-making paralyzing.', impact: 'Shoppers spend 3+ hours comparing products daily.', solution: 'AI-powered product matching identifies identical items across retailers instantly.' },
    { icon: <Star className="h-6 w-6" />, title: 'Fake Reviews', description: 'Manipulated ratings mislead buyers into poor purchases.', impact: '73% of consumers have been fooled by fake reviews.', solution: 'Our AI Trust Engine analyzes review authenticity with 94% accuracy.' },
    { icon: <Shield className="h-6 w-6" />, title: 'Counterfeit Products', description: 'Imitation products slip through marketplace controls.', impact: 'Global counterfeiting costs $500B annually.', solution: 'Multi-layer verification with seller history and product authentication.' },
    { icon: <TrendingDown className="h-6 w-6" />, title: 'Price Manipulation', description: 'Inflated prices disguised as discounts deceive shoppers.', impact: 'Average shopper overpays by 15-30% on electronics.', solution: 'Real-time price tracking with historical context prevents manipulation.' },
    { icon: <AlertTriangle className="h-6 w-6" />, title: 'Poor Search Results', description: 'Irrelevant products buried in endless pages.', impact: '40% of searches fail to find what users need.', solution: 'Semantic search with AI understanding of intent and context.' },
    { icon: <ShoppingCart className="h-6 w-6" />, title: 'Wrong Size Selection', description: 'Inconsistent sizing leads to costly returns.', impact: '30% of fashion purchases involve size issues.', solution: 'AI-powered size prediction based on body measurements and brand data.' },
    { icon: <CheckCircle2 className="h-6 w-6" />, title: 'Low Seller Trust', description: 'Unknown sellers create hesitation and risk.', impact: '45% of cart abandonments due to seller distrust.', solution: 'Comprehensive seller profiles with verified ratings and history.' },
    { icon: <CreditCard className="h-6 w-6" />, title: 'Hidden Costs', description: 'Surprise fees appear only at checkout.', impact: '68% of shoppers abandon carts due to unexpected costs.', solution: 'Total price transparency including shipping, taxes, and fees upfront.' },
    { icon: <Clock className="h-6 w-6" />, title: 'Price Regret', description: 'Buying at the wrong time when prices drop soon after.', impact: '82% of shoppers regret at least one purchase due to price drops.', solution: 'Smart alerts when prices drop within price protection window.' },
    { icon: <Package className="h-6 w-6" />, title: 'Warranty Confusion', description: 'Warranty documents lost, terms misunderstood.', impact: '60% of warranties go unclaimed due to documentation issues.', solution: 'Digital warranty management with automatic expiration alerts.' },
    { icon: <Database className="h-6 w-6" />, title: 'Lost Invoices', description: 'Purchase proof misplaced when needed for returns.', impact: '25% of return requests denied due to missing proof.', solution: 'Cloud-stored purchase history with instant invoice retrieval.' },
    { icon: <RefreshCw className="h-6 w-6" />, title: 'Delivery Delays', description: 'No transparency on order status and delays.', impact: 'Frustrating waits with no communication from sellers.', solution: 'Real-time tracking with predictive delivery estimates.' },
    { icon: <MessageSquare className="h-6 w-6" />, title: 'Returns Complexity', description: 'Complicated return processes discourage purchases.', impact: '67% avoid buying from sites with complex returns.', solution: 'One-click returns with prepaid shipping and instant refunds.' },
    { icon: <Layers className="h-6 w-6" />, title: 'Scattered Data', description: 'Shopping history spread across multiple platforms.', impact: 'No unified view of purchases, prices, or preferences.', solution: 'Unified shopping profile across all retailers and categories.' },
  ];

  const workflowSteps: TimelineStep[] = [
    { title: 'Search Product', description: 'Find what you need with AI-powered semantic search', icon: <Search className="h-5 w-5" /> },
    { title: 'Compare Prices', description: 'View prices from hundreds of retailers instantly', icon: <BarChart3 className="h-5 w-5" /> },
    { title: 'AI Analysis', description: 'Get personalized insights and recommendations', icon: <Brain className="h-5 w-5" /> },
    { title: 'Trust Verification', description: 'Verify seller authenticity and product legitimacy', icon: <Shield className="h-5 w-5" /> },
    { title: 'Price History', description: 'See historical prices to buy at the perfect moment', icon: <TrendingDown className="h-5 w-5" /> },
    { title: 'Deal Intelligence', description: 'Discover hidden deals and bundle opportunities', icon: <Sparkles className="h-5 w-5" /> },
    { title: 'Recommendation', description: 'Receive AI-curated suggestions based on preferences', icon: <Zap className="h-5 w-5" /> },
    { title: 'Purchase', description: 'Complete your purchase with secure checkout', icon: <ShoppingCart className="h-5 w-5" /> },
    { title: 'Warranty Management', description: 'Automatic tracking of all your warranties', icon: <Package className="h-5 w-5" /> },
    { title: 'Post-Purchase Intelligence', description: 'Track orders, manage returns, save receipts', icon: <Eye className="h-5 w-5" /> },
  ];

  const aiFeatures: AIFeature[] = [
    { icon: <Bot className="h-6 w-6" />, title: 'AI Shopping Persona', description: 'Personalized shopping profile that learns your preferences, style, and budget over time.', benefit: 'Shop smarter with recommendations tailored to you' },
    { icon: <Heart className="h-6 w-6" />, title: 'Shopping Health Score', description: 'Track your shopping habits with our unique wellness metric for purchases.', benefit: 'Make financially healthier buying decisions' },
    { icon: <Palette className="h-6 w-6" />, title: 'Digital Wardrobe', description: 'Visual catalog of your purchased items to avoid duplicates and plan outfits.', benefit: 'Build a cohesive wardrobe efficiently' },
    { icon: <Clock className="h-6 w-6" />, title: 'Price Regret Tracker', description: 'Automatic refunds when prices drop within the protection window.', benefit: 'Never overpay again after purchase' },
    { icon: <MessageCircle className="h-6 w-6" />, title: 'AI Shopping Coach', description: '24/7 assistant answering product questions and providing expert advice.', benefit: 'Get instant answers to any shopping question' },
    { icon: <Wallet className="h-6 w-6" />, title: 'Budget Planner', description: 'Intelligent budget allocation across categories with spending insights.', benefit: 'Stay on track with your financial goals' },
    { icon: <Star className="h-6 w-6" />, title: 'Wishlist Intelligence', description: 'Predictive alerts when wishlist items go on sale or reach target price.', benefit: 'Buy at the perfect moment every time' },
    { icon: <Calendar className="h-6 w-6" />, title: 'Product Ownership Timeline', description: 'Track when you bought, warranty expiry, and replacement timing.', benefit: 'Never miss a warranty claim again' },
    { icon: <Leaf className="h-6 w-6" />, title: 'Carbon Footprint', description: 'Environmental impact of your purchases with sustainable alternatives.', benefit: 'Make eco-conscious shopping choices' },
    { icon: <TrendingUp className="h-6 w-6" />, title: 'Recommendation Engine', description: 'Sophisticated matching based on behavior, preferences, and similar users.', benefit: 'Discover products you\'ll truly love' },
    { icon: <BarChart3 className="h-6 w-6" />, title: 'Monthly Shopping Report', description: 'Comprehensive analysis of spending patterns and saving opportunities.', benefit: 'Understand your shopping behavior deeply' },
    { icon: <Sparkles className="h-6 w-6" />, title: 'Predict Next Purchase', description: 'AI anticipates your needs before you search for them.', benefit: 'Be ready for upcoming needs in advance' },
    { icon: <GitBranch className="h-6 w-6" />, title: 'AI Negotiation History', description: 'Track your successful negotiation outcomes and strategies.', benefit: 'Become a smarter negotiator over time' },
    { icon: <Users className="h-6 w-6" />, title: 'Social Shopping Circle', description: 'Share finds, get recommendations, and shop with friends.', benefit: 'Combine collective shopping intelligence' },
    { icon: <Bell className="h-6 w-6" />, title: 'Smart Notifications', description: 'Contextual alerts that respect your time and attention.', benefit: 'Stay informed without information overload' },
  ];

  const comparisons: ComparisonItem[] = [
    { attribute: 'AI Shopping Assistant', traditional: false, pricebrain: true },
    { attribute: 'Real-time Price Comparison', traditional: 'Limited', pricebrain: '50+ retailers' },
    { attribute: 'Historical Price Tracking', traditional: false, pricebrain: true },
    { attribute: 'AI Deal Score', traditional: false, pricebrain: true },
    { attribute: 'Trust Score System', traditional: false, pricebrain: true },
    { attribute: 'Seller Intelligence', traditional: 'Basic', pricebrain: 'Comprehensive' },
    { attribute: 'Fake Review Detection', traditional: false, pricebrain: true },
    { attribute: 'Budget Planning Tools', traditional: false, pricebrain: true },
    { attribute: 'Personal Shopping Coach', traditional: false, pricebrain: true },
    { attribute: 'Warranty Management', traditional: false, pricebrain: true },
    { attribute: 'Digital Ownership Docs', traditional: false, pricebrain: true },
    { attribute: 'AI Purchase Predictions', traditional: false, pricebrain: true },
    { attribute: 'Cross-Platform Comparison', traditional: '2-3 stores', pricebrain: '500+ stores' },
  ];

  const technologies: TechnologyStack[] = [
    { category: 'Frontend', icon: <Code className="h-5 w-5" />, items: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Radix UI'] },
    { category: 'Backend', icon: <Server className="h-5 w-5" />, items: ['Node.js', 'Python', 'FastAPI', 'GraphQL', 'REST APIs', 'WebSocket'] },
    { category: 'Database', icon: <Database className="h-5 w-5" />, items: ['PostgreSQL', 'Redis', 'Elasticsearch', 'TimescaleDB', 'Neo4j'] },
    { category: 'AI Engine', icon: <Brain className="h-5 w-5" />, items: ['TensorFlow', 'PyTorch', 'Hugging Face', 'OpenAI', 'LangChain', 'Vector DB'] },
    { category: 'Cloud', icon: <Cloud className="h-5 w-5" />, items: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CloudFront', 'Lambda'] },
    { category: 'Security', icon: <Lock className="h-5 w-5" />, items: ['SOC 2', 'AES-256', 'OAuth 2.0', 'JWT', 'Rate Limiting', 'WAF'] },
  ];

  const trustFeatures: TrustFeature[] = [
    { icon: <Shield className="h-6 w-6" />, title: 'Verified Sellers', description: 'Multi-layer verification process for all marketplace sellers with continuous monitoring.' },
    { icon: <Lock className="h-6 w-6" />, title: 'Encrypted Data', description: 'End-to-end encryption for all sensitive data with zero-knowledge architecture.' },
    { icon: <Smartphone className="h-6 w-6" />, title: 'Secure Authentication', description: 'Multi-factor authentication with biometric options and secure session management.' },
    { icon: <Eye className="h-6 w-6" />, title: 'Privacy Protection', description: 'GDPR compliant with complete data control and transparent privacy practices.' },
    { icon: <AlertTriangle className="h-6 w-6" />, title: 'Fraud Detection', description: 'AI-powered fraud prevention with real-time monitoring and anomaly detection.' },
    { icon: <Brain className="h-6 w-6" />, title: 'AI Trust Engine', description: 'Proprietary system analyzing seller behavior, product authenticity, and review reliability.' },
    { icon: <CreditCard className="h-6 w-6" />, title: 'Secure Payments', description: 'PCI DSS Level 1 compliance with encrypted transactions and fraud protection.' },
    { icon: <CheckCircle2 className="h-6 w-6" />, title: 'Compliance', description: 'SOC 2 Type II certified with regular security audits and penetration testing.' },
    { icon: <Settings className="h-6 w-6" />, title: 'Role-Based Access', description: 'Granular permissions with principle of least privilege across all systems.' },
    { icon: <Database className="h-6 w-6" />, title: 'Audit Logs', description: 'Complete activity tracking with immutable logs for accountability and forensics.' },
  ];

  const coreValues: CoreValue[] = [
    { icon: <Eye className="h-6 w-6" />, title: 'Transparency', description: 'Every price, every fee, every rating—visible and honest. No hidden costs, no manipulated reviews.' },
    { icon: <Sparkles className="h-6 w-6" />, title: 'Innovation', description: 'Pushing boundaries of what AI can do for shopping. Constantly evolving to serve our users better.' },
    { icon: <Heart className="h-6 w-6" />, title: 'Customer First', description: 'Every decision starts with one question: How does this help our users? Your success is our success.' },
    { icon: <Shield className="h-6 w-6" />, title: 'Trust', description: 'Building trust through reliability, security, and consistent delivery on our promises.' },
    { icon: <Lock className="h-6 w-6" />, title: 'Privacy', description: 'Your data belongs to you. We protect it fiercely and give you complete control.' },
    { icon: <Award className="h-6 w-6" />, title: 'Quality', description: 'Never settling for good enough. Premium experiences, premium recommendations, premium service.' },
    { icon: <TrendingUp className="h-6 w-6" />, title: 'Continuous Learning', description: 'Our AI learns every day. Our team grows every day. Progress is our only direction.' },
    { icon: <Users className="h-6 w-6" />, title: 'Accessibility', description: 'Making intelligent shopping available to everyone, regardless of tech experience or abilities.' },
    { icon: <Target className="h-6 w-6" />, title: 'Long-term Thinking', description: 'Building for the next decade, not the next quarter. Sustainable growth for lasting impact.' },
  ];

  const roadmapItems: { completed: RoadmapItem[]; upcoming: RoadmapItem[] } = {
    completed: [
      { title: 'Authentication System', status: 'completed', date: 'Q1 2024' },
      { title: 'AI Commerce Engine', status: 'completed', date: 'Q1 2024' },
      { title: 'Seller Marketplace', status: 'completed', date: 'Q2 2024' },
      { title: 'Admin Portal', status: 'completed', date: 'Q2 2024' },
      { title: 'Wallet System', status: 'completed', date: 'Q3 2024' },
      { title: 'Commission Engine', status: 'completed', date: 'Q3 2024' },
    ],
    upcoming: [
      { title: 'Voice Commerce', status: 'upcoming', date: 'Q1 2025' },
      { title: 'AI Negotiation', status: 'upcoming', date: 'Q1 2025' },
      { title: 'Offline Store Integration', status: 'upcoming', date: 'Q2 2025' },
      { title: 'Mobile Apps (iOS/Android)', status: 'upcoming', date: 'Q2 2025' },
      { title: 'Global Marketplace', status: 'upcoming', date: 'Q3 2025' },
      { title: 'International Expansion', status: 'upcoming', date: 'Q3 2025' },
      { title: 'Developer API', status: 'upcoming', date: 'Q4 2025' },
    ],
  };

  const testimonials: Testimonial[] = [
    { name: 'Priya Sharma', role: 'Marketing Manager', company: 'TechCorp', quote: 'PriceBrain has completely transformed how I shop online. The AI recommendations are incredibly accurate, and I\'ve saved over ₹50,000 in the past year alone. It\'s like having a personal shopping assistant.', avatar: 'priya' },
    { name: 'Rahul Verma', role: 'Small Business Owner', company: 'Verma Electronics', quote: 'As a seller, PriceBrain\'s analytics have been invaluable. Understanding customer behavior and pricing trends has helped us increase sales by 40%. The seller dashboard is incredibly intuitive.', avatar: 'rahul' },
    { name: 'Ananya Patel', role: 'Software Engineer', company: 'StartupX', quote: 'The price history feature alone is worth it. I was able to buy my laptop at its lowest price ever. The Chrome extension makes it so seamless to use across all my shopping sessions.', avatar: 'ananya' },
    { name: 'Vikram Singh', role: 'Operations Director', company: 'RetailMax', quote: 'Partnering with PriceBrain as a business has opened new channels for us. The AI-powered matching brings us qualified customers, not just random traffic. Our conversion rates speak for themselves.', avatar: 'vikram' },
    { name: 'Meera Krishnan', role: 'Content Creator', company: 'StyleVibes', quote: 'PriceBrain\'s trust scores have made me confident in recommending products to my audience. I know everything I share has been verified. It\'s essential for maintaining credibility.', avatar: 'meera' },
    { name: 'Aditya Nair', role: 'Data Scientist', company: 'DataLabs', quote: 'The developer API is exceptionally well-designed. Building integrations was straightforward, and the documentation is comprehensive. PriceBrain has built a proper tech platform.', avatar: 'aditya' },
  ];

  const faqs: FAQ[] = [
    { question: 'What exactly is PriceBrain?', answer: 'PriceBrain is an AI-powered Commerce Platform that helps people discover products, compare prices across multiple stores, identify genuine deals, avoid fake reviews, and make smarter purchasing decisions with confidence. We\'re not just a price comparison site—we\'re your intelligent shopping companion.' },
    { question: 'How does the AI Deal Score work?', answer: 'Our AI Deal Score analyzes multiple factors including historical pricing, retailer reliability, product demand, seasonal trends, and seller performance to give each deal a score from 0-100. A score above 80 indicates an exceptional deal worth acting on immediately.' },
    { question: 'How are prices compared across different stores?', answer: 'We continuously crawl and analyze prices from 500+ retailers using AI-powered product matching. Our system identifies identical products across platforms, normalizes pricing (including shipping and fees), and presents you with a comprehensive comparison instantly.' },
    { question: 'How do you detect fake reviews?', answer: 'Our AI Trust Engine analyzes reviews using natural language processing, behavioral patterns, reviewer history, linguistic anomalies, and cross-reference verification. We\'ve achieved 94% accuracy in identifying manipulated reviews, and we display verified purchase badges only for confirmed buyers.' },
    { question: 'Is PriceBrain free to use?', answer: 'Yes! PriceBrain is completely free for shoppers. We generate revenue through affiliate partnerships and featured seller placements, but this never influences our recommendations. Your trust is worth more than any sponsored listing.' },
    { question: 'How can sellers join PriceBrain?', answer: 'Sellers can apply through our Seller Portal at seller.pricebrain.com. We have a verification process to ensure quality—most applications are reviewed within 48 hours. We support individual sellers, small businesses, and large retailers with customized plans.' },
    { question: 'How do price drop alerts work?', answer: 'Set your target price for any product, and our system monitors prices 24/7. When the price drops to or below your target, you\'ll receive an instant notification via email, SMS, or our app. You can also set percentage drop alerts for automatic notifications.' },
    { question: 'How secure is my personal data?', answer: 'Extremely secure. We\'re SOC 2 Type II certified, use AES-256 encryption for all data, and never sell your personal information. You have complete control over your data with the ability to export or delete everything. We\'re GDPR and CCPA compliant.' },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Scroll reveal for sections
  const revealVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div ref={containerRef} className="min-h-screen overflow-x-hidden">
      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .gradient-text {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, #8B5CF6 50%, hsl(var(--primary)) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease infinite;
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        
        .glow-effect {
          box-shadow: 0 0 60px -15px hsl(var(--primary) / 0.3);
        }
        
        .glass-panel {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
        }
      `}</style>

      {/* ============================================================
          SECTION 1: PREMIUM HERO
      ============================================================ */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <FloatingParticles />
          
          {/* Neural Network Visualization */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 600">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[...Array(8)].map((_, i) => (
              <motion.circle
                key={i}
                cx={100 + i * 120}
                cy={100 + (i % 3) * 150}
                r="4"
                fill="hsl(var(--primary))"
                initial={{ opacity: 0.3 }}
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
            {[...Array(6)].map((_, i) => (
              <motion.line
                key={`line-${i}`}
                x1={220 + i * 120}
                y1={100 + (i % 2) * 150}
                x2={340 + i * 100}
                y2={250 + ((i + 1) % 2) * 150}
                stroke="url(#lineGradient)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 1.5, delay: i * 0.3 }}
              />
            ))}
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Introducing AI Commerce OS
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
            >
              The Future of{' '}
              <span className="gradient-text">Intelligent</span>
              <br />
              Shopping
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              PriceBrain is an AI-powered Commerce Platform that helps people discover products, 
              compare prices across multiple stores, identify genuine deals, avoid fake reviews, 
              and make smarter purchasing decisions with confidence.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-16"
            >
              <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Start Shopping
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold">
                <Brain className="w-5 h-5 mr-2" />
                Explore AI Features
              </Button>
              <Button size="lg" variant="ghost" className="h-14 px-8 text-lg font-semibold">
                <Store className="w-5 h-5 mr-2" />
                Become a Seller
              </Button>
            </motion.div>

            {/* Floating Product Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="relative h-[400px] md:h-[500px]"
            >
              {/* Product Card 1 */}
              <motion.div
                className="absolute left-1/4 top-0 glass-panel rounded-2xl p-4 shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-48 h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl mb-3" />
                <p className="font-semibold">iPhone 15 Pro Max</p>
                <p className="text-sm text-muted-foreground">from ₹1,09,900</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">4.8</span>
                </div>
              </motion.div>

              {/* Product Card 2 */}
              <motion.div
                className="absolute right-1/4 top-20 glass-panel rounded-2xl p-4 shadow-2xl"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <div className="w-48 h-32 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl mb-3" />
                <p className="font-semibold">MacBook Air M3</p>
                <p className="text-sm text-muted-foreground">from ₹1,14,900</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">4.9</span>
                </div>
              </motion.div>

              {/* Price Comparison Card */}
              <motion.div
                className="absolute left-1/2 bottom-0 transform -translate-x-1/2 glass-panel rounded-2xl p-6 shadow-2xl glow-effect"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Amazon</p>
                    <p className="text-xl font-bold text-red-500">₹1,54,900</p>
                  </div>
                  <div className="flex items-center">
                    <TrendingDown className="w-6 h-6 text-green-500" />
                    <span className="text-green-500 font-bold text-lg">Save ₹5,000</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Flipkart</p>
                    <p className="text-xl font-bold text-green-500">₹1,49,900</p>
                  </div>
                </div>
                <Badge className="mt-3 bg-green-500/10 text-green-600 border-green-500/20">
                  <Zap className="w-3 h-3 mr-1" />
                  Best Price Detected
                </Badge>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </motion.div>
      </section>

      {/* ============================================================
          SECTION 2: WHY PRICEBRAIN EXISTS
      ============================================================ */}
      <SectionWrapper id="why" gradient>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={revealVariants}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <Badge variant="secondary" className="mb-6">Our Story</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Why PriceBrain <span className="gradient-text">Exists</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-12">
            Today&apos;s online shopping is broken. We set out to fix it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            { icon: <Search className="h-8 w-8" />, text: 'People spend hours comparing products across endless tabs' },
            { icon: <TrendingDown className="h-8 w-8" />, text: 'Prices constantly change, and there\'s no way to know if you\'re buying at the right time' },
            { icon: <Star className="h-8 w-8" />, text: 'Fake reviews mislead customers into poor purchasing decisions' },
            { icon: <CreditCard className="h-8 w-8" />, text: 'Hidden charges appear during checkout, shattering trust' },
            { icon: <Clock className="h-8 w-8" />, text: 'People regret purchases shortly after buying when prices drop' },
            { icon: <Package className="h-8 w-8" />, text: 'Warranty documents get lost when you need them most' },
            { icon: <Layers className="h-8 w-8" />, text: 'Important product information is scattered across dozens of websites' },
            { icon: <AlertTriangle className="h-8 w-8" />, text: 'Shopping should not be this difficult—it should be intelligent' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <GlassCard className="p-8 flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {item.icon}
                </div>
                <p className="text-lg leading-relaxed">{item.text}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mt-16"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-3xl blur-xl" />
            <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-10 border border-border">
              <p className="text-2xl md:text-3xl font-medium leading-relaxed">
                <span className="gradient-text font-bold">PriceBrain exists</span> to make shopping{' '}
                <span className="text-primary font-semibold">intelligent</span> instead of{' '}
                <span className="text-destructive">stressful</span>.
              </p>
            </div>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 3: OUR MISSION
      ============================================================ */}
      <SectionWrapper id="mission">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-6">Our Mission</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Making Every Purchase{' '}
              <span className="gradient-text">Transparent</span>
            </h2>
            <div className="relative">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
              <blockquote className="pl-6 text-2xl font-medium leading-relaxed border-l-4 border-primary/20">
                &ldquo;Our mission is to make every online purchase{' '}
                <span className="text-primary">transparent</span>,{' '}
                <span className="text-primary">intelligent</span>, and{' '}
                <span className="text-primary">confidence-driven</span>.&rdquo;
              </blockquote>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: <TrendingDown className="h-5 w-5" />, title: 'Save Money', desc: 'Find the best prices across all retailers' },
              { icon: <Search className="h-5 w-5" />, title: 'Reduce Confusion', desc: 'AI-powered recommendations that make sense' },
              { icon: <Eye className="h-5 w-5" />, title: 'Improve Transparency', desc: 'Every price, every fee, visible upfront' },
              { icon: <Shield className="h-5 w-5" />, title: 'Fight Fake Reviews', desc: '94% accuracy in review authenticity' },
              { icon: <Store className="h-5 w-5" />, title: 'Promote Trust', desc: 'Verified sellers with transparent ratings' },
              { icon: <Sparkles className="h-5 w-5" />, title: 'Democratize AI', desc: 'Making AI available to every shopper' },
            ].map((item, index) => (
              <GlassCard key={index} className="p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </GlassCard>
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 4: OUR VISION
      ============================================================ */}
      <SectionWrapper id="vision" gradient>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">Our Vision</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Building the World&apos;s{' '}
            <span className="gradient-text">AI Commerce OS</span>
          </h2>
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-full blur-3xl" />
            <blockquote className="relative text-3xl md:text-4xl font-medium leading-relaxed py-8">
              &ldquo;We are building the world&apos;s{' '}
              <span className="gradient-text font-bold">AI Commerce Operating System</span>.&rdquo;
            </blockquote>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Central Hub */}
          <div className="flex justify-center mb-12">
            <GlassCard className="px-10 py-6 text-center glow-effect">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <p className="text-xl font-bold">PriceBrain</p>
              <p className="text-sm text-muted-foreground">AI Commerce OS</p>
            </GlassCard>
          </div>

          {/* Connected Elements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Package className="h-6 w-6" />, text: 'Every Product' },
              { icon: <Store className="h-6 w-6" />, text: 'Every Seller' },
              { icon: <Globe className="h-6 w-6" />, text: 'Every Marketplace' },
              { icon: <TrendingDown className="h-6 w-6" />, text: 'Every Price' },
              { icon: <Shield className="h-6 w-6" />, text: 'Every Warranty' },
              { icon: <ShoppingCart className="h-6 w-6" />, text: 'Every Purchase' },
              { icon: <Sparkles className="h-6 w-6" />, text: 'AI Powered' },
              { icon: <Zap className="h-6 w-6" />, text: 'Real-time' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-5 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
                    {item.icon}
                  </div>
                  <p className="font-semibold">{item.text}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 5: PROBLEMS WE SOLVE
      ============================================================ */}
      <SectionWrapper id="problems">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">Problem Solver</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Real Problems,{' '}
            <span className="gradient-text">Real Solutions</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            We identified the biggest pain points in online shopping and built AI to solve them.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="h-full p-6 group" hover>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    {problem.icon}
                  </div>
                  <h3 className="text-lg font-bold">{problem.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{problem.description}</p>
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-red-400/80 mb-2">
                    <strong>Impact:</strong> {problem.impact}
                  </p>
                  <p className="text-sm text-green-400/80">
                    <strong>Solution:</strong> {problem.solution}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 6: HOW PRICEBRAIN WORKS
      ============================================================ */}
      <SectionWrapper id="how" gradient>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">The Journey</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How PriceBrain <span className="gradient-text">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            From search to post-purchase, we&apos;ve got you covered at every step.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-purple-500 to-primary transform -translate-x-1/2 hidden lg:block" />

          {workflowSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative flex items-center gap-8 mb-12',
                index % 2 === 1 && 'lg:flex-row-reverse'
              )}
            >
              {/* Content */}
              <div className={cn('flex-1', index % 2 === 1 && 'lg:text-right')}>
                <GlassCard className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </GlassCard>
              </div>

              {/* Center Icon */}
              <div className="hidden lg:flex w-16 h-16 rounded-full bg-background border-4 border-primary flex items-center justify-center relative z-10">
                {step.icon}
              </div>

              {/* Spacer for alternating layout */}
              <div className="flex-1 hidden lg:block" />
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 7: AI COMMERCE INTELLIGENCE
      ============================================================ */}
      <SectionWrapper id="ai">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">
            <Bot className="w-4 h-4 mr-1" />
            AI-Powered
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Commerce <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            15+ AI-powered features to make your shopping smarter, faster, and more confident.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="h-full p-6 group hover:glow-effect transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>{feature.benefit}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 8: WHY PRICEBRAIN IS DIFFERENT
      ============================================================ */}
      <SectionWrapper id="comparison" gradient>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">The Difference</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why PriceBrain <span className="gradient-text">Wins</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            A side-by-side comparison showing why we&apos;re not your average shopping site.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 font-semibold">Feature</th>
                <th className="text-center py-4 px-6 font-semibold text-muted-foreground">Traditional Sites</th>
                <th className="text-center py-4 px-6 font-semibold text-primary bg-primary/5 rounded-t-xl">
                  <div className="flex items-center justify-center gap-2">
                    <Brain className="w-5 h-5" />
                    PriceBrain
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((item, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'border-b border-border hover:bg-muted/30 transition-colors',
                    index === comparisons.length - 1 && 'rounded-b-xl'
                  )}
                >
                  <td className="py-4 px-6 font-medium">{item.attribute}</td>
                  <td className="py-4 px-6 text-center text-muted-foreground">
                    {typeof item.traditional === 'boolean' ? (
                      item.traditional ? (
                        <CheckCircle2 className="w-5 h-5 mx-auto text-green-500" />
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )
                    ) : (
                      item.traditional
                    )}
                  </td>
                  <td className="py-4 px-6 text-center bg-primary/5 font-medium">
                    {typeof item.pricebrain === 'boolean' ? (
                      item.pricebrain ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Included</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )
                    ) : (
                      <span className="text-primary font-semibold">{item.pricebrain}</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 9: TECHNOLOGY
      ============================================================ */}
      <SectionWrapper id="tech">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">
            <Code className="w-4 h-4 mr-1" />
            Under the Hood
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Technology <span className="gradient-text">Behind PriceBrain</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Enterprise-grade infrastructure powering your intelligent shopping experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary">
                    {tech.icon}
                  </div>
                  <h3 className="text-xl font-bold">{tech.category}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tech.items.map((item, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-3xl p-8 border border-border/50">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIDEwIDQwIE0gMjAgMCAyMCA0MCBNIDMwIDAgMzAgNDAgTSAwIDIwIDQwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAwMTAiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjwvc3ZnPg==')] opacity-30 rounded-3xl" />
            <div className="relative grid grid-cols-4 gap-4 text-center">
              {['Frontend', 'API Gateway', 'AI Engine', 'Data Lake'].map((layer, i) => (
                <div key={i} className="glass-panel rounded-xl p-4">
                  <Layers className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{layer}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 10: TRUST & SECURITY
      ============================================================ */}
      <SectionWrapper id="trust" gradient>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">
            <Shield className="w-4 h-4 mr-1" />
            Security First
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trust & <span className="gradient-text">Security</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Your data security isn&apos;t just a feature—it&apos;s our foundation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <GlassCard className="h-full p-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 mt-12"
        >
          {['SOC 2 Type II', 'GDPR Compliant', 'PCI DSS Level 1', 'ISO 27001', '256-bit SSL'].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 glass-panel px-5 py-3 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-medium">{badge}</span>
            </div>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 11: CORE VALUES
      ============================================================ */}
      <SectionWrapper id="values">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">Our DNA</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Core <span className="gradient-text">Values</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            The principles that guide every decision we make.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {coreValues.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <GlassCard className="h-full p-6 group hover:glow-effect transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 12: IMPACT DASHBOARD
      ============================================================ */}
      <SectionWrapper id="impact" gradient>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">Our Impact</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Numbers That <span className="gradient-text">Matter</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Every number represents a smarter purchase, a saved rupee, a happy customer.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-6 text-center h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                  {stat.icon}
                </div>
                <p className="text-3xl md:text-4xl font-bold mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 13: ROADMAP
      ============================================================ */}
      <SectionWrapper id="roadmap">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">The Journey</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Our <span className="gradient-text">Roadmap</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Where we&apos;ve been, where we&apos;re going. Built in public, with you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Completed */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              Completed
            </h3>
            <div className="space-y-4">
              {roadmapItems.completed.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{item.date}</Badge>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              Coming Soon
            </h3>
            <div className="space-y-4">
              {roadmapItems.upcoming.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">{item.date}</Badge>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 14: CUSTOMER STORIES
      ============================================================ */}
      <SectionWrapper id="stories" gradient>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">Success Stories</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What People <span className="gradient-text">Say</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Real stories from real people whose shopping lives have changed.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          {['Shoppers', 'Sellers', 'Partners'].map((tab, i) => (
            <Button key={tab} variant={i === 0 ? 'default' : 'outline'} className="rounded-full">
              {tab}
            </Button>
          ))}
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <TestimonialCard testimonial={testimonials[activeTestimonial]} />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all',
                  index === activeTestimonial
                    ? 'bg-primary w-8'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 15: FAQ
      ============================================================ */}
      <SectionWrapper id="faq">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">Got Questions?</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <GlassCard className="p-0 overflow-hidden">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </GlassCard>
        </motion.div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 16: MEET THE FUTURE
      ============================================================ */}
      <SectionWrapper id="future" gradient>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="w-4 h-4 mr-1" />
            The Next Chapter
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Meet the <span className="gradient-text">Future</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            We&apos;re not just building a product. We&apos;re shaping how the world will shop.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: <Brain className="h-8 w-8" />, title: 'AI Commerce OS', description: 'A complete operating system for all your shopping needs—intelligent, predictive, and always learning.' },
            { icon: <TrendingUp className="h-8 w-8" />, title: 'Predictive Shopping', description: 'AI that anticipates your needs before you search. Your next purchase, predicted with uncanny accuracy.' },
            { icon: <Bot className="h-8 w-8" />, title: 'Autonomous Buying', description: 'Set your preferences and budget. Watch as AI negotiates the best deals and executes purchases for you.' },
            { icon: <Globe className="h-8 w-8" />, title: 'Omnichannel Experience', description: 'Seamless shopping that bridges online and offline. Scan in-store, compare prices, buy anywhere.' },
            { icon: <Zap className="h-8 w-8" />, title: 'Global Marketplace', description: 'One platform connecting buyers and sellers worldwide. Universal currency, universal trust, universal access.' },
            { icon: <Target className="h-8 w-8" />, title: 'Developer Ecosystem', description: 'Open APIs for everyone. Build on PriceBrain. Create the next generation of commerce experiences.' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full p-8 text-center hover:glow-effect transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white mx-auto mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 17: JOIN OUR MISSION
      ============================================================ */}
      <SectionWrapper id="join">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Background Glow */}
          <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-3xl blur-3xl" />
          
          <div className="relative bg-gradient-to-br from-primary/10 via-background to-purple-500/10 rounded-3xl p-12 md:p-20 border border-border/50 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Ready to Shop <span className="gradient-text">Smarter</span>?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Join millions of smart shoppers who save time, money, and sanity with PriceBrain.
                The future of shopping starts today.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Button size="lg" className="h-14 px-10 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Start Shopping
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-semibold">
                  <Store className="w-5 h-5 mr-2" />
                  Become Seller
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-semibold">
                  <Brain className="w-5 h-5 mr-2" />
                  Explore AI
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="ghost" size="lg" className="text-lg">
                  <Building className="w-5 h-5 mr-2" />
                  Partner With Us
                </Button>
                <Button variant="ghost" size="lg" className="text-lg">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ============================================================
          SECTION 18: FOOTER
      ============================================================ */}
      <footer className="bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
            {/* Company */}
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/press" className="text-muted-foreground hover:text-foreground transition-colors">Press</Link></li>
              </ul>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-bold mb-4">Products</h3>
              <ul className="space-y-3">
                <li><Link href="/ai-features" className="text-muted-foreground hover:text-foreground transition-colors">AI Features</Link></li>
                <li><Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link></li>
                <li><Link href="/deals" className="text-muted-foreground hover:text-foreground transition-colors">Deals</Link></li>
                <li><Link href="/price-history" className="text-muted-foreground hover:text-foreground transition-colors">Price History</Link></li>
              </ul>
            </div>

            {/* Developers */}
            <div>
              <h3 className="font-bold mb-4">Developers</h3>
              <ul className="space-y-3">
                <li><Link href="/developers" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="text-muted-foreground hover:text-foreground transition-colors">API</Link></li>
                <li><Link href="/integrations" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</Link></li>
                <li><Link href="/status" className="text-muted-foreground hover:text-foreground transition-colors">Status</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-span-2">
              <h3 className="font-bold mb-4">Stay Updated</h3>
              <p className="text-muted-foreground mb-4">Get the latest news and deals delivered to your inbox.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold">PriceBrain</p>
                <p className="text-xs text-muted-foreground">AI-Powered Commerce</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link href="https://twitter.com/pricebrain" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="https://linkedin.com/company/pricebrain" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="https://github.com/pricebrain" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="https://youtube.com/pricebrain" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
              <Link href="https://instagram.com/pricebrain" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-4 md:mt-0">
              © 2025 PriceBrain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
