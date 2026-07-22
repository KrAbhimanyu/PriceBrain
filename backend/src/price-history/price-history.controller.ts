import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PriceHistoryService } from './price-history.service';

@ApiTags('price-history')
@Controller('price-history')
export class PriceHistoryController {
  constructor(private readonly priceHistoryService: PriceHistoryService) {}

  @Get(':productId')
  @ApiOperation({ summary: 'Get price history for a product' })
  async getHistory(
    @Param('productId') productId: string,
    @Query('days') days?: number,
  ) {
    return this.priceHistoryService.getHistory(productId, days || 30);
  }

  @Get(':productId/chart')
  @ApiOperation({ summary: 'Get price chart data' })
  async getChart(
    @Param('productId') productId: string,
    @Query('days') days?: number,
  ) {
    return this.priceHistoryService.getPriceChart(productId, days || 30);
  }
}
