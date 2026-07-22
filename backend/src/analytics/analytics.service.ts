import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import { SearchLog } from '../search/entities/search-log.entity';
import { ClickTracking } from '../affiliate/entities/click-tracking.entity';

export interface AnalyticsData {
  totalSearches: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  topSearches: Array<{ query: string; count: number }>;
  topProducts: Array<{ productId: string; clicks: number; conversions: number }>;
  clicksByDay: Array<{ date: string; clicks: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
}

export interface DailyStats {
  date: string;
  searches: number;
  clicks: number;
  pageViews: number;
  conversions: number;
  revenue: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(SearchLog)
    private searchLogRepository: Repository<SearchLog>,
    @InjectRepository(ClickTracking)
    private clickTrackingRepository: Repository<ClickTracking>,
  ) {}

  async getOverview(days = 30): Promise<AnalyticsData> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [searches, clicks] = await Promise.all([
      this.searchLogRepository.find({
        where: { createdAt: MoreThan(startDate) },
      }),
      this.clickTrackingRepository.find({
        where: { createdAt: MoreThan(startDate) },
      }),
    ]);

    const totalSearches = searches.length;
    const totalClicks = clicks.length;

    // Calculate top searches
    const searchCounts = new Map<string, number>();
    searches.forEach((s) => {
      const count = searchCounts.get(s.query) || 0;
      searchCounts.set(s.query, count + 1);
    });
    const topSearches = Array.from(searchCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate top products by clicks
    const productClicks = new Map<string, number>();
    clicks.forEach((c) => {
      const count = productClicks.get(c.productId || '') || 0;
      productClicks.set(c.productId || '', count + 1);
    });
    const topProducts = Array.from(productClicks.entries())
      .filter(([id]) => id)
      .map(([productId, clicks]) => ({ productId, clicks, conversions: 0 }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // Calculate clicks by day
    const clicksByDay = this.groupByDay(clicks).map(item => ({ date: item.date, clicks: item.count }));
    const revenueByDay: Array<{ date: string; revenue: number }> = [];

    return {
      totalSearches,
      totalClicks,
      totalConversions: 0,
      totalRevenue: 0,
      topSearches,
      topProducts,
      clicksByDay,
      revenueByDay,
    };
  }

  async getDailyStats(days = 7): Promise<DailyStats[]> {
    const stats: DailyStats[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [searches, clicks] = await Promise.all([
        this.searchLogRepository.find({
          where: { createdAt: Between(startOfDay, endOfDay) },
        }),
        this.clickTrackingRepository.find({
          where: { createdAt: Between(startOfDay, endOfDay) },
        }),
      ]);

      stats.push({
        date: startOfDay.toISOString().split('T')[0],
        searches: searches.length,
        clicks: clicks.length,
        pageViews: clicks.length * 3, // Estimate
        conversions: 0,
        revenue: 0,
      });
    }

    return stats;
  }

  async trackSearch(query: string, userId?: string, ipAddress?: string): Promise<void> {
    try {
      await this.searchLogRepository.save({
        query,
        userId,
        ipAddress,
        resultsCount: 0,
      });
    } catch {
      // Silently fail - analytics should not break main functionality
    }
  }

  async trackClick(
    productId: string,
    retailerPriceId: string,
    userId?: string,
    ipAddress?: string,
  ): Promise<void> {
    try {
      await this.clickTrackingRepository.save({
        productId,
        retailerPriceId,
        userId,
        ipAddress,
      });
    } catch {
      // Silently fail
    }
  }

  private groupByDay<T extends { createdAt: Date }>(items: T[]): Array<{ date: string; count: number }> {
    const byDay = new Map<string, number>();

    items.forEach((item) => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      const count = byDay.get(date) || 0;
      byDay.set(date, count + 1);
    });

    return Array.from(byDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getProductAnalytics(productId: string): Promise<{
    totalClicks: number;
    clicksByDay: Array<{ date: string; clicks: number }>;
    topRetailers: Array<{ retailer: string; clicks: number }>;
  }> {
    const clicks = await this.clickTrackingRepository.find({
      where: { productId },
    });

    const clicksByDay = this.groupByDay(clicks).map(item => ({ date: item.date, clicks: item.count }));

    // Group by retailer
    const byRetailer = new Map<string, number>();
    // Note: In real implementation, we'd join with retailer prices
    clicks.forEach((c) => {
      const count = byRetailer.get('Unknown') || 0;
      byRetailer.set('Unknown', count + 1);
    });

    const topRetailers = Array.from(byRetailer.entries())
      .map(([retailer, clicks]) => ({ retailer, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    return {
      totalClicks: clicks.length,
      clicksByDay,
      topRetailers,
    };
  }

  async getSearchAnalytics(query?: string): Promise<{
    totalSearches: number;
    searchesByDay: Array<{ date: string; searches: number }>;
    avgResultsCount: number;
  }> {
    const where = query ? { query } : {};
    const searches = await this.searchLogRepository.find({ where });

    const searchesByDay = this.groupByDay(searches).map(item => ({ date: item.date, searches: item.count }));
    const avgResultsCount = searches.length > 0
      ? searches.reduce((sum, s) => sum + (s.resultsCount || 0), 0) / searches.length
      : 0;

    return {
      totalSearches: searches.length,
      searchesByDay,
      avgResultsCount,
    };
  }
}
