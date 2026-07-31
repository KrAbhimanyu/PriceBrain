import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChiefAIAgent, ExecutiveDecision } from './entities/executive.entity';
import {
  CreateChiefAIDto,
  UpdateChiefAIDto,
  CreateDecisionDto,
  UpdateDecisionDto,
  QueryDecisionsDto,
} from './dto/executive.dto';

@Injectable()
export class ExecutiveService {
  private readonly logger = new Logger(ExecutiveService.name);

  constructor(
    @InjectRepository(ChiefAIAgent)
    private chiefAiRepository: Repository<ChiefAIAgent>,
    @InjectRepository(ExecutiveDecision)
    private decisionRepository: Repository<ExecutiveDecision>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ============ CHIEF AI MANAGEMENT ============

  async createChiefAI(dto: CreateChiefAIDto): Promise<ChiefAIAgent> {
    // Check if organization already has a Chief AI
    const existing = await this.chiefAiRepository.findOne({
      where: { organizationId: dto.organizationId },
    });
    if (existing) {
      throw new BadRequestException('Organization already has a Chief AI');
    }

    const chiefAi = this.chiefAiRepository.create({
      ...dto,
      responsibilities: dto.responsibilities || [
        'Strategic Planning',
        'Goal Decomposition',
        'Organization Optimization',
        'Priority Management',
        'Department Coordination',
        'Mission Assignment',
        'Decision Supervision',
        'Risk Analysis',
        'Executive Recommendations',
      ],
      performanceMetrics: {
        decisionsMade: 0,
        goalsAchieved: 0,
        recommendationsAccepted: 0,
        avgResponseTime: 0,
      },
    });

    const saved = await this.chiefAiRepository.save(chiefAi);

    this.eventEmitter.emit('chief_ai.created', {
      chiefAiId: saved.id,
      organizationId: dto.organizationId,
    });

    this.logger.log(`Chief AI created for organization ${dto.organizationId}`);
    return saved;
  }

  async findChiefAI(organizationId: string): Promise<ChiefAIAgent> {
    const chiefAi = await this.chiefAiRepository.findOne({
      where: { organizationId },
      relations: ['agent', 'organization'],
    });
    if (!chiefAi) {
      throw new NotFoundException('Chief AI not found for this organization');
    }
    return chiefAi;
  }

  async updateChiefAI(organizationId: string, dto: UpdateChiefAIDto): Promise<ChiefAIAgent> {
    const chiefAi = await this.findChiefAI(organizationId);
    Object.assign(chiefAi, dto);
    return this.chiefAiRepository.save(chiefAi);
  }

  async getChiefAIPerformance(organizationId: string): Promise<Record<string, any>> {
    const chiefAi = await this.findChiefAI(organizationId);

    // Calculate performance metrics
    const decisions = await this.decisionRepository.find({
      where: { organizationId },
    });

    const approvedDecisions = decisions.filter((d) => d.status === 'approved').length;
    const implementedDecisions = decisions.filter((d) => d.status === 'implemented').length;

    return {
      ...chiefAi.performanceMetrics,
      totalDecisions: decisions.length,
      approvedDecisions,
      implementedDecisions,
      acceptanceRate: decisions.length > 0 ? (approvedDecisions / decisions.length) * 100 : 0,
      implementationRate: approvedDecisions > 0 ? (implementedDecisions / approvedDecisions) * 100 : 0,
    };
  }

  // ============ EXECUTIVE DECISIONS ============

  async createDecision(organizationId: string, userId: string, dto: CreateDecisionDto): Promise<ExecutiveDecision> {
    const decision = this.decisionRepository.create({
      organizationId,
      ...dto,
    });

    const saved = await this.decisionRepository.save(decision);

    this.eventEmitter.emit('decision.created', {
      decisionId: saved.id,
      organizationId,
      decisionType: dto.decisionType,
    });

    this.logger.log(`Executive decision created: ${dto.title}`);
    return saved;
  }

  async findDecisions(organizationId: string, query: QueryDecisionsDto): Promise<ExecutiveDecision[]> {
    const qb = this.decisionRepository
      .createQueryBuilder('d')
      .where('d.organizationId = :organizationId', { organizationId });

    if (query.decisionType) {
      qb.andWhere('d.decisionType = :decisionType', { decisionType: query.decisionType });
    }

    if (query.status) {
      qb.andWhere('d.status = :status', { status: query.status });
    }

    if (query.departmentId) {
      qb.andWhere('d.departmentId = :departmentId', { departmentId: query.departmentId });
    }

    if (query.riskLevel) {
      qb.andWhere('d.riskLevel = :riskLevel', { riskLevel: query.riskLevel });
    }

    if (query.priority !== undefined) {
      qb.andWhere('d.priority >= :priority', { priority: query.priority });
    }

    return qb
      .orderBy('d.priority', 'DESC')
      .addOrderBy('d.createdAt', 'DESC')
      .getMany();
  }

  async getDecision(id: string): Promise<ExecutiveDecision> {
    const decision = await this.decisionRepository.findOne({
      where: { id },
      relations: ['chiefAi', 'department'],
    });
    if (!decision) {
      throw new NotFoundException(`Decision ${id} not found`);
    }
    return decision;
  }

  async approveDecision(id: string, userId: string): Promise<ExecutiveDecision> {
    const decision = await this.getDecision(id);

    if (decision.status !== 'pending') {
      throw new BadRequestException('Can only approve pending decisions');
    }

    decision.status = 'approved';
    decision.approvedBy = userId;
    decision.approvedAt = new Date();

    const saved = await this.decisionRepository.save(decision);

    this.eventEmitter.emit('decision.approved', {
      decisionId: id,
      approvedBy: userId,
    });

    return saved;
  }

  async rejectDecision(id: string, userId: string, reason: string): Promise<ExecutiveDecision> {
    const decision = await this.getDecision(id);

    if (decision.status !== 'pending') {
      throw new BadRequestException('Can only reject pending decisions');
    }

    decision.status = 'rejected';
    decision.rejectedBy = userId;
    decision.rejectedAt = new Date();
    decision.rejectionReason = reason;

    const saved = await this.decisionRepository.save(decision);

    this.eventEmitter.emit('decision.rejected', {
      decisionId: id,
      rejectedBy: userId,
      reason,
    });

    return saved;
  }

  async implementDecision(id: string): Promise<ExecutiveDecision> {
    const decision = await this.getDecision(id);

    if (decision.status !== 'approved') {
      throw new BadRequestException('Can only implement approved decisions');
    }

    decision.status = 'implemented';

    const saved = await this.decisionRepository.save(decision);

    this.eventEmitter.emit('decision.implemented', {
      decisionId: id,
    });

    return saved;
  }

  // ============ STRATEGIC PLANNING ============

  async getStrategicRecommendations(organizationId: string): Promise<Record<string, any>[]> {
    const chiefAi = await this.findChiefAI(organizationId);
    const recentDecisions = await this.decisionRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // Generate recommendations based on patterns
    const recommendations: Record<string, any>[] = [];

    // Analyze decision patterns
    const approvedRate = recentDecisions.filter((d) => d.status === 'approved').length /
      (recentDecisions.length || 1);

    if (approvedRate < 0.5) {
      recommendations.push({
        type: 'efficiency',
        priority: 'high',
        title: 'Improve Decision Approval Rate',
        description: 'Consider simplifying the approval process or providing more context with recommendations.',
      });
    }

    // Add AI-generated strategic recommendations
    recommendations.push({
      type: 'growth',
      priority: 'medium',
      title: 'Focus on High-Priority Goals',
      description: 'Prioritize decisions with high impact and low risk.',
    });

    recommendations.push({
      type: 'collaboration',
      priority: 'medium',
      title: 'Cross-Department Collaboration',
      description: 'Consider how departments can work together on key initiatives.',
    });

    return recommendations;
  }

  // ============ ANALYTICS ============

  async getDecisionAnalytics(organizationId: string): Promise<Record<string, any>> {
    const decisions = await this.decisionRepository.find({
      where: { organizationId },
    });

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byRisk: Record<string, number> = {};

    for (const decision of decisions) {
      byStatus[decision.status] = (byStatus[decision.status] || 0) + 1;
      byType[decision.decisionType] = (byType[decision.decisionType] || 0) + 1;
      byRisk[decision.riskLevel] = (byRisk[decision.riskLevel] || 0) + 1;
    }

    return {
      total: decisions.length,
      byStatus,
      byType,
      byRisk,
      avgPriority: decisions.reduce((sum, d) => sum + d.priority, 0) / (decisions.length || 1),
    };
  }
}
