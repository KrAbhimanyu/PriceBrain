import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum RecommendationAction {
  BUY_NOW = 'buy_now',
  WAIT = 'wait',
  SKIP = 'skip',
  BUY_LATER = 'buy_later',
  BUY_USED = 'buy_used',
  BUY_PREMIUM = 'buy_premium',
  BUY_BUDGET = 'buy_budget',
}

export enum ProductTrustLevel {
  HIGHLY_TRUSTED = 'highly_trusted',
  TRUSTED = 'trusted',
  NEUTRAL = 'neutral',
  UNTRUSTED = 'untrusted',
  AVOID = 'avoid',
}

export enum DealQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  BAD = 'bad',
}

@Entity('askbrain_recommendation')
@Index(['userId', 'createdAt'])
export class AskBrainRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  productId: string;

  @Column({ nullable: true })
  productName: string;

  @Column({ type: 'enum', enum: RecommendationAction })
  recommendedAction: RecommendationAction;

  @Column({ type: 'float' })
  dealScore: number;

  @Column({ type: 'float' })
  trustScore: number;

  @Column({ type: 'float' })
  valueScore: number;

  @Column({ type: 'float', nullable: true })
  currentPrice: number;

  @Column({ type: 'float', nullable: true })
  bestPrice: number;

  @Column({ type: 'float', nullable: true })
  predictedPrice: number;

  @Column({ nullable: true })
  predictedPriceDate: Date;

  @Column({ nullable: true })
  priceDropPercentage: number;

  @Column({ nullable: true })
  bestSellerId: string;

  @Column({ nullable: true })
  bestSellerName: string;

  @Column({ type: 'jsonb', nullable: true })
  reasons: string[];

  @Column({ type: 'jsonb', nullable: true })
  pros: string[];

  @Column({ type: 'jsonb', nullable: true })
  cons: string[];

  @Column({ type: 'jsonb', nullable: true })
  risks: string[];

  @Column({ type: 'jsonb', nullable: true })
  alternatives: {
    productId: string;
    name: string;
    reason: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  accessories: {
    productId: string;
    name: string;
    reason: string;
    essential: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  bundles: {
    name: string;
    products: string[];
    totalPrice: number;
    savings: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  coupons: {
    code: string;
    discount: string;
    expiresAt: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  cashbackOffers: {
    platform: string;
    percentage: number;
    maxAmount: number;
  }[];

  @Column({ nullable: true })
  fakeDiscountDetected: boolean;

  @Column({ type: 'float', nullable: true })
  actualDiscount: number;

  @Column({ type: 'enum', enum: ProductTrustLevel, default: ProductTrustLevel.NEUTRAL })
  trustLevel: ProductTrustLevel;

  @Column({ type: 'enum', enum: DealQuality, nullable: true })
  dealQuality: DealQuality;

  @Column({ nullable: true })
  confidenceLevel: number;

  @Column({ nullable: true })
  uncertaintyFactors: string[];

  @Column({ nullable: true })
  explanation: string;

  @Column({ nullable: true })
  contextUsed: string;

  @Column({ nullable: true })
  expertPerspective: string;

  @Column({ type: 'boolean', default: false })
  viewed: boolean;

  @Column({ type: 'boolean', default: false })
  clicked: boolean;

  @Column({ type: 'boolean', default: false })
  purchased: boolean;

  @Column({ type: 'boolean', default: false })
  wishlisted: boolean;

  @Column({ type: 'boolean', default: false })
  dismissed: boolean;

  @Column({ nullable: true })
  feedback: string;

  @Column({ type: 'int', default: 0 })
  satisfactionScore: number;

  @Column({ nullable: true })
  purchasedAt: Date;

  @Column({ nullable: true })
  returnedAt: Date;

  @Column({ nullable: true })
  returnReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('askbrain_outfit_recommendation')
export class AskBrainOutfitRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ nullable: true })
  occasion: string;

  @Column({ nullable: true })
  dressCode: string;

  @Column({ nullable: true })
  season: string;

  @Column({ nullable: true })
  weather: string;

  @Column({ type: 'jsonb' })
  outfit: {
    category: string;
    productId: string;
    name: string;
    price: number;
    brand: string;
    color: string;
    reason: string;
    essential: boolean;
  }[];

  @Column({ type: 'float' })
  totalPrice: number;

  @Column({ type: 'float', nullable: true })
  budgetRemaining: number;

  @Column({ type: 'jsonb', nullable: true })
  colorMatching: string[];

  @Column({ type: 'jsonb', nullable: true })
  fabricMatching: string[];

  @Column({ nullable: true })
  styleDescription: string;

  @Column({ nullable: true })
  tips: string[];

  @Column({ type: 'jsonb', nullable: true })
  alternatives: any[];

  @Column({ nullable: true })
  explanation: string;

  @Column({ type: 'boolean', default: false })
  saved: boolean;

  @Column({ type: 'boolean', default: false })
  liked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('askbrain_price_history')
export class AskBrainPriceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  productId: string;

  @Column({ nullable: true })
  retailerId: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ nullable: true })
  originalPrice: number;

  @Column({ nullable: true })
  discountPercentage: number;

  @Column({ nullable: true })
  priceChange: number;

  @Column({ nullable: true })
  lowestPrice: number;

  @Column({ nullable: true })
  highestPrice: number;

  @Column({ nullable: true })
  averagePrice: number;

  @Column({ nullable: true })
  priceDropAlert: boolean;

  @Column({ nullable: true })
  festivalSaleDetected: boolean;

  @Column({ nullable: true })
  fakeDiscountDetected: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('askbrain_fake_review')
export class AskBrainFakeReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column()
  reviewId: string;

  @Column({ type: 'float' })
  fakeProbability: number;

  @Column({ type: 'jsonb', nullable: true })
  suspiciousPatterns: string[];

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  recommendation: string;

  @CreateDateColumn()
  createdAt: Date;
}
