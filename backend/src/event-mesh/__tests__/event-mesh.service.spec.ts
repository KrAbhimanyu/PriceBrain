import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { EventMeshService } from '../event-mesh.service';
import { Event, EventSubscription } from '../entities/event-mesh.entity';

describe('EventMeshService', () => {
  let service: EventMeshService;
  let eventRepo: any;
  let subscriptionRepo: any;
  let eventEmitter: any;

  const mockEvent: Partial<Event> = {
    id: 'event-1',
    eventType: 'product.created',
    source: 'products-service',
    payload: { productId: 'prod-1', name: 'Test Product' },
    correlationId: 'corr-1',
    timestamp: new Date(),
  };

  const mockSubscription: Partial<EventSubscription> = {
    id: 'sub-1',
    name: 'Product Created Handler',
    eventType: 'product.created',
    source: '*',
    endpoint: 'http://localhost:3000/webhook',
    isActive: true,
    filterCriteria: {},
  };

  beforeEach(async () => {
    eventRepo = {
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

    subscriptionRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    eventEmitter = {
      emit: jest.fn(),
      on: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventMeshService,
        { provide: getRepositoryToken(Event), useValue: eventRepo },
        { provide: getRepositoryToken(EventSubscription), useValue: subscriptionRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<EventMeshService>(EventMeshService);
  });

  describe('Event Publishing', () => {
    it('should publish an event', async () => {
      eventRepo.create.mockReturnValue(mockEvent);
      eventRepo.save.mockResolvedValue(mockEvent);

      const result = await service.publishEvent({
        eventType: 'product.created',
        source: 'products-service',
        payload: { productId: 'prod-1' },
      });

      expect(result).toBeDefined();
      expect(result.eventType).toBe('product.created');
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should include correlation ID if provided', async () => {
      eventRepo.create.mockImplementation((data) => data);
      eventRepo.save.mockImplementation((entity) => entity);

      const result = await service.publishEvent({
        eventType: 'order.created',
        source: 'orders-service',
        payload: { orderId: 'ord-1' },
        correlationId: 'corr-123',
      });

      expect(result.correlationId).toBe('corr-123');
    });

    it('should auto-generate correlation ID if not provided', async () => {
      eventRepo.create.mockImplementation((data) => data);
      eventRepo.save.mockImplementation((entity) => entity);

      const result = await service.publishEvent({
        eventType: 'order.created',
        source: 'orders-service',
        payload: { orderId: 'ord-1' },
      });

      expect(result.correlationId).toBeDefined();
      expect(result.correlationId.length).toBeGreaterThan(0);
    });
  });

  describe('Event Querying', () => {
    it('should find event by id', async () => {
      eventRepo.findOne.mockResolvedValue(mockEvent);

      const result = await service.findEvent('event-1');

      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event not found', async () => {
      eventRepo.findOne.mockResolvedValue(null);

      await expect(service.findEvent('event-999')).rejects.toThrow(NotFoundException);
    });

    it('should query events by type', async () => {
      const events = [mockEvent];
      eventRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(events),
      });

      const result = await service.queryEvents({ eventType: 'product.created' });

      expect(result).toEqual(events);
    });

    it('should filter events by source', async () => {
      eventRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockEvent]),
      });

      const result = await service.queryEvents({ source: 'products-service' });

      expect(result.length).toBe(1);
    });

    it('should filter events by date range', async () => {
      eventRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockEvent]),
      });

      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-12-31');

      const result = await service.queryEvents({ startDate, endDate });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Subscriptions', () => {
    it('should create subscription', async () => {
      subscriptionRepo.create.mockReturnValue(mockSubscription);
      subscriptionRepo.save.mockResolvedValue(mockSubscription);

      const result = await service.createSubscription({
        name: 'Product Created Handler',
        eventType: 'product.created',
        endpoint: 'http://localhost:3000/webhook',
      });

      expect(result).toBeDefined();
      expect(eventEmitter.emit).toHaveBeenCalledWith('subscription.created', expect.any(Object));
    });

    it('should find subscription by id', async () => {
      subscriptionRepo.findOne.mockResolvedValue(mockSubscription);

      const result = await service.findSubscription('sub-1');

      expect(result).toEqual(mockSubscription);
    });

    it('should update subscription', async () => {
      subscriptionRepo.findOne.mockResolvedValue(mockSubscription);
      subscriptionRepo.save.mockImplementation((entity) => entity);

      const result = await service.updateSubscription('sub-1', { isActive: false });

      expect(result.isActive).toBe(false);
    });

    it('should delete subscription', async () => {
      subscriptionRepo.findOne.mockResolvedValue(mockSubscription);
      subscriptionRepo.delete.mockResolvedValue(undefined);

      await service.deleteSubscription('sub-1');

      expect(subscriptionRepo.delete).toHaveBeenCalledWith('sub-1');
    });

    it('should find subscriptions for event type', async () => {
      subscriptionRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockSubscription]),
      });

      const result = await service.findSubscriptionsForEvent('product.created', 'products-service');

      expect(result.length).toBe(1);
      expect(result[0].eventType).toBe('product.created');
    });
  });

  describe('Event Replay', () => {
    it('should replay event', async () => {
      eventRepo.findOne.mockResolvedValue(mockEvent);
      subscriptionRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockSubscription]),
      });
      eventRepo.save.mockImplementation((entity) => entity);

      const result = await service.replayEvent('event-1');

      expect(result.replayCount).toBe(1);
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw NotFoundException if event not found for replay', async () => {
      eventRepo.findOne.mockResolvedValue(null);

      await expect(service.replayEvent('event-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Statistics', () => {
    it('should get event mesh stats', async () => {
      eventRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockEvent]),
      });
      subscriptionRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockSubscription]),
      });

      const result = await service.getEventMeshStats();

      expect(result.totalEvents).toBe(1);
      expect(result.totalSubscriptions).toBe(1);
    });

    it('should get events by type stats', async () => {
      eventRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockEvent]),
      });

      const result = await service.getEventsByType();

      expect(result['product.created']).toBe(1);
    });
  });
});
