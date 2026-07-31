import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { PolicyService } from '../policy.service';
import { Policy, PolicyEvaluation } from '../entities/policy.entity';

describe('PolicyService', () => {
  let service: PolicyService;
  let policyRepo: any;
  let evaluationRepo: any;
  let eventEmitter: any;

  const mockPolicy: Partial<Policy> = {
    id: 'policy-1',
    name: 'Budget Limit',
    description: 'Never exceed budget',
    policyType: 'spending',
    rules: [
      { field: 'amount', operator: 'lte', value: 50000 },
    ],
    isEnforced: true,
    isActive: true,
  };

  const mockEvaluation: Partial<PolicyEvaluation> = {
    id: 'eval-1',
    policyId: 'policy-1',
    context: { amount: 30000 },
    result: true,
    evaluatedAt: new Date(),
  };

  beforeEach(async () => {
    policyRepo = {
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

    evaluationRepo = {
      create: jest.fn(),
      save: jest.fn(),
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
        PolicyService,
        { provide: getRepositoryToken(Policy), useValue: policyRepo },
        { provide: getRepositoryToken(PolicyEvaluation), useValue: evaluationRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<PolicyService>(PolicyService);
  });

  describe('Policy CRUD', () => {
    it('should create a policy', async () => {
      policyRepo.create.mockReturnValue(mockPolicy);
      policyRepo.save.mockResolvedValue(mockPolicy);

      const result = await service.createPolicy({
        name: 'Budget Limit',
        policyType: 'spending',
        rules: [{ field: 'amount', operator: 'lte', value: 50000 }],
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Budget Limit');
    });

    it('should find policy by id', async () => {
      policyRepo.findOne.mockResolvedValue(mockPolicy);

      const result = await service.findPolicy('policy-1');

      expect(result).toEqual(mockPolicy);
    });

    it('should update policy', async () => {
      policyRepo.findOne.mockResolvedValue(mockPolicy);
      policyRepo.save.mockImplementation((entity) => entity);

      const result = await service.updatePolicy('policy-1', { name: 'Updated Policy' });

      expect(result.name).toBe('Updated Policy');
    });

    it('should delete policy', async () => {
      policyRepo.findOne.mockResolvedValue(mockPolicy);
      policyRepo.save.mockImplementation((entity) => entity);

      await service.deletePolicy('policy-1');

      expect(mockPolicy.isActive).toBe(false);
    });
  });

  describe('Policy Evaluation', () => {
    it('should evaluate policy - compliant', async () => {
      policyRepo.findOne.mockResolvedValue(mockPolicy);
      evaluationRepo.create.mockReturnValue(mockEvaluation);
      evaluationRepo.save.mockResolvedValue(mockEvaluation);

      const result = await service.evaluatePolicy('policy-1', { amount: 30000 });

      expect(result.compliant).toBe(true);
    });

    it('should evaluate policy - non-compliant', async () => {
      policyRepo.findOne.mockResolvedValue(mockPolicy);
      evaluationRepo.create.mockReturnValue({ ...mockEvaluation, result: false });
      evaluationRepo.save.mockResolvedValue({ ...mockEvaluation, result: false });

      const result = await service.evaluatePolicy('policy-1', { amount: 60000 });

      expect(result.compliant).toBe(false);
    });

    it('should evaluate multiple policies', async () => {
      policyRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPolicy]),
      });
      evaluationRepo.create.mockReturnValue(mockEvaluation);
      evaluationRepo.save.mockResolvedValue(mockEvaluation);

      const result = await service.evaluatePolicies({ amount: 30000 });

      expect(result).toBeDefined();
    });
  });

  describe('Policy Operations', () => {
    it('should activate policy', async () => {
      policyRepo.findOne.mockResolvedValue({ ...mockPolicy, isActive: false });
      policyRepo.save.mockImplementation((entity) => entity);

      const result = await service.activatePolicy('policy-1');

      expect(result.isActive).toBe(true);
    });

    it('should deactivate policy', async () => {
      policyRepo.findOne.mockResolvedValue({ ...mockPolicy, isActive: true });
      policyRepo.save.mockImplementation((entity) => entity);

      const result = await service.deactivatePolicy('policy-1');

      expect(result.isActive).toBe(false);
    });

    it('should enforce policy', async () => {
      policyRepo.findOne.mockResolvedValue({ ...mockPolicy, isEnforced: false });
      policyRepo.save.mockImplementation((entity) => entity);

      const result = await service.enforcePolicy('policy-1', true);

      expect(result.isEnforced).toBe(true);
    });
  });

  describe('History', () => {
    it('should get policy evaluation history', async () => {
      evaluationRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockEvaluation]),
      });

      const result = await service.getPolicyHistory('policy-1');

      expect(result).toBeDefined();
    });
  });
});
