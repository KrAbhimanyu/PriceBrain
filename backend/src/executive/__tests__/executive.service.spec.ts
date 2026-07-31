import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExecutiveService } from '../executive.service';
import { ChiefAIAgent, ExecutiveDecision } from '../entities/executive.entity';

describe('ExecutiveService', () => {
  let service: ExecutiveService;
  let chiefAiRepo: any;
  let decisionRepo: any;
  let eventEmitter: any;

  const mockChiefAIAgent: Partial<ChiefAIAgent> = {
    id: 'chief-ai-1',
    organizationId: 'org-1',
    name: 'ARIA',
    title: 'Chief AI Officer',
    responsibilities: ['Strategic Planning', 'Decision Making'],
    isActive: true,
    performanceMetrics: {},
  };

  const mockDecision: Partial<ExecutiveDecision> = {
    id: 'decision-1',
    organizationId: 'org-1',
    title: 'Approve Budget',
    decisionType: 'budget',
    status: 'pending',
    priority: 1,
    riskLevel: 'medium',
  };

  beforeEach(async () => {
    // Create mock repositories
    chiefAiRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    decisionRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutiveService,
        {
          provide: getRepositoryToken(ChiefAIAgent),
          useValue: chiefAiRepo,
        },
        {
          provide: getRepositoryToken(ExecutiveDecision),
          useValue: decisionRepo,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<ExecutiveService>(ExecutiveService);
  });

  describe('createChiefAI', () => {
    it('should create a new Chief AI for organization', async () => {
      chiefAiRepo.findOne.mockResolvedValue(null);
      chiefAiRepo.create.mockReturnValue(mockChiefAIAgent);
      chiefAiRepo.save.mockResolvedValue(mockChiefAIAgent);

      const result = await service.createChiefAI({
        organizationId: 'org-1',
        agentId: 'agent-1',
        name: 'ARIA',
      });

      expect(result).toBeDefined();
      expect(chiefAiRepo.create).toHaveBeenCalled();
      expect(chiefAiRepo.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('chief_ai.created', expect.any(Object));
    });

    it('should throw BadRequestException if organization already has a Chief AI', async () => {
      chiefAiRepo.findOne.mockResolvedValue(mockChiefAIAgent);

      await expect(
        service.createChiefAI({
          organizationId: 'org-1',
          agentId: 'agent-1',
          name: 'ARIA',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should assign default responsibilities if not provided', async () => {
      chiefAiRepo.findOne.mockResolvedValue(null);
      chiefAiRepo.create.mockImplementation((dto) => dto);
      chiefAiRepo.save.mockImplementation((entity) => entity);

      await service.createChiefAI({
        organizationId: 'org-1',
        agentId: 'agent-1',
        name: 'ARIA',
      });

      const createCall = chiefAiRepo.create.mock.calls[0][0];
      expect(createCall.responsibilities).toContain('Strategic Planning');
      expect(createCall.responsibilities).toContain('Risk Analysis');
    });
  });

  describe('findChiefAI', () => {
    it('should return Chief AI for organization', async () => {
      chiefAiRepo.findOne.mockResolvedValue(mockChiefAIAgent);

      const result = await service.findChiefAI('org-1');

      expect(result).toEqual(mockChiefAIAgent);
      expect(chiefAiRepo.findOne).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        relations: ['agent', 'organization'],
      });
    });

    it('should throw NotFoundException if Chief AI not found', async () => {
      chiefAiRepo.findOne.mockResolvedValue(null);

      await expect(service.findChiefAI('org-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createDecision', () => {
    it('should create a new executive decision', async () => {
      decisionRepo.create.mockReturnValue(mockDecision);
      decisionRepo.save.mockResolvedValue(mockDecision);

      const result = await service.createDecision('org-1', 'user-1', {
        title: 'Approve Budget',
        decisionType: 'budget',
      });

      expect(result).toBeDefined();
      expect(decisionRepo.create).toHaveBeenCalledWith({
        organizationId: 'org-1',
        title: 'Approve Budget',
        decisionType: 'budget',
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('decision.created', expect.any(Object));
    });
  });

  describe('approveDecision', () => {
    it('should approve a pending decision', async () => {
      decisionRepo.findOne.mockResolvedValue({ ...mockDecision, status: 'pending' });
      decisionRepo.save.mockImplementation((entity) => entity);

      const result = await service.approveDecision('decision-1', 'user-1');

      expect(result.status).toBe('approved');
      expect(result.approvedBy).toBe('user-1');
      expect(result.approvedAt).toBeInstanceOf(Date);
      expect(eventEmitter.emit).toHaveBeenCalledWith('decision.approved', expect.any(Object));
    });

    it('should throw BadRequestException if decision is not pending', async () => {
      decisionRepo.findOne.mockResolvedValue({ ...mockDecision, status: 'approved' });

      await expect(service.approveDecision('decision-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('rejectDecision', () => {
    it('should reject a pending decision with reason', async () => {
      decisionRepo.findOne.mockResolvedValue({ ...mockDecision, status: 'pending' });
      decisionRepo.save.mockImplementation((entity) => entity);

      const result = await service.rejectDecision('decision-1', 'user-1', 'Not aligned with strategy');

      expect(result.status).toBe('rejected');
      expect(result.rejectedBy).toBe('user-1');
      expect(result.rejectionReason).toBe('Not aligned with strategy');
      expect(eventEmitter.emit).toHaveBeenCalledWith('decision.rejected', expect.any(Object));
    });
  });

  describe('implementDecision', () => {
    it('should mark approved decision as implemented', async () => {
      decisionRepo.findOne.mockResolvedValue({ ...mockDecision, status: 'approved' });
      decisionRepo.save.mockImplementation((entity) => entity);

      const result = await service.implementDecision('decision-1');

      expect(result.status).toBe('implemented');
      expect(eventEmitter.emit).toHaveBeenCalledWith('decision.implemented', expect.any(Object));
    });

    it('should throw BadRequestException if decision is not approved', async () => {
      decisionRepo.findOne.mockResolvedValue({ ...mockDecision, status: 'pending' });

      await expect(service.implementDecision('decision-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDecisionAnalytics', () => {
    it('should return aggregated decision analytics', async () => {
      decisionRepo.find.mockResolvedValue([
        { ...mockDecision, status: 'approved', decisionType: 'budget', riskLevel: 'low' },
        { ...mockDecision, status: 'pending', decisionType: 'hiring', riskLevel: 'medium' },
        { ...mockDecision, status: 'approved', decisionType: 'budget', riskLevel: 'low' },
      ]);

      const result = await service.getDecisionAnalytics('org-1');

      expect(result.total).toBe(3);
      expect(result.byStatus).toEqual({ approved: 2, pending: 1 });
      expect(result.byType).toEqual({ budget: 2, hiring: 1 });
      expect(result.byRisk).toEqual({ low: 2, medium: 1 });
    });

    it('should handle empty decisions array', async () => {
      decisionRepo.find.mockResolvedValue([]);

      const result = await service.getDecisionAnalytics('org-1');

      expect(result.total).toBe(0);
      expect(result.byStatus).toEqual({});
      expect(result.byType).toEqual({});
      expect(result.avgPriority).toBe(0);
    });
  });

  describe('getChiefAIPerformance', () => {
    it('should calculate performance metrics from decisions', async () => {
      chiefAiRepo.findOne.mockResolvedValue({
        ...mockChiefAIAgent,
        performanceMetrics: { decisionsMade: 0 },
      });
      decisionRepo.find.mockResolvedValue([
        { ...mockDecision, status: 'approved' },
        { ...mockDecision, status: 'implemented' },
        { ...mockDecision, status: 'rejected' },
      ]);

      const result = await service.getChiefAIPerformance('org-1');

      expect(result.totalDecisions).toBe(3);
      expect(result.approvedDecisions).toBe(1);
      expect(result.implementedDecisions).toBe(1);
      expect(result.acceptanceRate).toBeCloseTo(33.33, 1);
    });
  });
});
