import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tool } from './entities/tool.entity';
import { ToolInvocation, InvocationStatus } from './entities/tool-invocation.entity';
import { CreateToolDto, UpdateToolDto, InvokeToolDto, QueryToolsDto } from './dto/tool-bus.dto';

export interface ToolHandler {
  execute(input: Record<string, any>): Promise<Record<string, any>>;
}

@Injectable()
export class ToolBusService {
  private readonly logger = new Logger(ToolBusService.name);
  private handlers: Map<string, ToolHandler> = new Map();

  constructor(
    @InjectRepository(Tool)
    private toolRepository: Repository<Tool>,
    @InjectRepository(ToolInvocation)
    private invocationRepository: Repository<ToolInvocation>,
  ) {
    this.registerDefaultHandlers();
  }

  // ============ TOOL MANAGEMENT ============

  async createTool(dto: CreateToolDto): Promise<Tool> {
    const existing = await this.toolRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new BadRequestException(`Tool ${dto.name} already exists`);
    }

    const tool = this.toolRepository.create(dto);
    return this.toolRepository.save(tool);
  }

  async findAll(query: QueryToolsDto): Promise<Tool[]> {
    const qb = this.toolRepository.createQueryBuilder('t');

    if (query.category) {
      qb.andWhere('t.category = :category', { category: query.category });
    }

    if (query.systemOnly) {
      qb.andWhere('t.isSystem = true');
    }

    if (query.search) {
      qb.andWhere(
        '(t.name ILIKE :search OR t.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    return qb.orderBy('t.name', 'ASC').getMany();
  }

  async findById(id: string): Promise<Tool> {
    const tool = await this.toolRepository.findOne({ where: { id } });
    if (!tool) {
      throw new NotFoundException(`Tool ${id} not found`);
    }
    return tool;
  }

  async findByName(name: string): Promise<Tool> {
    const tool = await this.toolRepository.findOne({ where: { name } });
    if (!tool) {
      throw new NotFoundException(`Tool ${name} not found`);
    }
    return tool;
  }

  async updateTool(id: string, dto: UpdateToolDto): Promise<Tool> {
    const tool = await this.findById(id);
    Object.assign(tool, dto);
    return this.toolRepository.save(tool);
  }

  async deleteTool(id: string): Promise<void> {
    const tool = await this.findById(id);
    if (tool.isSystem) {
      throw new BadRequestException('Cannot delete system tools');
    }
    await this.toolRepository.remove(tool);
    this.handlers.delete(tool.name);
  }

  // ============ TOOL INVOCATION ============

  async invoke(toolName: string, userId: string | null, dto: InvokeToolDto): Promise<ToolInvocation> {
    const tool = await this.findByName(toolName);

    // Create invocation record
    const invocation = this.invocationRepository.create({
      toolId: tool.id,
      userId,
      agentInstanceId: dto.agentInstanceId,
      correlationId: dto.correlationId,
      inputData: dto.input,
      status: InvocationStatus.PENDING,
    });

    const saved = await this.invocationRepository.save(invocation);

    // Execute asynchronously
    this.executeInvocation(saved, tool, dto.input).catch((err) => {
      this.logger.error(`Tool invocation failed: ${err.message}`);
    });

    return saved;
  }

  private async executeInvocation(
    invocation: ToolInvocation,
    tool: Tool,
    input: Record<string, any>,
  ): Promise<void> {
    try {
      await this.invocationRepository.update(invocation.id, {
        status: InvocationStatus.RUNNING,
        startedAt: new Date(),
      });

      const handler = this.handlers.get(tool.name);
      if (!handler) {
        throw new Error(`No handler registered for tool ${tool.name}`);
      }

      const startTime = Date.now();
      const output = await handler.execute(input);
      const executionTime = Date.now() - startTime;

      await this.invocationRepository.update(invocation.id, {
        status: InvocationStatus.COMPLETED,
        outputData: output,
        executionTimeMs: executionTime,
        completedAt: new Date(),
      });

      this.logger.debug(`Tool ${tool.name} executed in ${executionTime}ms`);
    } catch (error) {
      const executionTime = Date.now() - (
        invocation.startedAt ? invocation.startedAt.getTime() : Date.now()
      );

      await this.invocationRepository.update(invocation.id, {
        status: error.message.includes('timeout') 
          ? InvocationStatus.TIMEOUT 
          : InvocationStatus.FAILED,
        errorMessage: error.message,
        executionTimeMs: executionTime,
        completedAt: new Date(),
      });

      this.logger.error(`Tool ${tool.name} failed: ${error.message}`);
    }
  }

  async getInvocation(id: string): Promise<ToolInvocation> {
    const invocation = await this.invocationRepository.findOne({
      where: { id },
      relations: ['tool'],
    });

    if (!invocation) {
      throw new NotFoundException(`Invocation ${id} not found`);
    }

    return invocation;
  }

  async getInvocationHistory(
    userId?: string,
    toolId?: string,
    limit = 50,
  ): Promise<ToolInvocation[]> {
    const qb = this.invocationRepository
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.tool', 'tool');

    if (userId) {
      qb.andWhere('i.userId = :userId', { userId });
    }

    if (toolId) {
      qb.andWhere('i.toolId = :toolId', { toolId });
    }

    return qb
      .orderBy('i.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  // ============ HANDLER REGISTRATION ============

  private registerDefaultHandlers(): void {
    // Search products
    this.registerHandler('search.products', {
      execute: async (input) => {
        // Would call product search service
        return { results: [], count: 0, query: input.query };
      },
    });

    // Get price history
    this.registerHandler('get.price_history', {
      execute: async (input) => {
        return { productId: input.productId, history: [] };
      },
    });

    // Compare products
    this.registerHandler('compare.products', {
      execute: async (input) => {
        return { productIds: input.productIds, comparison: {} };
      },
    });

    // Get recommendations
    this.registerHandler('get.recommendations', {
      execute: async (input) => {
        return { recommendations: [], context: input.context };
      },
    });

    // Send notification
    this.registerHandler('send.notification', {
      execute: async (input) => {
        // Would call notification service
        return { sent: true, userId: input.userId };
      },
    });

    // Create wishlist
    this.registerHandler('create.wishlist', {
      execute: async (input) => {
        return { created: true, productId: input.productId };
      },
    });

    // Check policy
    this.registerHandler('check.policy', {
      execute: async (input) => {
        return { allowed: true, context: input.context };
      },
    });

    // Create approval
    this.registerHandler('create.approval', {
      execute: async (input) => {
        return { created: true, type: input.type };
      },
    });

    // Record metric
    this.registerHandler('record.metric', {
      execute: async (input) => {
        return { recorded: true, metric: input.metricName };
      },
    });

    // Query knowledge graph
    this.registerHandler('query.knowledge_graph', {
      execute: async (input) => {
        return { results: [], query: input.query };
      },
    });

    // Store memory
    this.registerHandler('store.memory', {
      execute: async (input) => {
        return { stored: true, key: input.key };
      },
    });

    // Recall memory
    this.registerHandler('recall.memory', {
      execute: async (input) => {
        return { recalled: true, key: input.key, value: null };
      },
    });

    this.logger.log(`Registered ${this.handlers.size} default tool handlers`);
  }

  registerHandler(name: string, handler: ToolHandler): void {
    this.handlers.set(name, handler);
    this.logger.debug(`Registered handler for tool: ${name}`);
  }

  unregisterHandler(name: string): void {
    this.handlers.delete(name);
    this.logger.debug(`Unregistered handler for tool: ${name}`);
  }

  hasHandler(name: string): boolean {
    return this.handlers.has(name);
  }

  // ============ CATEGORIES ============

  async getCategories(): Promise<{ category: string; count: number }[]> {
    return this.toolRepository
      .createQueryBuilder('t')
      .select('t.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('t.category')
      .getRawMany();
  }

  // ============ STATISTICS ============

  async getToolStats(toolName: string): Promise<{
    totalInvocations: number;
    successRate: number;
    avgExecutionTime: number;
    lastInvoked: Date | null;
  }> {
    const tool = await this.findByName(toolName);

    const invocations = await this.invocationRepository.find({
      where: { toolId: tool.id },
      order: { createdAt: 'DESC' },
      take: 1000,
    });

    const completed = invocations.filter(
      (i) => i.status === InvocationStatus.COMPLETED,
    ).length;
    const failed = invocations.filter(
      (i) => i.status === InvocationStatus.FAILED || 
             i.status === InvocationStatus.TIMEOUT,
    ).length;

    const executionTimes = invocations
      .filter((i) => i.executionTimeMs)
      .map((i) => i.executionTimeMs!);
    const avgTime = executionTimes.length > 0
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
      : 0;

    return {
      totalInvocations: invocations.length,
      successRate: invocations.length > 0 ? completed / invocations.length : 0,
      avgExecutionTime: avgTime,
      lastInvoked: invocations[0]?.createdAt || null,
    };
  }
}
