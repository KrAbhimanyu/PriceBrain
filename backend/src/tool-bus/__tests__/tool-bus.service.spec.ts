import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ToolBusService } from '../tool-bus.service';
import { Tool, ToolInvocation } from '../entities/tool-bus.entity';

describe('ToolBusService', () => {
  let service: ToolBusService;
  let toolRepo: any;
  let invocationRepo: any;
  let eventEmitter: any;

  const mockTool: Partial<Tool> = {
    id: 'tool-1',
    name: 'get_product_info',
    description: 'Get detailed product information',
    category: 'product',
    toolType: 'function',
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string', required: true },
      },
    },
    configuration: { timeout: 5000, retries: 3 },
    isActive: true,
    rateLimit: { requests: 100, window: 'minute' },
  };

  const mockInvocation: Partial<ToolInvocation> = {
    id: 'invocation-1',
    toolId: 'tool-1',
    toolName: 'get_product_info',
    status: 'success',
    duration: 245,
    inputParameters: { productId: 'prod-1' },
    output: { name: 'Test Product', price: 999 },
  };

  beforeEach(async () => {
    toolRepo = {
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

    invocationRepo = {
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

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolBusService,
        { provide: getRepositoryToken(Tool), useValue: toolRepo },
        { provide: getRepositoryToken(ToolInvocation), useValue: invocationRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<ToolBusService>(ToolBusService);
  });

  describe('Tool Management', () => {
    it('should register a new tool', async () => {
      toolRepo.create.mockReturnValue(mockTool);
      toolRepo.save.mockResolvedValue(mockTool);

      const result = await service.registerTool({
        name: 'get_product_info',
        description: 'Get detailed product information',
        category: 'product',
        toolType: 'function',
        schema: { type: 'object', properties: {} },
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('get_product_info');
      expect(eventEmitter.emit).toHaveBeenCalledWith('tool.registered', expect.any(Object));
    });

    it('should find tool by id', async () => {
      toolRepo.findOne.mockResolvedValue(mockTool);

      const result = await service.findTool('tool-1');

      expect(result).toEqual(mockTool);
    });

    it('should throw NotFoundException if tool not found', async () => {
      toolRepo.findOne.mockResolvedValue(null);

      await expect(service.findTool('tool-999')).rejects.toThrow(NotFoundException);
    });

    it('should find tool by name', async () => {
      toolRepo.findOne.mockResolvedValue(mockTool);

      const result = await service.findToolByName('get_product_info');

      expect(result.name).toBe('get_product_info');
    });

    it('should update tool', async () => {
      toolRepo.findOne.mockResolvedValue(mockTool);
      toolRepo.save.mockImplementation((entity) => entity);

      const result = await service.updateTool('tool-1', { description: 'Updated description' });

      expect(result.description).toBe('Updated description');
    });

    it('should delete tool', async () => {
      toolRepo.findOne.mockResolvedValue(mockTool);
      toolRepo.save.mockImplementation((entity) => entity);

      await service.deleteTool('tool-1');

      expect(toolRepo.save).toHaveBeenCalled();
    });

    it('should activate tool', async () => {
      toolRepo.findOne.mockResolvedValue({ ...mockTool, isActive: false });
      toolRepo.save.mockImplementation((entity) => entity);

      const result = await service.activateTool('tool-1');

      expect(result.isActive).toBe(true);
    });

    it('should deactivate tool', async () => {
      toolRepo.findOne.mockResolvedValue({ ...mockTool, isActive: true });
      toolRepo.save.mockImplementation((entity) => entity);

      const result = await service.deactivateTool('tool-1');

      expect(result.isActive).toBe(false);
    });
  });

  describe('Tool Invocation', () => {
    it('should invoke tool by name', async () => {
      toolRepo.findOne.mockResolvedValue({ ...mockTool, isActive: true });
      invocationRepo.create.mockReturnValue(mockInvocation);
      invocationRepo.save.mockResolvedValue(mockInvocation);

      const result = await service.invokeTool('get_product_info', { productId: 'prod-1' });

      expect(result).toBeDefined();
      expect(result.toolName).toBe('get_product_info');
      expect(eventEmitter.emit).toHaveBeenCalledWith('tool.invoked', expect.any(Object));
    });

    it('should throw BadRequestException if tool is inactive', async () => {
      toolRepo.findOne.mockResolvedValue({ ...mockTool, isActive: false });

      await expect(
        service.invokeTool('get_product_info', { productId: 'prod-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should record failed invocation', async () => {
      toolRepo.findOne.mockResolvedValue({ ...mockTool, isActive: true });
      invocationRepo.create.mockReturnValue({ ...mockInvocation, status: 'failed' });
      invocationRepo.save.mockResolvedValue({ ...mockInvocation, status: 'failed' });

      const result = await service.invokeTool('get_product_info', { productId: 'invalid' });

      expect(result.status).toBe('failed');
    });

    it('should find invocation by id', async () => {
      invocationRepo.findOne.mockResolvedValue(mockInvocation);

      const result = await service.findInvocation('invocation-1');

      expect(result).toEqual(mockInvocation);
    });

    it('should get invocations by tool', async () => {
      invocationRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockInvocation]),
      });

      const result = await service.getInvocationsByTool('tool-1');

      expect(result.length).toBe(1);
    });
  });

  describe('Tool Discovery', () => {
    it('should get tools by category', async () => {
      toolRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTool]),
      });

      const result = await service.getToolsByCategory('product');

      expect(result.length).toBe(1);
      expect(result[0].category).toBe('product');
    });

    it('should get all categories', async () => {
      toolRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ category: 'product' }, { category: 'order' }]),
      });

      const result = await service.getCategories();

      expect(result.length).toBe(2);
    });

    it('should search tools by name', async () => {
      toolRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTool]),
      });

      const result = await service.searchTools('product');

      expect(result.length).toBe(1);
    });

    it('should get active tools', async () => {
      toolRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTool]),
      });

      const result = await service.getActiveTools();

      expect(result.length).toBe(1);
      expect(result[0].isActive).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should get tool bus stats', async () => {
      toolRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTool]),
      });
      invocationRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockInvocation]),
      });

      const result = await service.getToolBusStats();

      expect(result.totalTools).toBe(1);
      expect(result.totalInvocations).toBe(1);
    });

    it('should get tool performance metrics', async () => {
      invocationRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { ...mockInvocation, duration: 100 },
          { ...mockInvocation, duration: 200 },
          { ...mockInvocation, duration: 150 },
        ]),
      });

      const result = await service.getToolMetrics('tool-1');

      expect(result.totalInvocations).toBe(3);
      expect(result.avgDuration).toBeCloseTo(150, 0);
    });
  });
});
