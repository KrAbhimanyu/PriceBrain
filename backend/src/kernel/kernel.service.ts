import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { Agent, AgentStatus, HealthStatus } from './entities/agent.entity';
import { AgentInstance, InstanceStatus } from './entities/agent-instance.entity';
import { KernelState } from './entities/kernel-state.entity';
import {
  CreateAgentDto,
  UpdateAgentDto,
  StartAgentDto,
  UpdateAgentStateDto,
  QueryAgentsDto,
  KernelHealthDto,
  KernelMetricsDto,
} from './dto/kernel.dto';

export interface KernelHealth {
  overall: HealthStatus;
  components: Record<string, HealthStatus>;
  lastCheck: Date;
  uptime: number;
}

export interface KernelMetrics {
  agents: {
    total: number;
    active: number;
    running: number;
    byType: Record<string, number>;
  };
  instances: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  };
  system: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

@Injectable()
export class KernelService {
  private readonly logger = new Logger(KernelService.name);
  private readonly startTime: Date;
  private healthCache: Map<string, { status: HealthStatus; lastUpdate: Date }> = new Map();

  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(AgentInstance)
    private instanceRepository: Repository<AgentInstance>,
    @InjectRepository(KernelState)
    private kernelStateRepository: Repository<KernelState>,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {
    this.startTime = new Date();
    this.initializeKernel();
  }

  private async initializeKernel(): Promise<void> {
    this.logger.log('Initializing AI Kernel...');

    // Ensure kernel state exists
    const stateKeys = ['platform.status', 'platform.config', 'platform.health'];
    for (const key of stateKeys) {
      const exists = await this.kernelStateRepository.findOne({
        where: { stateKey: key },
      });
      if (!exists) {
        await this.kernelStateRepository.save({
          stateKey: key,
          stateValue: {},
        });
      }
    }

    // Register default system agents
    await this.registerSystemAgents();

    this.logger.log('AI Kernel initialized successfully');
  }

  private async registerSystemAgents(): Promise<void> {
    const systemAgents = [
      {
        name: 'Mission Planner Agent',
        slug: 'mission-planner',
        agentType: 'planner',
        version: '1.0.0',
        capabilities: ['mission_planning', 'task_decomposition', 'goal_breaking'],
        permissions: ['missions:read', 'missions:write', 'tasks:write'],
        isSystem: true,
      },
      {
        name: 'Price Intelligence Agent',
        slug: 'price-intelligence',
        agentType: 'intelligence',
        version: '1.0.0',
        capabilities: ['price_tracking', 'price_prediction', 'deal_discovery'],
        permissions: ['products:read', 'price_history:read', 'alerts:write'],
        isSystem: true,
      },
      {
        name: 'Recommendation Agent',
        slug: 'recommendation',
        agentType: 'recommendation',
        version: '1.0.0',
        capabilities: ['product_recommendation', 'personalization', 'similar_products'],
        permissions: ['products:read', 'user_preferences:read'],
        isSystem: true,
      },
      {
        name: 'Workflow Coordinator Agent',
        slug: 'workflow-coordinator',
        agentType: 'coordinator',
        version: '1.0.0',
        capabilities: ['workflow_execution', 'task_scheduling', 'parallel_processing'],
        permissions: ['workflows:execute', 'tasks:write', 'approvals:read'],
        isSystem: true,
      },
      {
        name: 'Policy Enforcement Agent',
        slug: 'policy-enforcement',
        agentType: 'enforcer',
        version: '1.0.0',
        capabilities: ['policy_evaluation', 'compliance_checking', 'violation_detection'],
        permissions: ['policies:read', 'policies:evaluate'],
        isSystem: true,
      },
    ];

    for (const agentData of systemAgents) {
      const existing = await this.agentRepository.findOne({
        where: { slug: agentData.slug },
      });
      if (!existing) {
        await this.agentRepository.save(agentData);
        this.logger.log(`Registered system agent: ${agentData.name}`);
      }
    }
  }

  // ============ AGENT MANAGEMENT ============

  async createAgent(dto: CreateAgentDto): Promise<Agent> {
    const existing = await this.agentRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException(`Agent with slug ${dto.slug} already exists`);
    }

    const agent = this.agentRepository.create({
      ...dto,
      status: AgentStatus.INACTIVE,
      healthStatus: HealthStatus.UNKNOWN,
      healthChecks: { lastCheck: null, failures: 0 },
    });

    const saved = await this.agentRepository.save(agent);

    // Emit event
    this.eventEmitter.emit('agent.created', { agentId: saved.id, agent: saved });

