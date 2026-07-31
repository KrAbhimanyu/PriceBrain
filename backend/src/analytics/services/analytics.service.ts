import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AnalyticsEvent,
  FunnelMetrics,
  RAGMetrics,
  ConversionMetrics,
  ABTest,
  EventType,
  MetricType,
} from '../entities/analytics.entity';

export interface TrackEventOptions {
  userId?: string;
  sessionId?: string;
  productId?: string;
  orderId?: string;
  query?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referringUrl?: string;
  revenue?: number;
  currency?: string;
  properties?: Record<string, any>;
}

export interface DashboardFilters {
  startDate?: Date;
  endDate?: Date;
  period?: 'day' | 'week' | 'month';
  userId?: string;
  sessionId?: string;
}

export interface DashboardData {
  overview: {
    totalVisitors: number;
    totalSessions: number;
    totalSearches: number;
    productViews: number;
    addToCart: number;
    purchases: number;
    conversionRate: number;
    averageOrderValue: number;
    totalRevenue: number;
  };
  trends: {
    date: string;
    visitors: number;
    searches: number;
    conversions: number;
    revenue: number;
  }[];
  topProducts: {
    productId: string;
    views: number;
    carts: number;
    purchases: number;
  }[];
  searchAnalytics: {
    totalSearches: number;
    avgResultsPerSearch: number;
    topQueries: { query: string; count: number }[];
    zeroResultQueries: { query: string; count: number }[];
  };
  ragAnalytics: {
    totalQueries: number;
    avgResponseTime: number;
    avgSourcesRetrieved: number;
    avgRelevanceScore: number;
    helpfulRate: number;
  };
  funnelAnalysis: {
    step: string;
    count: number;
    dropoffRate: number;
  }[];
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private eventRepo: Repository<AnalyticsEvent>,
    @InjectRepository(FunnelMetrics)
    private funnelRepo: Repository<FunnelMetrics>,
    @InjectRepository(RAGMetrics)
    private ragRepo: Repository<RAGMetrics>,
    @InjectRepository(ConversionMetrics)
    private conversionRepo: Repository<ConversionMetrics>,
    @InjectRepository(ABTest)
    private abTestRepo: Repository<ABTest>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ============ EVENT TRACKING ============

  async trackEvent(eventType: EventType, options: TrackEventOptions = {}): Promise<AnalyticsEvent> {
    const event = this.eventRepo.create({
      eventType,
      userId: options.userId,
      sessionId: options.sessionId,
      productId: options.productId,
      orderId: options.orderId,
      query: options.query,
      source: options.source,
      medium: options.medium,
      campaign: options.campaign,
      referringUrl: options.referringUrl,
      revenue: options.revenue,
      currency: options.currency || 'INR',
      properties: options.properties,
    });

    const saved = await this.eventRepo.save(event);

    // Emit event for real-time processing
    this.eventEmitter.emit('analytics.event', { eventType, options });

    // Update conversion metrics in real-time
    await this.updateConversionMetrics(eventType);

    return saved;
  }

  // Convenience methods for common events
  async trackSearch(userId: string, sessionId: string, query: string, resultCount: number): Promise<void> {
    await this.trackEvent(EventType.SEARCH_QUERY, {
      userId,
      sessionId,
      query,
      properties: { resultCount },
    });
  }

  async trackProductView(userId: string, sessionId: string, productId: string): Promise<void> {
    await this.trackEvent(EventType.PRODUCT_VIEW, {
      userId,
      sessionId,
      productId,
    });
  }

  async trackAddToCart(userId: string, sessionId: string, productId: string, revenue?: number): Promise<void> {
    await this.trackEvent(EventType.PRODUCT_CART, {
      userId,
      sessionId,
      productId,
      revenue,
    });
  }

  async trackPurchase(userId: string, sessionId: string, orderId: string, revenue: number): Promise<void> {
    await this.trackEvent(EventType.PRODUCT_PURCHASE, {
      userId,
      sessionId,
      orderId,
      revenue,
    });
  }

