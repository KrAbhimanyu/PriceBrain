import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DigitalTwin, TwinComponent, TwinSnapshot } from './entities/digital-twin.entity';
import {
  CreateDigitalTwinDto,
  UpdateDigitalTwinDto,
  UpdateTwinComponentDto,
  SyncDigitalTwinDto,
} from './dto/digital-twin.dto';

@Injectable()
export class DigitalTwinService {
  private readonly logger = new Logger(DigitalTwinService.name);

  constructor(
    @InjectRepository(DigitalTwin)
    private twinRepository: Repository<DigitalTwin>,
    @InjectRepository(TwinComponent)
    private componentRepository: Repository<TwinComponent>,
    @InjectRepository(TwinSnapshot)
    private snapshotRepository: Repository<TwinSnapshot>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateDigitalTwinDto): Promise<DigitalTwin> {
    const twin = this.twinRepository.create({
      ...dto,
      modelState: {
        businessStructure: {},
        resources: {},
        budgets: {},
        projects: {},
        performance: {},
        risks: {},
        objectives: {},
      },
      syncStatus: 'synced',
      lastSyncAt: new Date(),
    });

    const saved = await this.twinRepository.save(twin);

    this.logger.log(`Digital twin created for organization ${dto.organizationId}`);
    return saved;
  }

  async findByOrganization(organizationId: string): Promise<DigitalTwin> {
    const twin = await this.twinRepository.findOne({
      where: { organizationId },
      relations: ['organization'],
    });
    if (!twin) {
      throw new NotFoundException('Digital twin not found for this organization');
    }
    return twin;
  }

  async update(organizationId: string, dto: UpdateDigitalTwinDto): Promise<DigitalTwin> {
    const twin = await this.findByOrganization(organizationId);
    Object.assign(twin, dto);
    return this.twinRepository.save(twin);
  }

  async sync(organizationId: string, dto: SyncDigitalTwinDto): Promise<DigitalTwin> {
    const twin = await this.findByOrganization(organizationId);

    // Update or create components
    for (const comp of dto.components) {
      await this.componentRepository.upsert(
        {
          twinId: twin.id,
          componentType: comp.componentType,
          componentId: comp.componentId,
          state: comp.state,
          metrics: comp.metrics || {},
          healthStatus: 'healthy',
          lastUpdated: new Date(),
        },
        ['twinId', 'componentType', 'componentId'],
      );
    }

    // Update twin status
    twin.syncStatus = 'synced';
    twin.lastSyncAt = new Date();
    await this.twinRepository.save(twin);

    // Update model state based on components
    await this.updateModelState(twin);

    this.eventEmitter.emit('digital_twin.synced', {
      twinId: twin.id,
      organizationId,
    });

    return twin;
  }

  private async updateModelState(twin: DigitalTwin): Promise<void> {
    const components = await this.componentRepository.find({
      where: { twinId: twin.id },
    });

    // Aggregate component states into model
    const modelState = { ...twin.modelState };

    for (const comp of components) {
      modelState[comp.componentType] = {
        ...(modelState[comp.componentType] || {}),
        [comp.componentId]: comp.state,
      };
    }

    twin.modelState = modelState;

    // Calculate health and risk scores
    twin.healthScore = this.calculateHealthScore(components);
    twin.riskScore = this.calculateRiskScore(components);
    twin.performanceScore = this.calculatePerformanceScore(components);

    twin.metrics = {
      componentCount: components.length,
      healthyComponents: components.filter((c) => c.healthStatus === 'healthy').length,
      degradedComponents: components.filter((c) => c.healthStatus === 'degraded').length,
      unhealthyComponents: components.filter((c) => c.healthStatus === 'unhealthy').length,
    };

    await this.twinRepository.save(twin);
  }

  private calculateHealthScore(components: TwinComponent[]): number {
    if (components.length === 0) return 100;

    const scores = {
      healthy: 100,
      degraded: 70,
      unhealthy: 30,
    };

    const total = components.reduce(
      (sum, c) => sum + (scores[c.healthStatus as keyof typeof scores] || 50),
      0,
    );
    return total / components.length;
  }

