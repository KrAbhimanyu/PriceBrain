import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AnalyticsService } from './analytics.service';
import { RAGAnalyticsService } from './rag-analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SearchLog } from '../search/entities/search-log.entity';
import { ClickTracking } from '../affiliate/entities/click-tracking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SearchLog, ClickTracking]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, RAGAnalyticsService],
  exports: [AnalyticsService, RAGAnalyticsService],
})
export class AnalyticsModule {}
