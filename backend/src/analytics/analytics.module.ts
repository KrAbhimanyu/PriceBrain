import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SearchLog } from '../search/entities/search-log.entity';
import { ClickTracking } from '../affiliate/entities/click-tracking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchLog, ClickTracking])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
