import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { GovernanceService } from '../governance.service';
import { GovernancePolicy, GovernanceAudit, GovernanceReport } from '../entities/governance.entity';

describe('GovernanceService', () => {
  let service: GovernanceService;
  let policyRepo: any;
  let auditRepo: any;
  let reportRepo: any;
  let eventEmitter: any;

  const mockPolicy: Partial<GovernancePolicy> = {
    id: 'policy-1',
    organizationId: 'org-1',
    policyType: 'security',
    title: 'Data Protection Policy',
    description: 'Protect customer data',
    enforcementLevel: 'enforcing',
    status: 'active',
  };

  const mockAudit: Partial<GovernanceAudit> = {
    id: 'audit-1',
    organizationId: 'org-1',
    auditType: 'security',
    overallStatus: 'pending',
  };

  beforeEach(async () => {
    policyRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    auditRepo = {
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

    reportRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GovernanceService,
        {
          provide: getRepositoryToken(GovernancePolicy),
          useValue: policyRepo,
        },
        {
          provide: getRepositoryToken(GovernanceAudit),
          useValue: auditRepo,
        },
        {
          provide: getRepositoryToken(GovernanceReport),
          useValue: reportRepo,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<GovernanceService>(GovernanceService);
  });

  describe('createPolicy', () => {
    it('should create a new governance policy', async () => {
      policyRepo.create.mockReturnValue(mockPolicy);
      policyRepo.save.mockResolvedValue(mockPolicy);

      const result = await service.createPolicy({
        organizationId: 'org-1',
        policyType: 'security',
        title: 'Data Protection Policy',
      });

      expect(result).toBeDefined();
      expect(policyRepo.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('governance.policy.created', expect.any(Object));
    });
  });

  describe('findPolicy', () => {
    it('should return a policy by id', async () => {
      policyRepo.findOne.mockResolvedValue(mockPolicy);

      const result = await service.findPolicy('policy-1');

      expect(result).toEqual(mockPolicy);
      expect(policyRepo.findOne).toHaveBeenCalledWith({ where: { id: 'policy-1' } });
    });

    it('should throw NotFoundException if policy not found', async () => {
      policyRepo.findOne.mockResolvedValue(null);

      await expect(service.findPolicy('policy-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('evaluatePolicy', () => {
    it('should return true for compliant context', async () => {
      const policyWithRules = {
        ...mockPolicy,
        rules: [
          { condition: { field: 'amount', operator: 'lt', value: 10000 } },
        ],
      };
      policyRepo.findOne.mockResolvedValue(policyWithRules);

      const result = await service.evaluatePolicy('policy-1', { amount: 5000 });

      expect(result).toBe(true);
    });

    it('should return false for non-compliant context', async () => {
      const policyWithRules = {
        ...mockPolicy,
        rules: [
          { condition: { field: 'amount', operator: 'lt', value: 10000 } },
        ],
      };
      policyRepo.findOne.mockResolvedValue(policyWithRules);

      const result = await service.evaluatePolicy('policy-1', { amount: 15000 });

      expect(result).toBe(false);
    });
  });

  describe('createAudit', () => {
    it('should create a new audit', async () => {
      auditRepo.create.mockReturnValue(mockAudit);
      auditRepo.save.mockResolvedValue(mockAudit);

      const result = await service.createAudit({
        organizationId: 'org-1',
        auditType: 'security',
      });

      expect(result).toBeDefined();
      expect(eventEmitter.emit).toHaveBeenCalledWith('governance.audit.created', expect.any(Object));
    });
  });

  describe('completeAudit', () => {
    it('should complete an audit with results', async () => {
      auditRepo.findOne.mockResolvedValue({ ...mockAudit });
      auditRepo.save.mockImplementation((entity) => entity);

      const result = await service.completeAudit('audit-1', {
        findings: [{ severity: 'low', description: 'Minor issue' }],
        violations: [],
        recommendations: [{ priority: 'low', description: 'Improve logging' }],
        complianceScore: 95,
      });

      expect(result.overallStatus).toBe('completed');
      expect(result.complianceScore).toBe(95);
      expect(result.findings).toHaveLength(1);
    });
  });

  describe('generateReport', () => {
    it('should generate a governance report', async () => {
      const mockReport = {
        id: 'report-1',
        organizationId: 'org-1',
        reportType: 'monthly',
        title: 'Monthly Report',
        summary: 'Test summary',
        status: 'draft',
      };

      policyRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPolicy]),
      });

      auditRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockAudit]),
      });

      reportRepo.create.mockReturnValue(mockReport);
      reportRepo.save.mockResolvedValue(mockReport);

      const result = await service.generateReport('org-1', 'monthly');

      expect(result).toBeDefined();
      expect(reportRepo.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('governance.report.generated', expect.any(Object));
    });
  });

  describe('checkCompliance', () => {
    it('should return compliant status for high scores', async () => {
      policyRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPolicy]),
      });

      auditRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { complianceScore: 95 },
          { complianceScore: 90 },
        ]),
      });

      const result = await service.checkCompliance('org-1');

      expect(result.status).toBe('compliant');
      expect(result.complianceScore).toBeCloseTo(92.5, 1);
      expect(result.activePolicies).toBe(1);
    });

    it('should return partial status for medium scores', async () => {
      policyRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPolicy]),
      });

      auditRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { complianceScore: 70 },
        ]),
      });

      const result = await service.checkCompliance('org-1');

      expect(result.status).toBe('partial');
    });
  });
});