  async trackCheckoutAbandon(userId: string, sessionId: string): Promise<void> {
    await this.trackEvent(EventType.CHECKOUT_ABANDON, {
      userId,
      sessionId,
    });
  }

  // ============ RAG METRICS ============

  async trackRAGQuery(data: {
    userId?: string;
    sessionId?: string;
    query: string;
    response: string;
    sourcesRetrieved: number;
    avgRelevanceScore: number;
    responseTimeMs: number;
    tokensUsed: number;
    embeddingTimeMs: number;
    retrievalTimeMs: number;
    generationTimeMs: number;
  }): Promise<RAGMetrics> {
    const metric = this.ragRepo.create(data);
    return this.ragRepo.save(metric);
  }

  async trackRAGFeedback(
    metricId: string,
    wasHelpful: boolean,
    clickedSourceId?: string,
    followUpQuery?: string,
  ): Promise<void> {
    await this.ragRepo.update(metricId, {
      wasHelpful,
      clickedSourceId,
      followUpQuery,
    });
  }

  // ============ CONVERSION METRICS ============

  private async updateConversionMetrics(eventType: EventType): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let metrics = await this.conversionRepo.findOne({
      where: {
        period: 'daily',
        periodStart: LessThan(today),
      },
      order: { periodEnd: 'DESC' },
    });

    if (!metrics) {
      metrics = this.conversionRepo.create({
        metricName: `Daily Metrics ${today.toISOString().split('T')[0]}`,
        metricType: MetricType.CONVERSION,
        period: 'daily',
        periodStart: today,
        periodEnd: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      });
    }

    switch (eventType) {
      case EventType.SESSION_START:
        metrics.sessions += 1;
        metrics.visitors += 1;
        break;
      case EventType.SEARCH_QUERY:
        metrics.searches += 1;
        break;
      case EventType.PRODUCT_VIEW:
        metrics.productViews += 1;
        break;
      case EventType.PRODUCT_CART:
        metrics.addToCart += 1;
        break;
      case EventType.CHECKOUT_START:
        metrics.checkouts += 1;
        break;
      case EventType.PRODUCT_PURCHASE:
        metrics.purchases += 1;
        break;
    }

    // Calculate rates
    if (metrics.visitors > 0) {
      metrics.conversionRate = (metrics.purchases / metrics.visitors) * 100;
      metrics.addToCartRate = (metrics.addToCart / metrics.visitors) * 100;
    }

