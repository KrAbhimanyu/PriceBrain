import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { WorkflowService } from '../workflow.service';
import { Workflow, WorkflowInstance, WorkflowStep } from '../entities/workflow.entity';

describe('WorkflowService', () => {
  let service: WorkflowService;
  let workflowRepo: any;
  let instanceRepo: any;
  let stepRepo: any;
  let eventEmitter: any;

  const mockWorkflow: Partial<Workflow> = {
    id: 'wf-1',
    name: 'Order Processing',
    description: 'Process customer orders',
    version: '1.0',
    definition: {
      steps: [
        { id: 'step1', name: 'Validate Order', next: 'step2' },
        { id: 'step2', name: 'Process Payment', next: null },
      ],
    },
    isActive: true,
  };

  const mockInstance: Partial<WorkflowInstance> = {
    id: 'instance-1',
    workflowId: 'wf-1',
    status: 'running',
    currentStep: 'step1',
    context: { orderId: 'ord-1' },
  };

  beforeEach(async () => {
    workflowRepo = {
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

    instanceRepo = {
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

    stepRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowService,
        { provide: getRepositoryToken(Workflow), useValue: workflowRepo },
        { provide: getRepositoryToken(WorkflowInstance), useValue: instanceRepo },
        { provide: getRepositoryToken(WorkflowStep), useValue: stepRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
  });

  describe('Workflow CRUD', () => {
    it('should create a workflow', async () => {
      workflowRepo.create.mockReturnValue(mockWorkflow);
      workflowRepo.save.mockResolvedValue(mockWorkflow);

      const result = await service.createWorkflow({
        name: 'Order Processing',
        description: 'Process customer orders',
        definition: { steps: [] },
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Order Processing');
    });

    it('should find workflow by id', async () => {
      workflowRepo.findOne.mockResolvedValue(mockWorkflow);

      const result = await service.findWorkflow('wf-1');

      expect(result).toEqual(mockWorkflow);
    });

    it('should update workflow', async () => {
      workflowRepo.findOne.mockResolvedValue(mockWorkflow);
      workflowRepo.save.mockImplementation((entity) => entity);

      const result = await service.updateWorkflow('wf-1', { description: 'Updated' });

      expect(result.description).toBe('Updated');
    });

    it('should delete workflow', async () => {
      workflowRepo.findOne.mockResolvedValue(mockWorkflow);
      workflowRepo.save.mockImplementation((entity) => entity);

      await service.deleteWorkflow('wf-1');

      expect(mockWorkflow.isActive).toBe(false);
    });
  });

  describe('Workflow Execution', () => {
    it('should start workflow instance', async () => {
      workflowRepo.findOne.mockResolvedValue(mockWorkflow);
      instanceRepo.create.mockReturnValue(mockInstance);
      instanceRepo.save.mockResolvedValue(mockInstance);

      const result = await service.startInstance('wf-1', { orderId: 'ord-1' });

      expect(result).toBeDefined();
      expect(result.status).toBe('running');
    });

    it('should pause instance', async () => {
      instanceRepo.findOne.mockResolvedValue({ ...mockInstance, status: 'running' });
      instanceRepo.save.mockImplementation((entity) => entity);

      const result = await service.pauseInstance('instance-1');

      expect(result.status).toBe('paused');
    });

    it('should resume instance', async () => {
      instanceRepo.findOne.mockResolvedValue({ ...mockInstance, status: 'paused' });
      instanceRepo.save.mockImplementation((entity) => entity);

      const result = await service.resumeInstance('instance-1');

      expect(result.status).toBe('running');
    });

    it('should cancel instance', async () => {
      instanceRepo.findOne.mockResolvedValue({ ...mockInstance, status: 'running' });
      instanceRepo.save.mockImplementation((entity) => entity);

      const result = await service.cancelInstance('instance-1', 'User cancelled');

      expect(result.status).toBe('cancelled');
      expect(result.cancelReason).toBe('User cancelled');
    });
  });

  describe('Step Execution', () => {
    it('should execute next step', async () => {
      instanceRepo.findOne.mockResolvedValue(mockInstance);
      stepRepo.create.mockReturnValue({ id: 'step-exec-1' });
      stepRepo.save.mockResolvedValue({ id: 'step-exec-1' });
      instanceRepo.save.mockImplementation((entity) => entity);

      const result = await service.executeNextStep('instance-1');

      expect(result).toBeDefined();
    });

    it('should handle step failure', async () => {
      instanceRepo.findOne.mockResolvedValue(mockInstance);
      instanceRepo.save.mockImplementation((entity) => entity);

      const result = await service.handleStepFailure('instance-1', 'step1', 'Payment failed');

      expect(result.status).toBe('failed');
    });
  });

  describe('Workflow Versioning', () => {
    it('should create new version', async () => {
      workflowRepo.findOne.mockResolvedValue({ ...mockWorkflow, version: '1.0' });
      workflowRepo.save.mockImplementation((entity) => entity);

      const result = await service.createNewVersion('wf-1', { steps: [] });

      expect(result.version).toBe('1.1');
    });
  });
});
