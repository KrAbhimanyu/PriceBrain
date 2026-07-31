import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationMetric, DepartmentMetric, CollaborationMetric } from './entities/analytics.entity';
import { OrganizationAnalyticsService } from './organization-analytics.service';
import { OrganizationAnalyticsController } from './organization-analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationMetric, DepartmentMetric, CollaborationMetric])],
  controllers: [OrganizationAnalyticsController],
  providers: [OrganizationAnalyticsService],
  exports: [OrganizationAnalyticsService],
})
export class OrganizationAnalyticsModule {}