    await this.conversionRepo.save(metrics);
  }

  // ============ DASHBOARD ============

  async getDashboard(filters: DashboardFilters = {}): Promise<DashboardData> {
    const { startDate, endDate } = this.getDateRange(filters);

    const [
      overview,
      trends,
      topProducts,
      searchAnalytics,
      ragAnalytics,
      funnelAnalysis,
    ] = await Promise.all([
      this.getOverviewMetrics(startDate, endDate),
      this.getTrendMetrics(startDate, endDate),
      this.getTopProducts(startDate, endDate),
      this.getSearchAnalytics(startDate, endDate),
      this.getRAGAnalytics(startDate, endDate),
      this.getFunnelAnalysis(startDate, endDate),
    ]);

    return {
      overview,
      trends,
      topProducts,
      searchAnalytics,
      ragAnalytics,
      funnelAnalysis,
    };
  }

  private async getOverviewMetrics(startDate: Date, endDate: Date): Promise<DashboardData['overview']> {
    const events = await this.eventRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const visitors = new Set(events.filter((e) => e.userId).map((e) => e.userId)).size;
    const sessions = new Set(events.filter((e) => e.sessionId).map((e) => e.sessionId)).size;
    const searches = events.filter((e) => e.eventType === EventType.SEARCH_QUERY).length;
    const productViews = events.filter((e) => e.eventType === EventType.PRODUCT_VIEW).length;
    const addToCart = events.filter((e) => e.eventType === EventType.PRODUCT_CART).length;
    const purchases = events.filter((e) => e.eventType === EventType.PRODUCT_PURCHASE).length;
    const totalRevenue = events
      .filter((e) => e.revenue)
      .reduce((sum, e) => sum + (e.revenue || 0), 0);

    return {
      totalVisitors: visitors,
      totalSessions: sessions,
      totalSearches: searches,
      productViews,
      addToCart,
      purchases,
      conversionRate: visitors > 0 ? (purchases / visitors) * 100 : 0,
      averageOrderValue: purchases > 0 ? totalRevenue / purchases : 0,
      totalRevenue,
    };
  }

  private async getTrendMetrics(startDate: Date, endDate: Date): Promise<DashboardData['trends']> {
    const events = await this.eventRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const dailyData = new Map<string, { visitors: Set<string>; searches: number; conversions: number; revenue: number }>();

    events.forEach((e) => {
      const date = e.createdAt.toISOString().split('T')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, { visitors: new Set(), searches: 0, conversions: 0, revenue: 0 });
      }
      const day = dailyData.get(date)!;
      if (e.userId) day.visitors.add(e.userId);
      if (e.eventType === EventType.SEARCH_QUERY) day.searches++;
      if (e.eventType === EventType.PRODUCT_PURCHASE) {
        day.conversions++;
        day.revenue += e.revenue || 0;
      }
    });

    return Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        visitors: data.visitors.size,
        searches: data.searches,
        conversions: data.conversions,
        revenue: data.revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getTopProducts(startDate: Date, endDate: Date): Promise<DashboardData['topProducts']> {
    const events = await this.eventRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
        productId: Not(IsNull()),
      },
    });

    const productStats = new Map<
      string,
      { views: number; carts: number; purchases: number }
    >();

    events.forEach((e) => {
      if (!e.productId) return;
      if (!productStats.has(e.productId)) {
        productStats.set(e.productId, { views: 0, carts: 0, purchases: 0 });
      }
      const stats = productStats.get(e.productId)!;
      switch (e.eventType) {
        case EventType.PRODUCT_VIEW:
          stats.views++;
          break;
        case EventType.PRODUCT_CART:
          stats.carts++;
          break;
        case EventType.PRODUCT_PURCHASE:
          stats.purchases++;
          break;
      }
    });

    return Array.from(productStats.entries())
      .map(([productId, stats]) => ({ productId, ...stats }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  private async getSearchAnalytics(startDate: Date, endDate: Date): Promise<DashboardData['searchAnalytics']> {
    const searchEvents = await this.eventRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
        eventType: EventType.SEARCH_QUERY,
      },
    });

    const queryCounts = new Map<string, number>();
    let totalResults = 0;

    searchEvents.forEach((e) => {
      const query = e.query?.toLowerCase() || '';
      queryCounts.set(query, (queryCounts.get(query) || 0) + 1);
      totalResults += e.properties?.resultCount || 0;
    });

    const zeroResultQueries = Array.from(queryCounts.entries())
      .filter(([query]) => {
        const event = searchEvents.find((e) => e.query?.toLowerCase() === query);
        return event?.properties?.resultCount === 0;
      })
      .map(([query, count]) => ({ query, count }));

    return {
      totalSearches: searchEvents.length,
      avgResultsPerSearch: searchEvents.length > 0 ? totalResults / searchEvents.length : 0,
      topQueries: Array.from(queryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count })),
      zeroResultQueries: zeroResultQueries.slice(0, 10),
    };
  }

  private async getRAGAnalytics(startDate: Date, endDate: Date): Promise<DashboardData['ragAnalytics']> {
    const ragMetrics = await this.ragRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    if (ragMetrics.length === 0) {
      return {
        totalQueries: 0,
        avgResponseTime: 0,
        avgSourcesRetrieved: 0,
        avgRelevanceScore: 0,
        helpfulRate: 0,
      };
    }

    const helpfulCount = ragMetrics.filter((m) => m.wasHelpful).length;

    return {
      totalQueries: ragMetrics.length,
      avgResponseTime: ragMetrics.reduce((sum, m) => sum + m.responseTimeMs, 0) / ragMetrics.length,
      avgSourcesRetrieved: ragMetrics.reduce((sum, m) => sum + m.sourcesRetrieved, 0) / ragMetrics.length,
      avgRelevanceScore: ragMetrics.reduce((sum, m) => sum + m.avgRelevanceScore, 0) / ragMetrics.length,
      helpfulRate: (helpfulCount / ragMetrics.length) * 100,
    };
  }

  private async getFunnelAnalysis(startDate: Date, endDate: Date): Promise<DashboardData['funnelAnalysis']> {
    const events = await this.eventRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const funnelSteps = [
      { name: 'Visit', event: EventType.SESSION_START },
      { name: 'Search', event: EventType.SEARCH_QUERY },
      { name: 'Product View', event: EventType.PRODUCT_VIEW },
      { name: 'Add to Cart', event: EventType.PRODUCT_CART },
      { name: 'Checkout', event: EventType.CHECKOUT_START },
      { name: 'Purchase', event: EventType.PRODUCT_PURCHASE },
    ];

    const counts = new Map<EventType, number>();
    funnelSteps.forEach((step) => {
      counts.set(
        step.event,
        events.filter((e) => e.eventType === step.event).length,
      );
    });

    return funnelSteps.map((step, index) => {
      const count = counts.get(step.event) || 0;
      const prevCount = index > 0 ? counts.get(funnelSteps[index - 1].event) || 0 : count;
      const dropoffRate = prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0;

      return {
        step: step.name,
        count,
        dropoffRate,
      };
    });
  }

  // ============ A/B TESTING ============

  async createABTest(test: Partial<ABTest>): Promise<ABTest> {
    const abTest = this.abTestRepo.create({
      ...test,
      status: 'active',
      startDate: new Date(),
    });
    return this.abTestRepo.save(abTest);
  }

  async getABTest(testId: string): Promise<ABTest | null> {
    return this.abTestRepo.findOne({ where: { id: testId } });
  }

  async getActiveTests(): Promise<ABTest[]> {
    return this.abTestRepo.find({ where: { status: 'active' } });
  }

  async trackABTestVariant(testId: string, variant: string): Promise<void> {
    const test = await this.getABTest(testId);
    if (!test || !test.variants[variant]) return;

    test.variants[variant].impressions =
      (test.variants[variant].impressions || 0) + 1;
    test.sampleSize += 1;

    await this.abTestRepo.save(test);
  }

  async trackABTestConversion(testId: string, variant: string): Promise<void> {
    const test = await this.getABTest(testId);
    if (!test || !test.variants[variant]) return;

    test.variants[variant].conversions =
      (test.variants[variant].conversions || 0) + 1;

    // Calculate significance
    await this.calculateTestSignificance(test);

    await this.abTestRepo.save(test);
  }

  private async calculateTestSignificance(test: ABTest): Promise<void> {
    const variants = Object.keys(test.variants);
    if (variants.length < 2) return;

    const control = test.variants[variants[0]];
    const treatment = test.variants[variants[1]];

    if (!control || !treatment) return;

    const controlRate = control.impressions > 0 ? control.conversions / control.impressions : 0;
    const treatmentRate = treatment.impressions > 0 ? treatment.conversions / treatment.impressions : 0;

    // Simple z-score approximation
    const pooledRate = (control.conversions + treatment.conversions) /
                       (control.impressions + treatment.impressions);
    const se = Math.sqrt(pooledRate * (1 - pooledRate) * 
                        (1/control.impressions + 1/treatment.impressions));
    
    const zScore = se > 0 ? Math.abs(treatmentRate - controlRate) / se : 0;
    
    // 95% confidence = z-score > 1.96
    test.confidenceLevel = this.normalCDF(zScore) * 100;

    if (test.confidenceLevel > 95) {
      test.winner = treatmentRate > controlRate ? variants[1] : variants[0];
    }
  }

  private normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  // ============ HELPERS ============

  private getDateRange(filters: DashboardFilters): { startDate: Date; endDate: Date } {
    const endDate = filters.endDate || new Date();
    let startDate = filters.startDate;

    if (!startDate) {
      const period = filters.period || 'week';
      startDate = new Date();
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }
    }

    return { startDate, endDate };
  }
}

import { Not, IsNull } from 'typeorm';
