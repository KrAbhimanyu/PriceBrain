import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceHistory } from './entities/price-history.entity';

@Injectable()
export class PriceHistoryService {
  constructor(
    @InjectRepository(PriceHistory)
    private priceHistoryRepository: Repository<PriceHistory>,
  ) {}

  async getHistory(productId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.priceHistoryRepository.find({
      where: {
        productId,
        createdAt: startDate as any,
      },
      relations: ['retailer'],
      order: { createdAt: 'ASC' },
    });
  }

  async getPriceChart(productId: string, days = 30) {
    const history = await this.getHistory(productId, days);
    
    // Group by date and get min/max/avg prices
    const chartData = new Map<string, { min: number; max: number; avg: number; count: number }>();
    
    for (const record of history) {
      const date = record.createdAt.toISOString().split('T')[0];
      const existing = chartData.get(date) || { min: Infinity, max: 0, avg: 0, count: 0 };
      existing.min = Math.min(existing.min, Number(record.price));
      existing.max = Math.max(existing.max, Number(record.price));
      existing.avg = (existing.avg * existing.count + Number(record.price)) / (existing.count + 1);
      existing.count++;
      chartData.set(date, existing);
    }

    return Array.from(chartData.entries()).map(([date, data]) => ({
      date,
      ...data,
      min: data.min === Infinity ? null : data.min,
    }));
  }
}
