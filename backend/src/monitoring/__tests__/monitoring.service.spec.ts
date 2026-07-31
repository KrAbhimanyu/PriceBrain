import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MonitoringService } from '../monitoring.service';
import { Metric, Alert, HealthCheck } from '../entities/monitoring.entity';

describe('MonitoringService', () => {
  let service: MonitoringService;
  let metricRepo: any;
  let alertRepo: any;
  let healthRepo: any;
  let eventEmitter: any;

  const mockMetric: Partial<Metric> = {
    id: 'metric-1',
    name: 'cpu_usage',
    value: 45.5,
    unit: 'percent',
    timestamp: new Date(),
    tags: { host: 'server-1' },
  };

  const mockAlert: Partial<Alert> = {
    id: 'alert-1',
    name: 'High CPU',
    severity: 'warning',
    status: 'active',
    triggeredAt: new Date(),
    message: 'CPU usage exceeded 80%',
  };

  const mockHealth: Partial<HealthCheck> = {
    id: 'health-1',
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date(),
    responseTime: 120,
  };

  beforeEach(async () => {
    metricRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    alertRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    healthRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: getRepositoryToken(Metric), useValue: metricRepo },
        { provide: getRepositoryToken(Alert), useValue: alertRepo },
        { provide: getRepositoryToken(HealthCheck), useValue: healthRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
  });

  describe('Metrics', () => {
    it('should record a metric', async () => {
      metricRepo.create.mockReturnValue(mockMetric);
      metricRepo.save.mockResolvedValue(mockMetric);

      const result = await service.recordMetric({
        name: 'cpu_usage',
        value: 45.5,
        unit: 'percent',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('cpu_usage');
    });

    it('should query metrics', async () => {
      metricRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMetric]),
      });

      const result = await service.queryMetrics({
        name: 'cpu_usage',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      });

      expect(result.length).toBe(1);
    });

    it('should get metric aggregates', async () => {
      metricRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { name: 'cpu_usage', avg: 45.5, min: 20, max: 80 },
        ]),
      });

      const result = await service.getMetricAggregates('cpu_usage', '1h');

      expect(result).toBeDefined();
    });
  });

  describe('Alerts', () => {
    it('should create an alert', async () => {
      alertRepo.create.mockReturnValue(mockAlert);
      alertRepo.save.mockResolvedValue(mockAlert);

      const result = await service.createAlert({
        name: 'High CPU',
        severity: 'warning',
        message: 'CPU usage exceeded 80%',
      });

      expect(result).toBeDefined();
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should find active alerts', async () => {
      alertRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockAlert]),
      });

      const result = await service.findActiveAlerts();

      expect(result.length).toBe(1);
    });

    it('should acknowledge alert', async () => {
      alertRepo.findOne.mockResolvedValue({ ...mockAlert, status: 'active' });
      alertRepo.save.mockImplementation((entity) => entity);

      const result = await service.acknowledgeAlert('alert-1', 'user-1');

      expect(result.status).toBe('acknowledged');
      expect(result.acknowledgedBy).toBe('user-1');
    });

    it('should resolve alert', async () => {
      alertRepo.findOne.mockResolvedValue({ ...mockAlert, status: 'acknowledged' });
      alertRepo.save.mockImplementation((entity) => entity);

      const result = await service.resolveAlert('alert-1', 'Fixed by restarting');

      expect(result.status).toBe('resolved');
      expect(result.resolution).toBe('Fixed by restarting');
    });
  });

  describe('Health Checks', () => {
    it('should record health check', async () => {
      healthRepo.create.mockReturnValue(mockHealth);
      healthRepo.save.mockResolvedValue(mockHealth);

      const result = await service.recordHealthCheck({
        service: 'api-gateway',
        status: 'healthy',
        responseTime: 120,
      });

      expect(result).toBeDefined();
    });

    it('should get service health', async () => {
      healthRepo.findOne.mockResolvedValue(mockHealth);

      const result = await service.getServiceHealth('api-gateway');

      expect(result.status).toBe('healthy');
    });

    it('should get overall system health', async () => {
      healthRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { service: 'api-gateway', status: 'healthy' },
          { service: 'database', status: 'healthy' },
        ]),
      });

      const result = await service.getSystemHealth();

      expect(result.status).toBe('healthy');
    });
  });

  describe('Dashboard', () => {
    it('should get monitoring dashboard', async () => {
      metricRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMetric]),
      });
      alertRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockAlert]),
      });
      healthRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockHealth]),
      });

      const result = await service.getMonitoringDashboard();

      expect(result).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.alerts).toBeDefined();
    });
  });
});
