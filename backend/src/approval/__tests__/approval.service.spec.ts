import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ApprovalService } from '../approval.service';
import { Approval, ApprovalPolicy } from '../entities/approval.entity';

describe('ApprovalService', () => {
  let service: ApprovalService;
  let approvalRepo: any;
  let policyRepo: any;
  let eventEmitter: any;

  const mockApproval: Partial<Approval> = {
    id: 'approval-1',
    type: 'purchase',
    title: 'Buy iPhone 15 Pro',
    description: 'High-value purchase',
    status: 'pending',
    priority: 'high',
    requestedBy: 'user-1',
    requestedAt: new Date(),
  };

  const mockPolicy: Partial<ApprovalPolicy> = {
    id: 'policy-1',
    name: 'High Value Purchase',
    description: 'Requires approval for purchases over 50000',
    type: 'purchase',
    threshold: 50000,
    isActive: true,
    approverRoles: ['manager', 'admin'],
  };

  beforeEach(async () => {
    approvalRepo = {
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

    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalService,
        { provide: getRepositoryToken(Approval), useValue: approvalRepo },
        { provide: getRepositoryToken(ApprovalPolicy), useValue: policyRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<ApprovalService>(ApprovalService);
  });

  describe('Approval CRUD', () => {
    it('should create an approval request', async () => {
      approvalRepo.create.mockReturnValue(mockApproval);
      approvalRepo.save.mockResolvedValue(mockApproval);

      const result = await service.createApproval({
        type: 'purchase',
        title: 'Buy iPhone 15 Pro',
        description: 'High-value purchase',
        priority: 'high',
        requestedBy: 'user-1',
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Buy iPhone 15 Pro');
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should find approval by id', async () => {
      approvalRepo.findOne.mockResolvedValue(mockApproval);

      const result = await service.findApproval('approval-1');

      expect(result).toEqual(mockApproval);
    });

    it('should find pending approvals', async () => {
      approvalRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockApproval]),
      });

      const result = await service.findPendingApprovals();

      expect(result.length).toBe(1);
    });

    it('should update approval', async () => {
      approvalRepo.findOne.mockResolvedValue(mockApproval);
      approvalRepo.save.mockImplementation((entity) => entity);

      const result = await service.updateApproval('approval-1', { description: 'Updated' });

      expect(result.description).toBe('Updated');
    });
  });

  describe('Approval Actions', () => {
    it('should approve request', async () => {
      approvalRepo.findOne.mockResolvedValue({ ...mockApproval, status: 'pending' });
      approvalRepo.save.mockImplementation((entity) => entity);

      const result = await service.approve('approval-1', 'manager-1', 'Looks good');

      expect(result.status).toBe('approved');
      expect(result.approvedBy).toBe('manager-1');
      expect(result.approvedAt).toBeDefined();
    });

    it('should reject request', async () => {
      approvalRepo.findOne.mockResolvedValue({ ...mockApproval, status: 'pending' });
      approvalRepo.save.mockImplementation((entity) => entity);

      const result = await service.reject('approval-1', 'manager-1', 'Too expensive');

      expect(result.status).toBe('rejected');
      expect(result.rejectedBy).toBe('manager-1');
      expect(result.rejectionReason).toBe('Too expensive');
    });

    it('should not approve already processed request', async () => {
      approvalRepo.findOne.mockResolvedValue({ ...mockApproval, status: 'approved' });

      await expect(service.approve('approval-1', 'manager-1')).rejects.toThrow(BadRequestException);
    });

    it('should escalate request', async () => {
      approvalRepo.findOne.mockResolvedValue({ ...mockApproval, status: 'pending', escalationLevel: 0 });
      approvalRepo.save.mockImplementation((entity) => entity);

      const result = await service.escalate('approval-1', 'director-1');

      expect(result.escalationLevel).toBe(1);
      expect(result.escalatedTo).toBe('director-1');
    });
  });

  describe('Approval Policies', () => {
    it('should create approval policy', async () => {
      policyRepo.create.mockReturnValue(mockPolicy);
      policyRepo.save.mockResolvedValue(mockPolicy);

      const result = await service.createPolicy({
        name: 'High Value Purchase',
        type: 'purchase',
        threshold: 50000,
      });

      expect(result).toBeDefined();
    });

    it('should evaluate if approval is required', async () => {
      policyRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPolicy]),
      });

      const result = await service.isApprovalRequired('purchase', 60000);

      expect(result).toBe(true);
    });

    it('should not require approval for low value', async () => {
      policyRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPolicy]),
      });

      const result = await service.isApprovalRequired('purchase', 10000);

      expect(result).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should get approval stats', async () => {
      approvalRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockApproval]),
      });

      const result = await service.getApprovalStats();

      expect(result).toBeDefined();
    });
  });
});
