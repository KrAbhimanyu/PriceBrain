import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import {
  CreatePriceAlertDto,
  CreateWarrantyTrackingDto,
  CreateDeliveryTrackingDto,
  RecordMetricDto,
  QueryMetricsDto,
} from './dto/monitoring.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Monitoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  // ============ Metrics ============

  @Post('metrics')
  @ApiOperation({ summary: 'Record a metric' })
  recordMetric(@Request() req, @Body() dto: RecordMetricDto) {
    return this.monitoringService.recordMetric(req.user.id, dto);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get metrics' })
  getMetrics(@Request() req, @Query() query: QueryMetricsDto) {
    return this.monitoringService.getMetrics(req.user.id, query);
  }

  @Get('metrics/summary')
  @ApiOperation({ summary: 'Get metric summary' })
  getMetricSummary(
    @Request() req,
    @Query('type') type: string,
    @Query('days') days?: number,
  ) {
    return this.monitoringService.getMetricSummary(req.user.id, type, days);
  }

  // ============ Price Alerts ============

  @Post('price-alerts')
  @ApiOperation({ summary: 'Create a price alert' })
  createPriceAlert(@Request() req, @Body() dto: CreatePriceAlertDto) {
    return this.monitoringService.createPriceAlert(req.user.id, dto);
  }

  @Get('price-alerts')
  @ApiOperation({ summary: 'Get price alerts' })
  findPriceAlerts(
    @Request() req,
    @Query('activeOnly') activeOnly?: boolean,
  ) {
    return this.monitoringService.findPriceAlerts(req.user.id, activeOnly);
  }

  @Patch('price-alerts/:id')
  @ApiOperation({ summary: 'Update a price alert' })
  updatePriceAlert(
    @Request() req,
    @Param('id') id: string,
    @Body() data: Partial<CreatePriceAlertDto>,
  ) {
    return this.monitoringService.updatePriceAlert(id, req.user.id, data);
  }

  @Delete('price-alerts/:id')
  @ApiOperation({ summary: 'Delete a price alert' })
  deletePriceAlert(@Request() req, @Param('id') id: string) {
    return this.monitoringService.deletePriceAlert(id, req.user.id);
  }

  // ============ Warranty Tracking ============

  @Post('warranties')
  @ApiOperation({ summary: 'Create warranty tracking' })
  createWarrantyTracking(@Request() req, @Body() dto: CreateWarrantyTrackingDto) {
    return this.monitoringService.createWarrantyTracking(req.user.id, dto);
  }

  @Get('warranties')
  @ApiOperation({ summary: 'Get warranty tracking list' })
  findWarrantyTrackings(@Request() req) {
    return this.monitoringService.findWarrantyTrackings(req.user.id);
  }

  @Get('warranties/expiring')
  @ApiOperation({ summary: 'Get expiring warranties' })
  getExpiringWarranties(@Request() req, @Query('days') days?: number) {
    return this.monitoringService.getExpiringWarranties(req.user.id, days);
  }

  @Patch('warranties/:id')
  @ApiOperation({ summary: 'Update warranty tracking' })
  updateWarrantyTracking(
    @Request() req,
    @Param('id') id: string,
    @Body() data: Partial<CreateWarrantyTrackingDto>,
  ) {
    return this.monitoringService.updateWarrantyTracking(id, req.user.id, data);
  }

  @Delete('warranties/:id')
  @ApiOperation({ summary: 'Delete warranty tracking' })
  deleteWarrantyTracking(@Request() req, @Param('id') id: string) {
    return this.monitoringService.deleteWarrantyTracking(id, req.user.id);
  }

  // ============ Delivery Tracking ============

  @Post('deliveries')
  @ApiOperation({ summary: 'Create delivery tracking' })
  createDeliveryTracking(@Request() req, @Body() dto: CreateDeliveryTrackingDto) {
    return this.monitoringService.createDeliveryTracking(req.user.id, dto);
  }

  @Get('deliveries')
  @ApiOperation({ summary: 'Get delivery tracking list' })
  findDeliveryTrackings(@Request() req) {
    return this.monitoringService.findDeliveryTrackings(req.user.id);
  }

  @Patch('deliveries/:id')
  @ApiOperation({ summary: 'Update delivery tracking' })
  updateDeliveryTracking(
    @Request() req,
    @Param('id') id: string,
    @Body() data: Partial<CreateDeliveryTrackingDto>,
  ) {
    return this.monitoringService.updateDeliveryTracking(id, req.user.id, data);
  }

  @Delete('deliveries/:id')
  @ApiOperation({ summary: 'Delete delivery tracking' })
  deleteDeliveryTracking(@Request() req, @Param('id') id: string) {
    return this.monitoringService.deleteDeliveryTracking(id, req.user.id);
  }

  // ============ Dashboard ============

  @Get('dashboard')
  @ApiOperation({ summary: 'Get monitoring dashboard data' })
  getDashboard(@Request() req) {
    return this.monitoringService.getDashboardData(req.user.id);
  }
}
