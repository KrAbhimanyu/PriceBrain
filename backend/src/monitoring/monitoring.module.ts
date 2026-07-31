import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { MonitoringMetric } from './entities/monitoring-metric.entity';
import { PriceAlert } from './entities/price-alert.entity';
import { WarrantyTracking } from './entities/warranty-tracking.entity';
import { DeliveryTracking } from './entities/delivery-tracking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MonitoringMetric,
      PriceAlert,
      WarrantyTracking,
      DeliveryTracking,
    ]),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
