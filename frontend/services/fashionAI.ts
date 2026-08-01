import type {
  FashionContext,
  FashionChatMessage,
  Outfit,
  OutfitItem,
  OutfitCategory,
  Occasion,
  Product,
} from '@/types';

interface FashionContextState {
  messages: FashionChatMessage[];
  currentContext: FashionContext;
  conversationHistory: string[];
}

const OUTFIT_SLOTS: Record<string, string[]> = {
  wedding: ['top', 'bottom', 'outerwear', 'footwear', 'accessory', 'watch', 'belt', 'pocket_square', 'tie'],
  office: ['top', 'bottom', 'outerwear', 'footwear', 'accessory', 'watch', 'belt', 'bag'],
  casual: ['top', 'bottom', 'footwear', 'accessory', 'bag', 'sunglasses'],
  date: ['top', 'bottom', 'footwear', 'accessory', 'watch', 'perfume'],
  party: ['top', 'bottom', 'footwear', 'accessory', 'bag', 'jewelry', 'sunglasses'],
  college: ['top', 'bottom', 'footwear', 'accessory', 'bag'],
  festival: ['top', 'bottom', 'footwear', 'accessory', 'jewelry', 'bag'],
};

const MOCK_PRODUCTS: Record<string, Partial<Product>[]> = {
  shirts: [
    { name: 'Classic White Formal Shirt', brand: { id: '1', name: 'Louis Philippe', slug: 'louis-philippe', isActive: true }, rating: 4.5, reviewCount: 234 },
    { name: 'Blue Oxford Shirt', brand: { id: '2', name: 'Van Heusen', slug: 'van-heusen', isActive: true }, rating: 4.3, reviewCount: 189 },
    { name: 'Striped Business Shirt', brand: { id: '3', name: 'Arrow', slug: 'arrow', isActive: true }, rating: 4.4, reviewCount: 156 },
    { name: 'Premium Cotton Shirt', brand: { id: '4', name: 'Peter England', slug: 'peter-england', isActive: true }, rating: 4.6, reviewCount: 312 },
  ],
  blazers: [
    { name: 'Navy Blue Blazer', brand: { id: '1', name: 'Louis Philippe', slug: 'louis-philippe', isActive: true }, rating: 4.7, reviewCount: 145 },
    { name: 'Charcoal Formal Blazer', brand: { id: '2', name: 'Van Heusen', slug: 'van-heusen', isActive: true }, rating: 4.5, reviewCount: 178 },
  ],
  pants: [
    { name: 'Slim Fit Trousers', brand: { id: '1', name: 'Louis Philippe', slug: 'louis-philippe', isActive: true }, rating: 4.4, reviewCount: 267 },
    { name: 'Formal Chinos', brand: { id: '2', name: 'Van Heusen', slug: 'van-heusen', isActive: true }, rating: 4.3, reviewCount: 198 },
    { name: 'Classic Fit Trousers', brand: { id: '3', name: 'Peter England', slug: 'peter-england', isActive: true }, rating: 4.5, reviewCount: 321 },
  ],
  footwear: [
    { name: 'Oxford Formal Shoes', brand: { id: '1', name: 'Bata', slug: 'bata', isActive: true }, rating: 4.4, reviewCount: 234 },
    { name: 'Derby Leather Shoes', brand: { id: '2', name: 'Red Chief', slug: 'red-chief', isActive: true }, rating: 4.6, reviewCount: 189 },
    { name: 'White Sneakers', brand: { id: '4', name: 'Puma', slug: 'puma', isActive: true }, rating: 4.5, reviewCount: 567 },
  ],
  watches: [
    { name: 'Classic Analog Watch', brand: { id: '1', name: 'Titan', slug: 'titan', isActive: true }, rating: 4.6, reviewCount: 456 },
    { name: 'Premium Chronograph', brand: { id: '2', name: 'Fossil', slug: 'fossil', isActive: true }, rating: 4.4, reviewCount: 234 },
  ],
  accessories: [
    { name: 'Leather Belt Premium', brand: { id: '1', name: 'Louis Vuitton', slug: 'louis-vuitton', isActive: true }, rating: 4.3, reviewCount: 123 },
    { name: 'Silk Tie', brand: { id: '2', name: 'Arrow', slug: 'arrow', isActive: true }, rating: 4.5, reviewCount: 89 },
  ],
};

