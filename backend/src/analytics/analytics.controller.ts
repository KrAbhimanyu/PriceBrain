import { Controller, Get, Post, Query, Param, Body, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService, AnalyticsData, DailyStats } from './analytics.service';
import { RAGAnalyticsService, RAGAnalyticsSummary } from './rag-analytics.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventType } from './entities/analytics.entity';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly ragAnalyticsService: RAGAnalyticsService,
  ) {}

  // ============ GENERAL ANALYTICS ============

  @Get('overview')
  @ApiOperation({ summary: 'Get analytics overview' })
  async getOverview(@Query('days') days?: number): Promise<AnalyticsData> {
    return this.analyticsService.getOverview(days || 30);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily statistics' })
  async getDailyStats(@Query('days') days?: number): Promise<DailyStats[]> {
    return this.analyticsService.getDailyStats(days || 7);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get product analytics' })
  async getProductAnalytics(@Param('productId') productId: string) {
    return this.analyticsService.getProductAnalytics(productId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Get search analytics' })
  async getSearchAnalytics(@Query('query') query?: string) {
    return this.analyticsService.getSearchAnalytics(query);
  }

  // ============ EVENT TRACKING ============

  @Post('track/search')
  @ApiOperation({ summary: 'Track search event' })
  async trackSearch(
    @Body() body: { query: string; resultCount: number },
    @Request() req: any,
    @Headers('x-session-id') sessionId: string,
  ) {
    await this.analyticsService.trackSearch(
      body.query,
      req.user?.id,
      req.ip,
    );
    return { success: true };
  }

  @Post('track/product-view')
  @ApiOperation({ summary: 'Track product view' })
  async trackProductView(
    @Body() body: { productId: string; retailerPriceId?: string },
    @Request() req: any,
  ) {
    await this.analyticsService.trackClick(
      body.productId,
      body.retailerPriceId || '',
      req.user?.id,
      req.ip,
    );
    return { success: true };
  }

  @Post('track/add-to-cart')
  @ApiOperation({ summary: 'Track add to cart' })
  async trackAddToCart(
    @Body() body: { productId: string; price?: number },
    @Request() req: any,
    @Headers('x-session-id') sessionId: string,
  ) {
    await this.ragAnalyticsService.trackProductClick(req.user?.id || 'anonymous', body.productId);
    return { success: true };
  }

  @Post('track/checkout')
  @ApiOperation({ summary: 'Track checkout start' })
  async trackCheckout(@Request() req: any) {
    // Track checkout start event
    return { success: true };
  }

  @Post('track/purchase')
  @ApiOperation({ summary: 'Track purchase' })
  async trackPurchase(
    @Body() body: { orderId: string; revenue: number; items: any[] },
    @Request() req: any,
  ) {
    // Track purchase event
    return { success: true };
  }

  @Post('track/abandon')
  @ApiOperation({ summary: 'Track checkout abandonment' })
  async trackAbandon(@Request() req: any) {
    await this.analyticsService.trackCheckoutAbandon?.(req.user?.id);
    return { success: true };
  }

  // ============ RAG ANALYTICS ============

  @Get('rag/summary')
  @ApiOperation({ summary: 'Get RAG analytics summary' })
  async getRAGSummary(@Query('days') days?: number): Promise<RAGAnalyticsSummary> {
    return this.ragAnalyticsService.getSummary(days || 7);
  }

  @Get('rag/performance')
  @ApiOperation({ summary: 'Get RAG performance metrics' })
  async getRAGPerformance() {
    return this.ragAnalyticsService.getPerformanceMetrics();
  }

  @Get('rag/history')
  @ApiOperation({ summary: 'Get RAG query history' })
  async getRAGHistory(
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
  ) {
    return this.ragAnalyticsService.getQueryHistory(userId, limit || 50);
  }

  @Post('rag/feedback')
  @ApiOperation({ summary: 'Submit RAG feedback' })
  async submitRAGFeedback(
    @Body()
    body: {
      metricId: string;
      wasHelpful: boolean;
      clickedSourceId?: string;
      followUpQuery?: string;
    },
  ) {
    await this.ragAnalyticsService.trackRAGFeedback(
      body.metricId,
      body.wasHelpful,
      body.clickedSourceId,
      body.followUpQuery,
    );
    return { success: true };
  }

  @Get('rag/conversion')
  @ApiOperation({ summary: 'Get RAG conversion metrics' })
  async getRAGConversion() {
    return this.ragAnalyticsService.getConversionMetrics();
  }
}
