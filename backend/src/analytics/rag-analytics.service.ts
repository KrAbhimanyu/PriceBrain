import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface RAGQueryMetric {
  id: string;
  query: string;
  response: string;
  sourcesRetrieved: number;
  avgRelevanceScore: number;
  responseTimeMs: number;
  tokensUsed: number;
  embeddingTimeMs: number;
  retrievalTimeMs: number;
  generationTimeMs: number;
  wasHelpful: boolean;
  clickedSourceId: string;
  createdAt: Date;
}

export interface RAGAnalyticsSummary {
  totalQueries: number;
  avgResponseTime: number;
  avgSourcesRetrieved: number;
  avgRelevanceScore: number;
  helpfulRate: number;
  topQueries: { query: string; count: number }[];
  zeroResultRate: number;
  responseTimeDistribution: { bucket: string; count: number }[];
  dailyTrends: { date: string; queries: number; avgResponseTime: number; helpfulRate: number }[];
  conversionMetrics: {
    queriesWithClicks: number;
    queriesLeadingToCart: number;
    queriesLeadingToPurchase: number;
    attributionRate: number;
  };
}

export interface RAGConversionMetrics {
  totalRAGQueries: number;
  queriesWithProductClick: number;
  queriesWithAddToCart: number;
  queriesWithPurchase: number;
  attributionRate: number;
  revenueAttributed: number;
}

// In-memory store for RAG metrics (in production, use proper storage)
const ragMetricsStore: RAGQueryMetric[] = [];
const ragUserSessions = new Map<string, { queryTime: Date; clickedProducts: Set<string> }>();

@Injectable()
export class RAGAnalyticsService {
  private readonly logger = new Logger(RAGAnalyticsService.name);
  private readonly maxStoredMetrics = 10000;

  constructor(private eventEmitter: EventEmitter2) {
    // Listen to RAG events from the orchestration service
    this.eventEmitter.on('rag.query', (data) => this.trackRAGQuery(data));
    this.eventEmitter.on('rag.feedback', (data) => this.trackRAGFeedback(data));
  }

  // ============ TRACKING ============

