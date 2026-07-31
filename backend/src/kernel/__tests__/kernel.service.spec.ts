import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { KernelService } from '../kernel.service';
import { Agent, AgentInstance, ToolDefinition } from '../entities/kernel.entity';

describe('KernelService', () => {
  let service: KernelService;
  let agentRepo: any;
  let instanceRepo: any;
  let toolRepo: any;
  let eventEmitter: any;

  const mockAgent: Partial<Agent> = {
    id: 'agent-1',
    name: 'ShoppingAssistant',
    description: 'AI assistant for shopping',
    agentType: 'shopping',
    capabilities: ['product_search', 'price_comparison', 'recommendations'],
    configuration: { model: 'gpt-4', temperature: 0.7 },
    isActive: true,
  };

  const mockInstance: Partial<AgentInstance> = {
    id: 'instance-1',
    agentId: 'agent-1',
    name: 'ShoppingAssistant-1',
    status: 'idle',
    sessionId: 'session-1',
    memoryUsage: 1024,
    currentTask: null,
  };

  beforeEach(async () => {
    agentRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    instanceRepo = {
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

    toolRepo = {
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

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KernelService,
        { provide: getRepositoryToken(Agent), useValue: agentRepo },
        { provide: getRepositoryToken(AgentInstance), useValue: instanceRepo },
        { provide: getRepositoryToken(ToolDefinition), useValue: toolRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<KernelService>(KernelService);
  });

  describe('Agent Management', () => {
    it('should create a new agent', async () => {
      agentRepo.create.mockReturnValue(mockAgent);
      agentRepo.save.mockResolvedValue(mockAgent);

      const result = await service.createAgent({
        name: 'ShoppingAssistant',
        description: 'AI assistant for shopping',
        agentType: 'shopping',
        capabilities: ['product_search', 'price_comparison'],
      });

      expect(result).toBeDefined();
      expect(agentRepo.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('agent.created', expect.any(Object));
    });

    it('should find agent by id', async () => {
      agentRepo.findOne.mockResolvedValue(mockAgent);

      const result = await service.findAgent('agent-1');

      expect(result).toEqual(mockAgent);
      expect(agentRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'agent-1' },
        relations: ['instances'],
      });
    });

    it('should throw NotFoundException if agent not found', async () => {
      agentRepo.findOne.mockResolvedValue(null);

      await expect(service.findAgent('agent-999')).rejects.toThrow(NotFoundException);
    });

    it('should update agent', async () => {
      agentRepo.findOne.mockResolvedValue(mockAgent);
      agentRepo.save.mockImplementation((entity) => entity);

      const result = await service.updateAgent('agent-1', { name: 'UpdatedAgent' });

      expect(result.name).toBe('UpdatedAgent');
    });

    it('should delete agent', async () => {
      agentRepo.findOne.mockResolvedValue(mockAgent);
      agentRepo.delete.mockResolvedValue(undefined);

      await service.deleteAgent('agent-1');

      expect(agentRepo.delete).toHaveBeenCalledWith('agent-1');
    });

    it('should activate agent', async () => {
      agentRepo.findOne.mockResolvedValue({ ...mockAgent, isActive: false });
      agentRepo.save.mockImplementation((entity) => entity);

      const result = await service.activateAgent('agent-1');

      expect(result.isActive).toBe(true);
    });
  });

  describe('Instance Management', () => {
    it('should start agent instance', async () => {
      agentRepo.findOne.mockResolvedValue(mockAgent);
      instanceRepo.create.mockReturnValue(mockInstance);
      instanceRepo.save.mockResolvedValue(mockInstance);

      const result = await service.startInstance('agent-1', { sessionId: 'session-1' });

      expect(result).toBeDefined();
      expect(instanceRepo.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('instance.started', expect.any(Object));
    });

    it('should pause instance', async () => {
      instanceRepo.findOne.mockResolvedValue({ ...mockInstance, status: 'running' });
      instanceRepo.save.mockImplementation((entity) => entity);

      const result = await service.pauseInstance('instance-1');

      expect(result.status).toBe('paused');
    });

    it('should resume paused instance', async () => {
      instanceRepo.findOne.mockResolvedValue({ ...mockInstance, status: 'paused' });
      instanceRepo.save.mockImplementation((entity) => entity);

      const result = await service.resumeInstance('instance-1');

      expect(result.status).toBe('running');
    });

    it('should cancel running instance', async () => {
      instanceRepo.findOne.mockResolvedValue({ ...mockInstance, status: 'running' });
      instanceRepo.save.mockImplementation((entity) => entity);

      const result = await service.cancelInstance('instance-1');

      expect(result.status).toBe('cancelled');
    });

    it('should get instance health', async () => {
      instanceRepo.findOne.mockResolvedValue({
        ...mockInstance,
        memoryUsage: 512,
        cpuUsage: 25,
      });

      const result = await service.getInstanceHealth('instance-1');

      expect(result.instanceId).toBe('instance-1');
      expect(result.memoryUsage).toBe(512);
    });
  });

  describe('Tool Management', () => {
    it('should register tool', async () => {
      const mockTool = { id: 'tool-1', name: 'get_weather', toolType: 'function' };
      toolRepo.create.mockReturnValue(mockTool);
      toolRepo.save.mockResolvedValue(mockTool);

      const result = await service.registerTool({
        name: 'get_weather',
        toolType: 'function',
        schema: { type: 'object', properties: {} },
      });

      expect(result).toBeDefined();
      expect(eventEmitter.emit).toHaveBeenCalledWith('tool.registered', expect.any(Object));
    });

    it('should find tool by name', async () => {
      const mockTool = { id: 'tool-1', name: 'get_weather' };
      toolRepo.findOne.mockResolvedValue(mockTool);

      const result = await service.findToolByName('get_weather');

      expect(result).toEqual(mockTool);
    });

    it('should execute tool', async () => {
      const mockTool = {
        id: 'tool-1',
        name: 'get_weather',
        isActive: true,
        configuration: { timeout: 5000 },
      };
      toolRepo.findOne.mockResolvedValue(mockTool);
      instanceRepo.findOne.mockResolvedValue({ ...mockInstance, status: 'running' });
      toolRepo.save.mockImplementation((entity) => entity);

      const result = await service.executeTool('tool-1', 'instance-1', { location: 'NYC' });

      expect(result).toBeDefined();
    });
  });

  describe('Metrics', () => {
    it('should get kernel metrics', async () => {
      agentRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockAgent]),
      });
      instanceRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockInstance]),
      });

      const result = await service.getKernelMetrics();

      expect(result.totalAgents).toBe(1);
      expect(result.activeInstances).toBe(1);
    });
  });
});
