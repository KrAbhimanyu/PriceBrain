import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationMetric, DepartmentMetric, CollaborationMetric } from './entities/organization-analytics.entity';

@Injectable()
export class OrganizationAnalyticsService {
  private readonly logger = new Logger(OrganizationAnalyticsService.name);

  constructor(
    @InjectRepository(OrganizationMetric)
    private orgMetricRepo: Repository<OrganizationMetric>,
    @InjectRepository(DepartmentMetric)
    private deptMetricRepo: Repository<DepartmentMetric>,
    @InjectRepository(CollaborationMetric)
    private collabMetricRepo: Repository<CollaborationMetric>,
  ) {}

  // ============ ORGANIZATION METRICS ============

  async recordOrgMetric(data: {
    organizationId: string;
    metricType: string;
    metricName: string;
    value: number;
    unit?: string;
    dimensions?: Record<string, any>;
  }): Promise<OrganizationMetric> {
    const metric = this.orgMetricRepo.create(data);
    const saved = await this.orgMetricRepo.save(metric);
    this.logger.log(`Recorded org metric: ${data.metricName} = ${data.value}`);
    return saved;
  }

  async getOrgMetrics(
    organizationId: string,
    options?: {
      metricType?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    },
  ): Promise<OrganizationMetric[]> {
    const qb = this.orgMetricRepo
      .createQueryBuilder('m')
      .where('m.organizationId = :organizationId', { organizationId });

    if (options?.metricType) {
      qb.andWhere('m.metricType = :metricType', { metricType: options.metricType });
    }

    if (options?.startDate) {
      qb.andWhere('m.recordedAt >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      qb.andWhere('m.recordedAt <= :endDate', { endDate: options.endDate });
    }

    qb.orderBy('m.recordedAt', 'DESC');

    if (options?.limit) {
      qb.limit(options.limit);
    }

    return qb.getMany();
  }

  async getOrgMetricSummary(organizationId: string, days: number = 30): Promise<Record<string, any>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.getOrgMetrics(organizationId, { startDate });

    const byType: Record<string, any[]> = {};
    for (const metric of metrics) {
      if (!byType[metric.metricType]) {
        byType[metric.metricType] = [];
      }
      byType[metric.metricType].push(metric);
    }

    const summary: Record<string, any> = {};
    for (const [type, typeMetrics] of Object.entries(byType)) {
      const values = typeMetrics.map(m => m.value);
      summary[type] = {
        count: values.length,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: values[0],
      };
    }

    return summary;
  }

  // ============ DEPARTMENT METRICS ============

  async recordDeptMetric(data: {
    departmentId: string;
    metricType: string;
    metricName: string;
    value: number;
    unit?: string;
    dimensions?: Record<string, any>;
  }): Promise<DepartmentMetric> {
    const metric = this.deptMetricRepo.create(data);
    return this.deptMetricRepo.save(metric);
  }

  async getDeptMetrics(
    departmentId: string,
    options?: { startDate?: Date; endDate?: Date; limit?: number },
  ): Promise<DepartmentMetric[]> {
    const qb = this.deptMetricRepo
      .createQueryBuilder('m')
      .where('m.departmentId = :departmentId', { departmentId });

    if (options?.startDate) {
      qb.andWhere('m.recordedAt >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      qb.andWhere('m.recordedAt <= :endDate', { endDate: options.endDate });
    }

    qb.orderBy('m.recordedAt', 'DESC');

    if (options?.limit) {
      qb.limit(options.limit);
    }

    return qb.getMany();
  }

  // ============ COLLABORATION METRICS ============

  async recordCollabMetric(data: {
    organizationId: string;
    sourceDepartmentId?: string;
    targetDepartmentId?: string;
    collaborationType: string;
    interactionCount: number;
    effectivenessScore?: number;
    qualityScore?: number;
    responseTimeAvg?: number;
  }): Promise<CollaborationMetric> {
    const metric = this.collabMetricRepo.create(data);
    return this.collabMetricRepo.save(metric);
  }

  async getCollabMetrics(organizationId: string): Promise<CollaborationMetric[]> {
    return this.collabMetricRepo.find({
      where: { organizationId },
      order: { recordedAt: 'DESC' },
    });
  }

  async getCollabSummary(organizationId: string): Promise<Record<string, any>> {
    const metrics = await this.getCollabMetrics(organizationId);

    const byType: Record<string, any[]> = {};
    for (const metric of metrics) {
      if (!byType[metric.collaborationType]) {
        byType[metric.collaborationType] = [];
      }
      byType[metric.collaborationType].push(metric);
    }

    const summary: Record<string, any> = {};
    for (const [type, typeMetrics] of Object.entries(byType)) {
      const interactionCounts = typeMetrics.map(m => m.interactionCount);
      summary[type] = {
        totalInteractions: interactionCounts.reduce((a, b) => a + b, 0),
        avgInteractions: interactionCounts.reduce((a, b) => a + b, 0) / interactionCounts.length,
        count: interactionCounts.length,
      };
    }

    return summary;
  }

  // ============ DASHBOARD ============

  async getOrganizationDashboard(organizationId: string): Promise<Record<string, any>> {
    const [orgSummary, collabSummary] = await Promise.all([
      this.getOrgMetricSummary(organizationId, 30),
      this.getCollabSummary(organizationId),
    ]);

    return {
      organizationId,
      metrics: orgSummary,
      collaboration: collabSummary,
      generatedAt: new Date().toISOString(),
    };
  }

  // ============ TRENDS ============

  async getMetricTrend(
    organizationId: string,
    metricName: string,
    days: number = 30,
  ): Promise<{ date: string; value: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.orgMetricRepo
      .createQueryBuilder('m')
      .where('m.organizationId = :organizationId', { organizationId })
      .andWhere('m.metricName = :metricName', { metricName })
      .andWhere('m.recordedAt >= :startDate', { startDate })
      .orderBy('m.recordedAt', 'ASC')
      .getMany();

    return metrics.map(m => ({
      date: m.recordedAt.toISOString().split('T')[0],
      value: m.value,
    }));
  }
}