  trackRAGQuery(data: {
    query: string;
    response: string;
    sourcesRetrieved: number;
    avgRelevanceScore: number;
    responseTimeMs: number;
    tokensUsed: number;
    embeddingTimeMs: number;
    retrievalTimeMs: number;
    generationTimeMs: number;
    userId?: string;
  }): RAGQueryMetric {
    const metric: RAGQueryMetric = {
      id: `rag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      wasHelpful: false,
      clickedSourceId: '',
      createdAt: new Date(),
    };

    // Store metric
    ragMetricsStore.push(metric);
    if (ragMetricsStore.length > this.maxStoredMetrics) {
      ragMetricsStore.shift();
    }

    // Track user session for attribution
    if (data.userId) {
      ragUserSessions.set(data.userId, {
        queryTime: new Date(),
        clickedProducts: new Set(),
      });
    }

    this.logger.debug(`Tracked RAG query: ${data.query.substring(0, 50)}...`);
    return metric;
  }

  trackRAGFeedback(
    metricId: string,
    wasHelpful: boolean,
    clickedSourceId?: string,
    followUpQuery?: string,
  ): void {
    const metric = ragMetricsStore.find((m) => m.id === metricId);
    if (metric) {
      metric.wasHelpful = wasHelpful;
      if (clickedSourceId) {
        metric.clickedSourceId = clickedSourceId;
      }
    }
  }

  trackProductClick(userId: string, productId: string): void {
    const session = ragUserSessions.get(userId);
    if (session) {
      session.clickedProducts.add(productId);
    }
  }

  // ============ ANALYTICS ============

  async getSummary(days = 7): Promise<RAGAnalyticsSummary> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const recentMetrics = ragMetricsStore.filter((m) => m.createdAt >= startDate);

    if (recentMetrics.length === 0) {
      return this.getEmptySummary();
    }

    // Calculate metrics
    const totalQueries = recentMetrics.length;
    const avgResponseTime =
      recentMetrics.reduce((sum, m) => sum + m.responseTimeMs, 0) / totalQueries;
    const avgSourcesRetrieved =
      recentMetrics.reduce((sum, m) => sum + m.sourcesRetrieved, 0) / totalQueries;
    const avgRelevanceScore =
      recentMetrics.reduce((sum, m) => sum + m.avgRelevanceScore, 0) / totalQueries;
    const helpfulCount = recentMetrics.filter((m) => m.wasHelpful).length;
    const helpfulRate = (helpfulCount / totalQueries) * 100;

    // Top queries
    const queryCounts = new Map<string, number>();
    recentMetrics.forEach((m) => {
      const normalizedQuery = m.query.toLowerCase().trim();
      queryCounts.set(normalizedQuery, (queryCounts.get(normalizedQuery) || 0) + 1);
    });
    const topQueries = Array.from(queryCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Zero result rate
    const zeroResultCount = recentMetrics.filter((m) => m.sourcesRetrieved === 0).length;
    const zeroResultRate = (zeroResultCount / totalQueries) * 100;

    // Response time distribution
    const responseTimeDistribution = this.getResponseTimeDistribution(recentMetrics);

    // Daily trends
    const dailyTrends = this.getDailyTrends(recentMetrics);

    return {
      totalQueries,
      avgResponseTime,
      avgSourcesRetrieved,
      avgRelevanceScore,
      helpfulRate,
      topQueries,
      zeroResultRate,
      responseTimeDistribution,
      dailyTrends,
      conversionMetrics: this.getConversionMetrics(),
    };
  }

  async getConversionMetrics(): Promise<RAGConversionMetrics> {
    // Calculate attribution metrics based on user sessions
    let queriesWithProductClick = 0;
    let queriesLeadingToCart = 0;
    let queriesLeadingToPurchase = 0;

    ragUserSessions.forEach((session) => {
      if (session.clickedProducts.size > 0) queriesWithProductClick++;
      // In real implementation, track cart and purchase events
    });

    const totalRAGQueries = ragMetricsStore.length;

    return {
      totalRAGQueries,
      queriesWithProductClick,
      queriesLeadingToCart,
      queriesLeadingToPurchase,
      attributionRate: totalRAGQueries > 0 ? (queriesWithProductClick / totalRAGQueries) * 100 : 0,
      revenueAttributed: 0, // Would need integration with order system
    };
  }

  async getQueryHistory(userId?: string, limit = 50): Promise<RAGQueryMetric[]> {
    let metrics = [...ragMetricsStore].reverse();

    if (userId) {
      // Filter by user (would need userId in metric in real implementation)
      metrics = metrics.slice(0, 100);
    }

    return metrics.slice(0, limit);
  }

  async getPerformanceMetrics(): Promise<{
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    successRate: number;
  }> {
    const responseTimes = ragMetricsStore
      .filter((m) => m.responseTimeMs > 0)
      .map((m) => m.responseTimeMs)
      .sort((a, b) => a - b);

    if (responseTimes.length === 0) {
      return { p50ResponseTime: 0, p95ResponseTime: 0, p99ResponseTime: 0, successRate: 0 };
    }

    const p50Index = Math.floor(responseTimes.length * 0.5);
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    const successCount = ragMetricsStore.filter(
      (m) => m.sourcesRetrieved > 0 && m.responseTimeMs < 5000,
    ).length;

    return {
      p50ResponseTime: responseTimes[p50Index] || 0,
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      successRate: (successCount / ragMetricsStore.length) * 100,
    };
  }

  // ============ HELPERS ============

  private getEmptySummary(): RAGAnalyticsSummary {
    return {
      totalQueries: 0,
      avgResponseTime: 0,
      avgSourcesRetrieved: 0,
      avgRelevanceScore: 0,
      helpfulRate: 0,
      topQueries: [],
      zeroResultRate: 0,
      responseTimeDistribution: [],
      dailyTrends: [],
      conversionMetrics: {
        queriesWithClicks: 0,
        queriesLeadingToCart: 0,
        queriesLeadingToPurchase: 0,
        attributionRate: 0,
      },
    };
  }

  private getResponseTimeDistribution(
    metrics: RAGQueryMetric[],
  ): { bucket: string; count: number }[] {
    const buckets = [
      { label: '< 100ms', min: 0, max: 100 },
      { label: '100-250ms', min: 100, max: 250 },
      { label: '250-500ms', min: 250, max: 500 },
      { label: '500-1000ms', min: 500, max: 1000 },
      { label: '1-2s', min: 1000, max: 2000 },
      { label: '> 2s', min: 2000, max: Infinity },
    ];

    return buckets.map((bucket) => ({
      bucket: bucket.label,
      count: metrics.filter(
        (m) => m.responseTimeMs >= bucket.min && m.responseTimeMs < bucket.max,
      ).length,
    }));
  }

  private getDailyTrends(
    metrics: RAGQueryMetric[],
  ): { date: string; queries: number; avgResponseTime: number; helpfulRate: number }[] {
    const byDay = new Map<
      string,
      { queries: RAGQueryMetric[] }
    >();

    metrics.forEach((m) => {
      const date = m.createdAt.toISOString().split('T')[0];
      if (!byDay.has(date)) {
        byDay.set(date, { queries: [] });
      }
      byDay.get(date)!.queries.push(m);
    });

    return Array.from(byDay.entries())
      .map(([date, data]) => {
        const queries = data.queries;
        return {
          date,
          queries: queries.length,
          avgResponseTime:
            queries.reduce((sum, m) => sum + m.responseTimeMs, 0) / queries.length,
          helpfulRate:
            (queries.filter((m) => m.wasHelpful).length / queries.length) * 100,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
