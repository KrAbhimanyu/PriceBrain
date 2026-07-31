import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrganizationAnalyticsService } from './organization-analytics.service';

@ApiTags('organization-analytics')
@Controller('organization-analytics')
export class OrganizationAnalyticsController {
  constructor(private readonly analyticsService: OrganizationAnalyticsService) {}

  // ============ ORGANIZATION METRICS ============

  @Post('organizations/:orgId/metrics')
  @ApiOperation({ summary: 'Record an organization metric' })
  async recordOrgMetric(
    @Param('orgId') organizationId: string,
    @Body() data: { metricType: string; metricName: string; value: number; unit?: string },
  ) {
    return this.analyticsService.recordOrgMetric({ organizationId, ...data });
  }

  @Get('organizations/:orgId/metrics')
  @ApiOperation({ summary: 'Get organization metrics' })
  async getOrgMetrics(
    @Param('orgId') organizationId: string,
    @Query('metricType') metricType?: string,
    @Query('days') days?: number,
  ) {
    const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : undefined;
    return this.analyticsService.getOrgMetrics(organizationId, { metricType, startDate });
  }

  @Get('organizations/:orgId/metrics/summary')
  @ApiOperation({ summary: 'Get organization metric summary' })
  async getOrgMetricSummary(@Param('orgId') organizationId: string, @Query('days') days?: number) {
    return this.analyticsService.getOrgMetricSummary(organizationId, days || 30);
  }

  @Get('organizations/:orgId/metrics/:metricName/trend')
  @ApiOperation({ summary: 'Get metric trend over time' })
  async getMetricTrend(
    @Param('orgId') organizationId: string,
    @Param('metricName') metricName: string,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getMetricTrend(organizationId, metricName, days || 30);
  }

  // ============ DEPARTMENT METRICS ============

  @Post('departments/:deptId/metrics')
  @ApiOperation({ summary: 'Record a department metric' })
  async recordDeptMetric(
    @Param('deptId') departmentId: string,
    @Body() data: { metricType: string; metricName: string; value: number; unit?: string },
  ) {
    return this.analyticsService.recordDeptMetric({ departmentId, ...data });
  }

  @Get('departments/:deptId/metrics')
  @ApiOperation({ summary: 'Get department metrics' })
  async getDeptMetrics(@Param('deptId') departmentId: string) {
    return this.analyticsService.getDeptMetrics(departmentId);
  }

  // ============ COLLABORATION METRICS ============

  @Post('organizations/:orgId/collaboration')
  @ApiOperation({ summary: 'Record collaboration metric' })
  async recordCollabMetric(
    @Param('orgId') organizationId: string,
    @Body() data: {
      sourceDepartmentId?: string;
      targetDepartmentId?: string;
      collaborationType: string;
      interactionCount: number;
      effectivenessScore?: number;
    },
  ) {
    return this.analyticsService.recordCollabMetric({ organizationId, ...data });
  }

  @Get('organizations/:orgId/collaboration')
  @ApiOperation({ summary: 'Get collaboration metrics' })
  async getCollabMetrics(@Param('orgId') organizationId: string) {
    return this.analyticsService.getCollabMetrics(organizationId);
  }

  @Get('organizations/:orgId/collaboration/summary')
  @ApiOperation({ summary: 'Get collaboration summary' })
  async getCollabSummary(@Param('orgId') organizationId: string) {
    return this.analyticsService.getCollabSummary(organizationId);
  }

  // ============ DASHBOARD ============

  @Get('organizations/:orgId/dashboard')
  @ApiOperation({ summary: 'Get organization dashboard data' })
  async getDashboard(@Param('orgId') organizationId: string) {
    return this.analyticsService.getOrganizationDashboard(organizationId);
  }
}