function generateMockOutfitItem(
  category: string,
  slot: string,
  priceRange: { min: number; max: number }
): OutfitItem {
  const products = MOCK_PRODUCTS[category] || MOCK_PRODUCTS.shirts;
  const product = products[Math.floor(Math.random() * products.length)];
  const price = Math.floor(Math.random() * (priceRange.max - priceRange.min) + priceRange.min);
  const originalPrice = Math.floor(price * (1 + Math.random() * 0.5));
  const discount = Math.floor(((originalPrice - price) / originalPrice) * 100);
  
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    product: {
      id: `prod-${Date.now()}`,
      name: product.name || 'Product',
      slug: (product.name || 'product').toLowerCase().replace(/\s+/g, '-'),
      description: '',
      images: [{ id: '1', url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400', alt: product.name || 'Product', isPrimary: true, order: 1 }],
      brand: product.brand || { id: '1', name: 'Brand', slug: 'brand', isActive: true },
      category: { id: '1', name: category, slug: category, isActive: true },
      retailerPrices: [],
      specifications: [],
      rating: product.rating || 4.0,
      reviewCount: product.reviewCount || 100,
      inStock: true,
      isFeatured: true,
      isActive: true,
      lowestPrice: price,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    slot: slot as OutfitItem['slot'],
    price,
    originalPrice,
    discount,
    isPrimary: slot === 'top' || slot === 'dress',
    matchScore: 0.8 + Math.random() * 0.2,
    retailer: {
      id: 'ret-1',
      name: 'Amazon',
      slug: 'amazon',
      logo: 'https://logo.clearbit.com/amazon.com',
      url: 'https://amazon.com',
      isActive: true,
    },
  };
}

function generateOutfit(
  occasion: Occasion,
  category: OutfitCategory,
  priceRange: { min: number; max: number }
): Outfit {
  const slots = OUTFIT_SLOTS[occasion] || OUTFIT_SLOTS.casual;
  const items: OutfitItem[] = [];
  
  const categoryMap: Record<string, string> = {
    top: 'shirts',
    bottom: 'pants',
    outerwear: 'blazers',
    footwear: 'footwear',
    watch: 'watches',
    accessory: 'accessories',
    belt: 'accessories',
    tie: 'accessories',
    pocket_square: 'accessories',
    bag: 'accessories',
  };
  
  for (const slot of slots) {
    const productCategory = categoryMap[slot] || 'shirts';
    const slotPriceRange = {
      min: priceRange.min / (slots.length * 2),
      max: priceRange.max / (slots.length * 1.5),
    };
    items.push(generateMockOutfitItem(productCategory, slot, slotPriceRange));
  }
  
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const originalTotalPrice = items.reduce((sum, item) => sum + item.originalPrice, 0);
  const totalDiscount = Math.floor(((originalTotalPrice - totalPrice) / originalTotalPrice) * 100);
  
  const ratings = {
    style: 7 + Math.random() * 3,
    comfort: 7 + Math.random() * 3,
    trendScore: 6 + Math.random() * 4,
    popularity: 7 + Math.random() * 3,
    aiConfidence: 8 + Math.random() * 2,
    overall: 7 + Math.random() * 3,
  };
  
  const explanations = {
    whyItSuits: `This ${occasion} outfit perfectly balances style and functionality.`,
    colorMatching: 'The color palette has been carefully selected to complement each piece.',
    budgetFit: 'This outfit offers excellent value for money without compromising on style.',
    styleNotes: 'The silhouette flatters most body types.',
    trendAlignment: 'Modern and contemporary with classic touches.',
    bodyTypeSuitability: 'Works well for all body types.',
    skinToneRecommendation: 'Complements a wide range of skin tones.',
    weatherAppropriate: 'Comfortable for all-day wear.',
  };
  
  const crossSellItems: OutfitItem[] = [
    generateMockOutfitItem('accessories', 'perfume', { min: 500, max: 3000 }),
    generateMockOutfitItem('accessories', 'sunglasses', { min: 500, max: 5000 }),
  ];
  
  const occasionNames: Record<Occasion, string> = {
    casual: 'Casual Chic',
    formal: 'Formal Elegance',
    office: 'Office Professional',
    wedding: 'Wedding Guest',
    date: 'Date Night',
    party: 'Party Ready',
    sports: 'Sporty Style',
    beach: 'Beach Vibes',
    festival: 'Festival Look',
    college: 'Campus Style',
    interview: 'Interview Sharp',
    date_night: 'Romantic Evening',
    reception: 'Reception Glam',
    engagement: 'Engagement Ready',
    mehendi: 'Mehendi Celebration',
    ceremony: 'Ceremony Elegant',
  };
  
  const categoryNames: Record<OutfitCategory, string> = {
    best_selling: 'Best Sellers',
    budget_friendly: 'Budget Friendly',
    mid_range: 'Mid Range',
  };
  
  return {
    id: `outfit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${occasionNames[occasion]} - ${categoryNames[category]}`,
    description: `A complete ${occasion} outfit combining ${items.length} carefully selected pieces.`,
    category,
    occasion,
    items,
    totalPrice,
    originalTotalPrice,
    totalDiscount,
    aiExplanation: explanations,
    ratings,
    crossSellItems,
    isComplete: true,
    createdAt: new Date(),
  };
}

export async function getFashionRecommendations(
  userInput: string,
  context: FashionContext = {},
  includeCategories: OutfitCategory[] = ['best_selling', 'budget_friendly', 'mid_range'],
  limit: number = 15
): Promise<{
  success: boolean;
  outfits: Outfit[];
  totalCount: number;
  context: FashionContext;
  suggestedFollowUps: string[];
  missingInfo?: string[];
}> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const occasion = detectOccasion(userInput);
  const priceRange = determinePriceRange(userInput, context.budget);
  
  const outfits: Outfit[] = [];
  let count = 0;
  
  for (const category of includeCategories) {
    if (count >= limit) break;
    const outfitsPerCategory = Math.ceil((limit - count) / includeCategories.length);
    for (let i = 0; i < outfitsPerCategory && count < limit; i++) {
      outfits.push(generateOutfit(occasion, category, priceRange));
      count++;
    }
  }
  
  const suggestedFollowUps = generateFollowUpQuestions(occasion);
  
  const missingInfo: string[] = [];
  if (!context.gender) missingInfo.push('gender preference');
  if (!context.userProfile?.bodyType) missingInfo.push('body type');
  
  return {
    success: true,
    outfits,
    totalCount: outfits.length,
    context: { ...context, occasion },
    suggestedFollowUps,
    missingInfo: missingInfo.length > 0 ? missingInfo : undefined,
  };
}

function detectOccasion(input: string): Occasion {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('wedding') || lowerInput.includes('marriage') || lowerInput.includes('reception')) return 'wedding';
  if (lowerInput.includes('office') || lowerInput.includes('work') || lowerInput.includes('business')) return 'office';
  if (lowerInput.includes('date') || lowerInput.includes('romantic')) return 'date';
  if (lowerInput.includes('party') || lowerInput.includes('night')) return 'party';
  if (lowerInput.includes('college') || lowerInput.includes('campus') || lowerInput.includes('university')) return 'college';
  if (lowerInput.includes('festiv') || lowerInput.includes('diwali') || lowerInput.includes('holi')) return 'festival';
  if (lowerInput.includes('interview') || lowerInput.includes('job')) return 'interview';
  if (lowerInput.includes('formal') || lowerInput.includes('gala')) return 'formal';
  if (lowerInput.includes('beach') || lowerInput.includes('vacation') || lowerInput.includes('holiday')) return 'beach';
  if (lowerInput.includes('sports') || lowerInput.includes('gym') || lowerInput.includes('workout')) return 'sports';
  
  return 'casual';
}

