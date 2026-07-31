import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { AutomationService } from '../automation.service';
import { AutomationRule, AutomationExecution } from '../entities/automation.entity';

describe('AutomationService', () => {
  let service: AutomationService;
  let ruleRepo: any;
  let executionRepo: any;
  let eventEmitter: any;

  const mockRule: Partial<AutomationRule> = {
    id: 'rule-1',
    name: 'Price Drop Alert',
    description: 'Alert when price drops',
    type: 'price_monitoring',
    trigger: { type: 'price_change', threshold: 10 },
    condition: { operator: 'lt', field: 'price', value: 1000 },
    action: { type: 'notify', channel: 'email' },
    isActive: true,
    schedule: null,
  };

  const mockExecution: Partial<AutomationExecution> = {
    id: 'exec-1',
    ruleId: 'rule-1',
    status: 'success',
    startedAt: new Date(),
    completedAt: new Date(),
    duration: 250,
  };

  beforeEach(async () => {
    ruleRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    executionRepo = {
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

    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationService,
        { provide: getRepositoryToken(AutomationRule), useValue: ruleRepo },
        { provide: getRepositoryToken(AutomationExecution), useValue: executionRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<AutomationService>(AutomationService);
  });

  describe('Rule Management', () => {
    it('should create automation rule', async () => {
      ruleRepo.create.mockReturnValue(mockRule);
      ruleRepo.save.mockResolvedValue(mockRule);

      const result = await service.createRule({
        name: 'Price Drop Alert',
        type: 'price_monitoring',
        trigger: { type: 'price_change' },
        action: { type: 'notify' },
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Price Drop Alert');
    });

    it('should find rule by id', async () => {
      ruleRepo.findOne.mockResolvedValue(mockRule);

      const result = await service.findRule('rule-1');

      expect(result).toEqual(mockRule);
    });

    it('should update rule', async () => {
      ruleRepo.findOne.mockResolvedValue(mockRule);
      ruleRepo.save.mockImplementation((entity) => entity);

      const result = await service.updateRule('rule-1', { name: 'Updated Rule' });

      expect(result.name).toBe('Updated Rule');
    });

    it('should delete rule', async () => {
      ruleRepo.findOne.mockResolvedValue(mockRule);
      ruleRepo.save.mockImplementation((entity) => entity);

      await service.deleteRule('rule-1');

      expect(mockRule.isActive).toBe(false);
    });

    it('should activate rule', async () => {
      ruleRepo.findOne.mockResolvedValue({ ...mockRule, isActive: false });
      ruleRepo.save.mockImplementation((entity) => entity);

      const result = await service.activateRule('rule-1');

      expect(result.isActive).toBe(true);
    });

    it('should deactivate rule', async () => {
      ruleRepo.findOne.mockResolvedValue({ ...mockRule, isActive: true });
      ruleRepo.save.mockImplementation((entity) => entity);

      const result = await service.deactivateRule('rule-1');

      expect(result.isActive).toBe(false);
    });
  });

  describe('Rule Execution', () => {
    it('should execute rule', async () => {
      ruleRepo.findOne.mockResolvedValue({ ...mockRule, isActive: true });
      executionRepo.create.mockReturnValue(mockExecution);
      executionRepo.save.mockResolvedValue(mockExecution);

      const result = await service.executeRule('rule-1', { productId: 'prod-1' });

      expect(result).toBeDefined();
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should not execute inactive rule', async () => {
      ruleRepo.findOne.mockResolvedValue({ ...mockRule, isActive: false });

      await expect(service.executeRule('rule-1', {})).rejects.toThrow();
    });

    it('should get execution history', async () => {
      executionRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockExecution]),
      });

      const result = await service.getExecutionHistory('rule-1');

      expect(result.length).toBe(1);
    });
  });

  describe('Rule Evaluation', () => {
    it('should evaluate condition - true', async () => {
      const result = await service.evaluateCondition(
        { operator: 'lt', field: 'price', value: 1000 },
        { price: 500 },
      );

      expect(result).toBe(true);
    });

    it('should evaluate condition - false', async () => {
      const result = await service.evaluateCondition(
        { operator: 'lt', field: 'price', value: 1000 },
        { price: 1500 },
      );

      expect(result).toBe(false);
    });

    it('should evaluate eq condition', async () => {
      const result = await service.evaluateCondition(
        { operator: 'eq', field: 'status', value: 'active' },
        { status: 'active' },
      );

      expect(result).toBe(true);
    });

    it('should evaluate gt condition', async () => {
      const result = await service.evaluateCondition(
        { operator: 'gt', field: 'rating', value: 4 },
        { rating: 4.5 },
      );

      expect(result).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should get automation stats', async () => {
      ruleRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockRule]),
      });
      executionRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockExecution]),
      });

      const result = await service.getAutomationStats();

      expect(result.totalRules).toBe(1);
      expect(result.activeRules).toBe(1);
    });
  });
});
