import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MonitoringMetric } from './entities/monitoring-metric.entity';
import { PriceAlert } from './entities/price-alert.entity';
import { WarrantyTracking } from './entities/warranty-tracking.entity';
import { DeliveryTracking } from './entities/delivery-tracking.entity';
import {
  CreatePriceAlertDto,
  CreateWarrantyTrackingDto,
  CreateDeliveryTrackingDto,
  RecordMetricDto,
  QueryMetricsDto,
} from './dto/monitoring.dto';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    @InjectRepository(MonitoringMetric)
    private metricRepository: Repository<MonitoringMetric>,
    @InjectRepository(PriceAlert)
    private alertRepository: Repository<PriceAlert>,
    @InjectRepository(WarrantyTracking)
    private warrantyRepository: Repository<WarrantyTracking>,
    @InjectRepository(DeliveryTracking)
    private deliveryRepository: Repository<DeliveryTracking>,
  ) {}

  // ============ Metrics ============

  async recordMetric(userId: string, dto: RecordMetricDto): Promise<MonitoringMetric> {
    const metric = this.metricRepository.create({
      ...dto,
      userId,
    });
    return this.metricRepository.save(metric);
  }

  async getMetrics(userId: string, query: QueryMetricsDto): Promise<MonitoringMetric[]> {
    const where: any = { userId };

    if (query.metricType) {
      where.metricType = query.metricType;
    }

    if (query.missionId) {
      where.missionId = query.missionId;
    }

    if (query.from && query.to) {
      where.recordedAt = Between(new Date(query.from), new Date(query.to));
    } else if (query.from) {
      where.recordedAt = MoreThan(new Date(query.from));
    } else if (query.to) {
      where.recordedAt = LessThan(new Date(query.to));
    }

    return this.metricRepository.find({
      where,
      order: { recordedAt: 'DESC' },
      take: 1000,
    });
  }

  async getMetricSummary(
    userId: string,
    metricType: string,
    days = 7,
  ): Promise<{
    current: number;
    average: number;
    min: number;
    max: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const metrics = await this.metricRepository
      .createQueryBuilder('m')
      .where('m.userId = :userId', { userId })
      .andWhere('m.metricType = :metricType', { metricType })
      .andWhere('m.recordedAt >= :fromDate', { fromDate })
      .orderBy('m.recordedAt', 'ASC')
      .getMany();

    if (metrics.length === 0) {
      return { current: 0, average: 0, min: 0, max: 0, trend: 'stable' };
    }

    const values = metrics.map((m) => Number(m.value));
    const current = values[values.length - 1];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (secondAvg > firstAvg * 1.05) trend = 'up';
    else if (secondAvg < firstAvg * 0.95) trend = 'down';

    return { current, average, min, max, trend };
  }

  // ============ Price Alerts ============

  async createPriceAlert(userId: string, dto: CreatePriceAlertDto): Promise<PriceAlert> {
    const alert = this.alertRepository.create({
      ...dto,
      userId,
      alertType: 'price_drop',
    });
    return this.alertRepository.save(alert);
  }

  async findPriceAlerts(userId: string, activeOnly = false): Promise<PriceAlert[]> {
    const where: any = { userId };
    if (activeOnly) {
      where.isTriggered = false;
    }
    return this.alertRepository.find({
      where,
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async updatePriceAlert(
    id: string,
    userId: string,
    data: Partial<PriceAlert>,
  ): Promise<PriceAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id, userId },
    });

    if (!alert) {
      throw new NotFoundException(`Price alert ${id} not found`);
    }

    Object.assign(alert, data);
    return this.alertRepository.save(alert);
  }

  async deletePriceAlert(id: string, userId: string): Promise<void> {
    await this.alertRepository.delete({ id, userId });
  }

  // ============ Warranty Tracking ============

  async createWarrantyTracking(
    userId: string,
    dto: CreateWarrantyTrackingDto,
  ): Promise<WarrantyTracking> {
    const purchaseDate = new Date(dto.purchaseDate);
    const warrantyEndDate = new Date(purchaseDate);
    warrantyEndDate.setMonth(warrantyEndDate.getMonth() + dto.warrantyMonths);

    const warranty = this.warrantyRepository.create({
      ...dto,
      userId,
      purchaseDate,
      warrantyEndDate,
    });
    return this.warrantyRepository.save(warranty);
  }

  async findWarrantyTrackings(userId: string): Promise<WarrantyTracking[]> {
    return this.warrantyRepository.find({
      where: { userId },
      order: { warrantyEndDate: 'ASC' },
    });
  }

  async getExpiringWarranties(userId: string, daysAhead = 30): Promise<WarrantyTracking[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.warrantyRepository
      .createQueryBuilder('w')
      .where('w.userId = :userId', { userId })
      .andWhere('w.warrantyEndDate >= :now', { now })
      .andWhere('w.warrantyEndDate <= :futureDate', { futureDate })
      .andWhere('w.reminderSent = false')
      .orderBy('w.warrantyEndDate', 'ASC')
      .getMany();
  }

  async updateWarrantyTracking(
    id: string,
    userId: string,
    data: Partial<WarrantyTracking>,
  ): Promise<WarrantyTracking> {
    const warranty = await this.warrantyRepository.findOne({
      where: { id, userId },
    });

    if (!warranty) {
      throw new NotFoundException(`Warranty tracking ${id} not found`);
    }

    Object.assign(warranty, data);
    return this.warrantyRepository.save(warranty);
  }

  async deleteWarrantyTracking(id: string, userId: string): Promise<void> {
    await this.warrantyRepository.delete({ id, userId });
  }

  // ============ Delivery Tracking ============

  async createDeliveryTracking(
    userId: string,
    dto: CreateDeliveryTrackingDto,
  ): Promise<DeliveryTracking> {
    const delivery = this.deliveryRepository.create({
      ...dto,
      userId,
    });
    return this.deliveryRepository.save(delivery);
  }

  async findDeliveryTrackings(userId: string): Promise<DeliveryTracking[]> {
    return this.deliveryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateDeliveryTracking(
    id: string,
    userId: string,
    data: Partial<DeliveryTracking>,
  ): Promise<DeliveryTracking> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id, userId },
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery tracking ${id} not found`);
    }

    Object.assign(delivery, data);
    return this.deliveryRepository.save(delivery);
  }

  async deleteDeliveryTracking(id: string, userId: string): Promise<void> {
    await this.deliveryRepository.delete({ id, userId });
  }

  // ============ Cron Jobs ============

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkExpiringWarranties(): Promise<void> {
    const expiringWarranties = await this.warrantyRepository.find({
      where: { reminderSent: false },
    });

    for (const warranty of expiringWarranties) {
      const daysUntilExpiry = Math.ceil(
        (warranty.warrantyEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilExpiry <= warranty.reminderDaysBefore) {
        this.logger.log(
          `Warranty expiring soon: ${warranty.productName} for user ${warranty.userId}`,
        );
        // Would send notification here
        await this.warrantyRepository.update(warranty.id, { reminderSent: true });
      }
    }
  }

  // ============ Dashboard Data ============

  async getDashboardData(userId: string): Promise<{
    priceAlerts: { active: number; triggered: number };
    warranties: { total: number; expiringSoon: number };
    deliveries: { inProgress: number; delivered: number };
    recentMetrics: MonitoringMetric[];
  }> {
    const [priceAlerts, warranties, deliveries, recentMetrics] = await Promise.all([
      this.alertRepository.find({ where: { userId } }),
      this.findWarrantyTrackings(userId),
      this.findDeliveryTrackings(userId),
      this.metricRepository.find({
        where: { userId },
        order: { recordedAt: 'DESC' },
        take: 10,
      }),
    ]);

    const expiringWarranties = warranties.filter(
      (w) => w.warrantyEndDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000,
    );

    return {
      priceAlerts: {
        active: priceAlerts.filter((a) => !a.isTriggered).length,
        triggered: priceAlerts.filter((a) => a.isTriggered).length,
      },
      warranties: {
        total: warranties.length,
        expiringSoon: expiringWarranties.length,
      },
      deliveries: {
        inProgress: deliveries.filter(
          (d) => !['delivered', 'failed', 'returned'].includes(d.status),
        ).length,
        delivered: deliveries.filter((d) => d.status === 'delivered').length,
      },
      recentMetrics,
    };
  }
}
