import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EventType {
  // Search Events
  SEARCH_QUERY = 'search_query',
  SEARCH_RESULT_CLICK = 'search_result_click',
  SEARCH_REFINE = 'search_refine',
  
  // Product Events
  PRODUCT_VIEW = 'product_view',
  PRODUCT_COMPARE = 'product_compare',
  PRODUCT_WISHLIST = 'product_wishlist',
  PRODUCT_CART = 'product_cart',
  PRODUCT_PURCHASE = 'product_purchase',
  
  // RAG Events
  RAG_QUERY = 'rag_query',
  RAG_RECOMMENDATION_CLICK = 'rag_recommendation_click',
  RAG_SOURCE_VIEW = 'rag_source_view',
  
  // AI Chat Events
  CHAT_MESSAGE = 'chat_message',
  CHAT_CONVERSATION_START = 'chat_conversation_start',
  CHAT_CONVERSATION_END = 'chat_conversation_end',
  
  // Conversion Events
  CHECKOUT_START = 'checkout_start',
  CHECKOUT_COMPLETE = 'checkout_complete',
  CHECKOUT_ABANDON = 'checkout_abandon',
  
  // User Events
  PAGE_VIEW = 'page_view',
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
}

export enum MetricType {
  CONVERSION = 'conversion',
  ENGAGEMENT = 'engagement',
  PERFORMANCE = 'performance',
  REVENUE = 'revenue',
  SEARCH = 'search',
}

@Entity('analytics_events')
@Index(['eventType', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['sessionId', 'createdAt'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EventType })
  eventType: EventType;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>;

  @Column({ nullable: true })
  productId: string;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  query: string;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  medium: string;

  @Column({ nullable: true })
  campaign: string;

  @Column({ nullable: true })
  referringUrl: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ type: 'float', nullable: true })
  revenue: number;

  @Column({ nullable: true })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('funnel_metrics')
export class FunnelMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  funnelName: string;

  @Column({ type: 'int' })
  step: number;

  @Column()
  stepName: string;

  @Column({ type: 'int', default: 0 })
  totalCount: number;

  @Column({ type: 'int', default: 0 })
  uniqueUsers: number;

  @Column({ type: 'float', default: 0 })
  conversionRate: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('rag_metrics')
export class RAGMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ type: 'text' })
  query: string;

  @Column({ type: 'text' })
  response: string;

  @Column({ type: 'int', default: 0 })
  sourcesRetrieved: number;

  @Column({ type: 'float', default: 0 })
  avgRelevanceScore: number;

  @Column({ type: 'int', default: 0 })
  responseTimeMs: number;

  @Column({ type: 'int', default: 0 })
  tokensUsed: number;

  @Column({ type: 'float', default: 0 })
  embeddingTimeMs: number;

  @Column({ type: 'float', default: 0 })
  retrievalTimeMs: number;

  @Column({ type: 'float', default: 0 })
  generationTimeMs: number;

  @Column({ nullable: true })
  clickedSourceId: string;

  @Column({ default: false })
  wasHelpful: boolean;

  @Column({ nullable: true })
  followUpQuery: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('conversion_metrics')
export class ConversionMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  metricName: string;

  @Column({ type: 'enum', enum: MetricType })
  metricType: MetricType;

  @Column({ type: 'int', default: 0 })
  visitors: number;

  @Column({ type: 'int', default: 0 })
  sessions: number;

  @Column({ type: 'int', default: 0 })
  searches: number;

  @Column({ type: 'int', default: 0 })
  productViews: number;

  @Column({ type: 'int', default: 0 })
  addToCart: number;

  @Column({ type: 'int', default: 0 })
  checkouts: number;

  @Column({ type: 'int', default: 0 })
  purchases: number;

  @Column({ type: 'int', default: 0 })
  conversions: number;

  @Column({ type: 'float', default: 0 })
  conversionRate: number;

  @Column({ type: 'float', default: 0 })
  addToCartRate: number;

  @Column({ type: 'float', default: 0 })
  abandonmentRate: number;

  @Column({ type: 'float', default: 0 })
  averageOrderValue: number;

  @Column({ type: 'float', default: 0 })
  totalRevenue: number;

  @Column({ nullable: true })
  periodStart: Date;

  @Column({ nullable: true })
  periodEnd: Date;

  @Column({ nullable: true })
  period: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('ab_tests')
export class ABTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  testName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['active', 'paused', 'completed'] })
  status: 'active' | 'paused' | 'completed';

  @Column({ type: 'jsonb', default: {} })
  variants: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  metrics: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  sampleSize: number;

  @Column({ type: 'float', default: 0 })
  confidenceLevel: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  winner: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