function determinePriceRange(input: string, contextBudget?: { min?: number; max?: number }): { min: number; max: number } {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('budget') || lowerInput.includes('cheap') || lowerInput.includes('affordable')) {
    return { min: 500, max: 3000 };
  }
  if (lowerInput.includes('premium') || lowerInput.includes('luxury') || lowerInput.includes('expensive')) {
    return { min: 10000, max: 50000 };
  }
  if (lowerInput.includes('mid') || lowerInput.includes('moderate')) {
    return { min: 3000, max: 10000 };
  }
  
  const budgetMatch = lowerInput.match(/(\d+)\s*(?:k|thousand|l)/);
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1]) * 1000;
    return { min: amount * 0.5, max: amount * 1.5 };
  }
  
  const inrMatch = lowerInput.match(/Rs\.?\s*(\d+)/);
  if (inrMatch) {
    const amount = parseInt(inrMatch[1].replace(/,/g, ''));
    return { min: amount * 0.7, max: amount * 1.3 };
  }
  
  if (contextBudget) {
    return {
      min: contextBudget.min || 1000,
      max: contextBudget.max || 15000,
    };
  }
  
  return { min: 2000, max: 10000 };
}

function generateFollowUpQuestions(occasion: Occasion): string[] {
  const baseQuestions: Record<Occasion, string[]> = {
    wedding: ['Are you a guest or part of the wedding party?', 'What time is the wedding?'],
    office: ['What is your office dress code?', 'Do you need something for daily wear?'],
    casual: ['What kind of casual? Smart casual, street style, or relaxed?'],
    date: ['Casual dinner or special occasion?', 'Do you like bold colors or subtle tones?'],
    party: ['What kind of party? House party, club, or formal event?'],
    college: ['What is your personal style? Minimalist or expressive?'],
    festival: ['Which festival are you preparing for?', 'Traditional or fusion look?'],
    interview: ['What industry is the interview for?', 'Startup or corporate?'],
    formal: ['What is the dress code?', 'Do you need outerwear?'],
    beach: ['Beach party or resort wear?', 'Will you be swimming?'],
    sports: ['What sport or activity?', 'Gym wear or outdoor sports?'],
    date_night: ['Fine dining or casual date?', 'What is your partner style preference?'],
    reception: ['Whose reception is it?', 'Traditional or contemporary outfit?'],
    engagement: ['What is your relationship to the couple?', 'Indoor or outdoor venue?'],
    mehendi: ['Whose mehendi is it?', 'Traditional or fusion style?'],
    ceremony: ['What type of ceremony?', 'Day or evening event?'],
  };
  
  return baseQuestions[occasion] || [
    'What is your budget range?',
    'Any specific colors you prefer?',
  ];
}

// Conversation state management
let conversationState: FashionContextState = {
  messages: [],
  currentContext: {},
  conversationHistory: [],
};

export const fashionConversationService = {
  initializeConversation: () => {
    conversationState = {
      messages: [
        {
          id: 'system-1',
          role: 'system',
          content: 'Hi! I am your AI Fashion Stylist. Tell me what you are looking for and I will find perfect outfit combinations!',
          timestamp: new Date(),
        },
      ],
      currentContext: {},
      conversationHistory: [],
    };
    return conversationState.messages;
  },
  
  addMessage: (role: 'user' | 'assistant', content: string, recommendations?: Outfit[]) => {
    const message: FashionChatMessage = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
      recommendations,
    };
    conversationState.messages.push(message);
    conversationState.conversationHistory.push(content);
    return message;
  },
  
  updateContext: (context: Partial<FashionContext>) => {
    conversationState.currentContext = { ...conversationState.currentContext, ...context };
    return conversationState.currentContext;
  },
  
  getMessages: () => conversationState.messages,
  getContext: () => conversationState.currentContext,
};
