import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService, AnalyticsData, DailyStats } from './analytics.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

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
}