    return saved;
  }

  async findAllAgents(query: QueryAgentsDto): Promise<Agent[]> {
    const qb = this.agentRepository.createQueryBuilder('a');

    if (query.type) {
      qb.andWhere('a.agentType = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('a.status = :status', { status: query.status });
    }

    if (query.marketplaceOnly) {
      qb.andWhere('a.isMarketplace = true');
    }

    if (query.systemOnly) {
      qb.andWhere('a.isSystem = true');
    }

    return qb.orderBy('a.createdAt', 'DESC').getMany();
  }

  async findAgentById(id: string): Promise<Agent> {
    const agent = await this.agentRepository.findOne({ where: { id } });
    if (!agent) {
      throw new NotFoundException(`Agent ${id} not found`);
    }
    return agent;
  }

  async findAgentBySlug(slug: string): Promise<Agent> {
    const agent = await this.agentRepository.findOne({ where: { slug } });
    if (!agent) {
      throw new NotFoundException(`Agent ${slug} not found`);
    }
    return agent;
  }

  async updateAgent(id: string, dto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.findAgentById(id);
    Object.assign(agent, dto);
    return this.agentRepository.save(agent);
  }

  async deleteAgent(id: string): Promise<void> {
    const agent = await this.findAgentById(id);
    if (agent.isSystem) {
      throw new BadRequestException('Cannot delete system agents');
    }
    await this.agentRepository.remove(agent);
    this.eventEmitter.emit('agent.deleted', { agentId: id });
  }

  async getAgentHealth(id: string): Promise<HealthStatus> {
    const agent = await this.findAgentById(id);
    return agent.healthStatus;
  }

  async updateAgentHealth(id: string, health: KernelHealthDto): Promise<void> {
    const agent = await this.findAgentById(id);

    agent.healthStatus = health.status;
    agent.healthChecks = {
      lastCheck: new Date(),
      status: health.status,
      details: health.details,
      message: health.message,
    };

    await this.agentRepository.save(agent);

    this.healthCache.set(`agent:${id}`, {
      status: health.status,
      lastUpdate: new Date(),
    });

    this.eventEmitter.emit('agent.health_changed', {
      agentId: id,
      health: health,
    });
  }

  // ============ AGENT INSTANCES ============

  async startAgent(agentId: string, userId: string, dto: StartAgentDto): Promise<AgentInstance> {
    const agent = await this.findAgentById(agentId);

    if (agent.status !== AgentStatus.ACTIVE) {
      throw new BadRequestException('Agent must be active to start');
    }

    const instance = this.instanceRepository.create({
      agentId,
      userId,
      missionId: dto.missionId,
      organizationId: dto.organizationId,
      status: InstanceStatus.PENDING,
      state: dto.input || {},
      resources: dto.resources || {},
      startTime: new Date(),
    });

    const saved = await this.instanceRepository.save(instance);

    // Update agent status
    agent.status = AgentStatus.RUNNING;
    await this.agentRepository.save(agent);

    // Emit events
    this.eventEmitter.emit('agent.started', {
      instanceId: saved.id,
      agentId,
      userId,
    });

    this.logger.log(`Agent ${agent.name} started (instance: ${saved.id})`);

    // Simulate async execution
    this.executeAgentInstance(saved).catch((err) => {
      this.logger.error(`Agent execution failed: ${err.message}`);
    });

    return saved;
  }

  private async executeAgentInstance(instance: AgentInstance): Promise<void> {
    try {
      await this.instanceRepository.update(instance.id, {
        status: InstanceStatus.RUNNING,
      });

      // Simulate work - in production this would call the actual agent
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mark as completed
      await this.instanceRepository.update(instance.id, {
        status: InstanceStatus.COMPLETED,
        endTime: new Date(),
      });

      // Update agent status
      await this.agentRepository.update(instance.agentId, {
        status: AgentStatus.ACTIVE,
      });

      this.eventEmitter.emit('agent.completed', {
        instanceId: instance.id,
        agentId: instance.agentId,
      });
    } catch (error) {
      await this.instanceRepository.update(instance.id, {
        status: InstanceStatus.FAILED,
        errorMessage: error.message,
        endTime: new Date(),
      });

      this.eventEmitter.emit('agent.failed', {
        instanceId: instance.id,
        agentId: instance.agentId,
        error: error.message,
      });
    }
  }

  async updateInstanceState(instanceId: string, dto: UpdateAgentStateDto): Promise<AgentInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new NotFoundException(`Instance ${instanceId} not found`);
    }

    if (dto.state) {
      instance.state = { ...instance.state, ...dto.state };
    }

    if (dto.resources) {
      instance.resources = { ...instance.resources, ...dto.resources };
    }

    return this.instanceRepository.save(instance);
  }

  async pauseInstance(instanceId: string): Promise<AgentInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new NotFoundException(`Instance ${instanceId} not found`);
    }

    if (instance.status !== InstanceStatus.RUNNING) {
      throw new BadRequestException('Only running instances can be paused');
    }

    instance.status = InstanceStatus.PAUSED;
    return this.instanceRepository.save(instance);
  }

  async resumeInstance(instanceId: string): Promise<AgentInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new NotFoundException(`Instance ${instanceId} not found`);
    }

    if (instance.status !== InstanceStatus.PAUSED) {
      throw new BadRequestException('Only paused instances can be resumed');
    }

    instance.status = InstanceStatus.RUNNING;
    const saved = await this.instanceRepository.save(instance);

    // Resume execution
    this.executeAgentInstance(saved).catch((err) => {
      this.logger.error(`Agent resume failed: ${err.message}`);
    });

    return saved;
  }

  async cancelInstance(instanceId: string): Promise<AgentInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new NotFoundException(`Instance ${instanceId} not found`);
    }

    instance.status = InstanceStatus.CANCELLED;
    instance.endTime = new Date();
    const saved = await this.instanceRepository.save(instance);

    // Update agent status
    await this.agentRepository.update(instance.agentId, {
      status: AgentStatus.ACTIVE,
    });

    return saved;
  }

  async getInstance(id: string): Promise<AgentInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id },
      relations: ['agent'],
    });

    if (!instance) {
      throw new NotFoundException(`Instance ${id} not found`);
    }

    return instance;
  }

  async getUserInstances(userId: string): Promise<AgentInstance[]> {
    return this.instanceRepository.find({
      where: { userId },
      relations: ['agent'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  // ============ KERNEL STATE ============

  async getKernelState(key: string): Promise<Record<string, any>> {
    const state = await this.kernelStateRepository.findOne({
      where: { stateKey: key },
    });
    return state?.stateValue || {};
  }

  async setKernelState(key: string, value: Record<string, any>): Promise<void> {
    const existing = await this.kernelStateRepository.findOne({
      where: { stateKey: key },
    });

    if (existing) {
      existing.stateValue = value;
      existing.version += 1;
      await this.kernelStateRepository.save(existing);
    } else {
      await this.kernelStateRepository.save({
        stateKey: key,
        stateValue: value,
      });
    }
  }

  // ============ HEALTH & METRICS ============

  async getKernelHealth(): Promise<KernelHealth> {
    const components: Record<string, HealthStatus> = {};

    // Check agent health
    const agents = await this.agentRepository.find();
    for (const agent of agents) {
      const cached = this.healthCache.get(`agent:${agent.id}`);
      if (cached) {
        components[`agent:${agent.slug}`] = cached.status;
      } else {
        components[`agent:${agent.slug}`] = agent.healthStatus;
      }
    }

    // Calculate overall health
    let overall: HealthStatus = HealthStatus.HEALTHY;
    const statuses = Object.values(components);
    if (statuses.includes(HealthStatus.UNHEALTHY)) {
      overall = HealthStatus.UNHEALTHY;
    } else if (statuses.includes(HealthStatus.DEGRADED)) {
      overall = HealthStatus.DEGRADED;
    }

    return {
      overall,
      components,
      lastCheck: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  async getKernelMetrics(): Promise<KernelMetrics> {
    const agents = await this.agentRepository.find();
    const instances = await this.instanceRepository.find({
      where: {
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    });

    const byType: Record<string, number> = {};
    let activeCount = 0;
    let runningCount = 0;

    for (const agent of agents) {
      byType[agent.agentType] = (byType[agent.agentType] || 0) + 1;
      if (agent.status === AgentStatus.ACTIVE) activeCount++;
      if (agent.status === AgentStatus.RUNNING) runningCount++;
    }

    const statusCounts = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };

    for (const inst of instances) {
      statusCounts[inst.status] = (statusCounts[inst.status] || 0) + 1;
    }

    return {
      agents: {
        total: agents.length,
        active: activeCount,
        running: runningCount,
        byType,
      },
      instances: {
        total: instances.length,
        ...statusCounts,
      },
      system: {
        uptime: Date.now() - this.startTime.getTime(),
        memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
        cpuUsage: 0, // Would need OS monitoring
      },
    };
  }

  async recordMetric(dto: KernelMetricsDto): Promise<void> {
    this.eventEmitter.emit('kernel.metric', dto);
    this.logger.debug(`Kernel metric: ${dto.metricType}.${dto.metricName} = ${dto.value}`);
  }

  // ============ LIFECYCLE MANAGEMENT ============

  async shutdown(): Promise<void> {
    this.logger.log('Shutting down AI Kernel...');

    // Stop all running instances
    const runningInstances = await this.instanceRepository.find({
      where: { status: InstanceStatus.RUNNING },
    });

    for (const instance of runningInstances) {
      await this.cancelInstance(instance.id);
    }

    // Update kernel status
    await this.setKernelState('platform.status', {
      status: 'shutdown',
      version: '1.0.0',
      shutdownAt: new Date(),
    });

    this.logger.log('AI Kernel shutdown complete');
  }

  async restart(): Promise<void> {
    this.logger.log('Restarting AI Kernel...');
    await this.shutdown();
    await this.initializeKernel();
    this.logger.log('AI Kernel restart complete');
  }
}