  private calculateRiskScore(components: TwinComponent[]): number {
    if (components.length === 0) return 0;

    const riskCounts = {
      healthy: 0,
      degraded: 0.3,
      unhealthy: 0.7,
    };

    const total = components.reduce(
      (sum, c) => sum + (riskCounts[c.healthStatus as keyof typeof riskCounts] || 0.5),
      0,
    );
    return (total / components.length) * 100;
  }

  private calculatePerformanceScore(components: TwinComponent[]): number {
    // Simplified performance calculation
    return 100 - this.calculateRiskScore(components);
  }

  async getComponents(organizationId: string): Promise<TwinComponent[]> {
    const twin = await this.findByOrganization(organizationId);
    return this.componentRepository.find({
      where: { twinId: twin.id },
    });
  }

  async updateComponent(
    organizationId: string,
    componentType: string,
    componentId: string,
    dto: UpdateTwinComponentDto,
  ): Promise<TwinComponent> {
    const twin = await this.findByOrganization(organizationId);

    const component = await this.componentRepository.findOne({
      where: { twinId: twin.id, componentType, componentId },
    });

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    Object.assign(component, dto);
    component.lastUpdated = new Date();

    const saved = await this.componentRepository.save(component);

    // Refresh twin state
    twin.syncStatus = 'synced';
    twin.lastSyncAt = new Date();
    await this.updateModelState(twin);

    return saved;
  }

  async createSnapshot(organizationId: string): Promise<TwinSnapshot> {
    const twin = await this.findByOrganization(organizationId);

    const snapshot = this.snapshotRepository.create({
      twinId: twin.id,
      snapshotData: {
        modelState: twin.modelState,
        components: await this.getComponents(organizationId),
        metrics: twin.metrics,
        configurations: twin.configurations,
      },
      healthScore: twin.healthScore,
      riskScore: twin.riskScore,
    });

    return this.snapshotRepository.save(snapshot);
  }

  async getSnapshots(organizationId: string, limit = 10): Promise<TwinSnapshot[]> {
    const twin = await this.findByOrganization(organizationId);
    return this.snapshotRepository.find({
      where: { twinId: twin.id },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async compareSnapshots(snapshotId1: string, snapshotId2: string): Promise<Record<string, any>> {
    const snapshot1 = await this.snapshotRepository.findOne({ where: { id: snapshotId1 } });
    const snapshot2 = await this.snapshotRepository.findOne({ where: { id: snapshotId2 } });

    if (!snapshot1 || !snapshot2) {
      throw new NotFoundException('Snapshot not found');
    }

    return {
      snapshot1: {
        id: snapshot1.id,
        createdAt: snapshot1.createdAt,
        healthScore: snapshot1.healthScore,
        riskScore: snapshot1.riskScore,
      },
      snapshot2: {
        id: snapshot2.id,
        createdAt: snapshot2.createdAt,
        healthScore: snapshot2.healthScore,
        riskScore: snapshot2.riskScore,
      },
      changes: {
        healthScoreChange: (snapshot2.healthScore || 0) - (snapshot1.healthScore || 0),
        riskScoreChange: (snapshot2.riskScore || 0) - (snapshot1.riskScore || 0),
      },
    };
  }

  async getDigitalTwinStatus(organizationId: string): Promise<Record<string, any>> {
    const twin = await this.findByOrganization(organizationId);
    const components = await this.getComponents(organizationId);

    return {
      id: twin.id,
      name: twin.name,
      syncStatus: twin.syncStatus,
      lastSyncAt: twin.lastSyncAt,
      healthScore: twin.healthScore,
      riskScore: twin.riskScore,
      performanceScore: twin.performanceScore,
      metrics: twin.metrics,
      components: {
        total: components.length,
        byType: components.reduce((acc, c) => {
          acc[c.componentType] = (acc[c.componentType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }
}
