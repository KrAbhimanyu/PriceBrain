import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { ConstitutionService } from '../constitution.service';
import { ConstitutionRule, ConstitutionViolation } from '../entities/constitution.entity';

describe('ConstitutionService', () => {
  let service: ConstitutionService;
  let ruleRepo: any;
  let violationRepo: any;
  let eventEmitter: any;

  const mockRule: Partial<ConstitutionRule> = {
    id: 'rule-1',
    ruleType: 'human_approval',
    title: 'Human Approval Required',
    ruleText: 'All high-value decisions require human approval',
    priority: 10,
    isImmutable: true,
    isEnforced: true,
  };

  const mockViolation: Partial<ConstitutionViolation> = {
    id: 'violation-1',
    ruleId: 'rule-1',
    description: 'AI made decision without approval',
    severity: 'high',
    status: 'open',
  };

  beforeEach(async () => {
    ruleRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    violationRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConstitutionService,
        {
          provide: getRepositoryToken(ConstitutionRule),
          useValue: ruleRepo,
        },
        {
          provide: getRepositoryToken(ConstitutionViolation),
          useValue: violationRepo,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<ConstitutionService>(ConstitutionService);
  });

  describe('createRule', () => {
    it('should create a new constitution rule', async () => {
      ruleRepo.create.mockReturnValue(mockRule);
      ruleRepo.save.mockResolvedValue(mockRule);

      const result = await service.createRule({
        ruleType: 'human_approval',
        title: 'Human Approval Required',
        ruleText: 'All high-value decisions require human approval',
      });

      expect(result).toBeDefined();
      expect(ruleRepo.create).toHaveBeenCalledWith({
        ruleType: 'human_approval',
        title: 'Human Approval Required',
        ruleText: 'All high-value decisions require human approval',
        isImmutable: false,
        isEnforced: true,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('constitution.rule.created', expect.any(Object));
    });
  });

  describe('findRule', () => {
    it('should return a rule by id', async () => {
      ruleRepo.findOne.mockResolvedValue(mockRule);

      const result = await service.findRule('rule-1');

      expect(result).toEqual(mockRule);
      expect(ruleRepo.findOne).toHaveBeenCalledWith({ where: { id: 'rule-1' } });
    });

    it('should throw NotFoundException if rule not found', async () => {
      ruleRepo.findOne.mockResolvedValue(null);

      await expect(service.findRule('rule-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRule', () => {
    it('should update a mutable rule', async () => {
      const mutableRule = { ...mockRule, isImmutable: false };
      ruleRepo.findOne.mockResolvedValue(mutableRule);
      ruleRepo.save.mockImplementation((entity) => entity);

      const result = await service.updateRule('rule-1', { title: 'Updated Rule' });

      expect(result.title).toBe('Updated Rule');
    });

    it('should throw error when updating immutable rule', async () => {
      ruleRepo.findOne.mockResolvedValue(mockRule);

      await expect(service.updateRule('rule-1', { title: 'Updated' })).rejects.toThrow(
        'Cannot modify immutable constitution rule',
      );
    });
  });

  describe('deleteRule', () => {
    it('should delete a mutable rule', async () => {
      const mutableRule = { ...mockRule, isImmutable: false };
      ruleRepo.findOne.mockResolvedValue(mutableRule);
      ruleRepo.remove.mockResolvedValue(undefined);

      await service.deleteRule('rule-1');

      expect(ruleRepo.remove).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('constitution.rule.deleted', { ruleId: 'rule-1' });
    });

    it('should throw error when deleting immutable rule', async () => {
      ruleRepo.findOne.mockResolvedValue(mockRule);

      await expect(service.deleteRule('rule-1')).rejects.toThrow(
        'Cannot delete immutable constitution rule',
      );
    });
  });

  describe('createViolation', () => {
    it('should create a violation for enforced rule', async () => {
      ruleRepo.findOne.mockResolvedValue(mockRule);
      violationRepo.create.mockReturnValue(mockViolation);
      violationRepo.save.mockResolvedValue(mockViolation);

      const result = await service.createViolation({
        ruleId: 'rule-1',
        description: 'AI made decision without approval',
        severity: 'high',
      });

      expect(result).toBeDefined();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'constitution.violation.created',
        expect.any(Object),
      );
    });

    it('should throw error when rule is not enforced', async () => {
      const unenforcedRule = { ...mockRule, isEnforced: false };
      ruleRepo.findOne.mockResolvedValue(unenforcedRule);

      await expect(
        service.createViolation({
          ruleId: 'rule-1',
          description: 'Test',
          severity: 'low',
        }),
      ).rejects.toThrow('Rule is not enforced');
    });
  });

  describe('resolveViolation', () => {
    it('should resolve an open violation', async () => {
      violationRepo.findOne.mockResolvedValue({ ...mockViolation });
      violationRepo.save.mockImplementation((entity) => entity);

      const result = await service.resolveViolation('violation-1', 'Fixed the issue', 'user-1');

      expect(result.status).toBe('resolved');
      expect(result.resolution).toBe('Fixed the issue');
      expect(result.resolvedBy).toBe('user-1');
      expect(result.resolvedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException if violation not found', async () => {
      violationRepo.findOne.mockResolvedValue(null);

      await expect(
        service.resolveViolation('violation-999', 'Fixed', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getViolationStats', () => {
    it('should return violation statistics', async () => {
      violationRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { severity: 'high', status: 'open' },
          { severity: 'high', status: 'resolved' },
          { severity: 'low', status: 'open' },
        ]),
      });

      const result = await service.getViolationStats();

      expect(result.total).toBe(3);
      expect(result.bySeverity).toEqual({ high: 2, low: 1 });
      expect(result.byStatus).toEqual({ open: 2, resolved: 1 });
    });
  });
});
