import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConstitutionRule, ConstitutionViolation } from './entities/constitution.entity';
import { CreateRuleDto, UpdateRuleDto, QueryRulesDto, CreateViolationDto } from './dto/constitution.dto';

@Injectable()
export class ConstitutionService {
  private readonly logger = new Logger(ConstitutionService.name);

  constructor(
    @InjectRepository(ConstitutionRule)
    private ruleRepository: Repository<ConstitutionRule>,
    @InjectRepository(ConstitutionViolation)
    private violationRepository: Repository<ConstitutionViolation>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ============ CONSTITUTION RULES ============

  async createRule(dto: CreateRuleDto): Promise<ConstitutionRule> {
    const rule = this.ruleRepository.create({
      ...dto,
      isImmutable: dto.isImmutable ?? false,
      isEnforced: dto.isEnforced ?? true,
    });

    const saved = await this.ruleRepository.save(rule);
    this.eventEmitter.emit('constitution.rule.created', { ruleId: saved.id });
    this.logger.log(`Constitution rule created: ${dto.title}`);
    return saved;
  }

  async findRules(query: QueryRulesDto): Promise<ConstitutionRule[]> {
    const qb = this.ruleRepository.createQueryBuilder('r');

    if (query.ruleType) {
      qb.andWhere('r.ruleType = :ruleType', { ruleType: query.ruleType });
    }

    if (query.priority !== undefined) {
      qb.andWhere('r.priority >= :priority', { priority: query.priority });
    }

    if (query.isEnforced !== undefined) {
      qb.andWhere('r.isEnforced = :isEnforced', { isEnforced: query.isEnforced });
    }

    return qb.orderBy('r.priority', 'DESC').getMany();
  }

  async findRule(id: string): Promise<ConstitutionRule> {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Constitution rule ${id} not found`);
    }
    return rule;
  }

  async updateRule(id: string, dto: UpdateRuleDto): Promise<ConstitutionRule> {
    const rule = await this.findRule(id);

    if (rule.isImmutable) {
      throw new Error('Cannot modify immutable constitution rule');
    }

    Object.assign(rule, dto);
    return this.ruleRepository.save(rule);
  }

  async deleteRule(id: string): Promise<void> {
    const rule = await this.findRule(id);

    if (rule.isImmutable) {
      throw new Error('Cannot delete immutable constitution rule');
    }

    await this.ruleRepository.remove(rule);
    this.eventEmitter.emit('constitution.rule.deleted', { ruleId: id });
  }

  async enforceRule(id: string, enforce: boolean): Promise<ConstitutionRule> {
    const rule = await this.findRule(id);
    rule.isEnforced = enforce;
    return this.ruleRepository.save(rule);
  }

  // ============ VIOLATIONS ============

  async createViolation(dto: CreateViolationDto): Promise<ConstitutionViolation> {
    const rule = await this.findRule(dto.ruleId);

    if (!rule.isEnforced) {
      throw new Error('Rule is not enforced');
    }

    const violation = this.violationRepository.create({
      ...dto,
      rule,
    });

    const saved = await this.violationRepository.save(violation);
    this.eventEmitter.emit('constitution.violation.created', { violationId: saved.id });
    this.logger.warn(`Constitution violation: ${dto.description}`);
    return saved;
  }

  async findViolations(query: {
    organizationId?: string;
    ruleId?: string;
    severity?: string;
    status?: string;
  }): Promise<ConstitutionViolation[]> {
    const qb = this.violationRepository
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.rule', 'rule');

    if (query.organizationId) {
      qb.andWhere('v.organizationId = :organizationId', { organizationId: query.organizationId });
    }

    if (query.ruleId) {
      qb.andWhere('v.ruleId = :ruleId', { ruleId: query.ruleId });
    }

    if (query.severity) {
      qb.andWhere('v.severity = :severity', { severity: query.severity });
    }

    if (query.status) {
      qb.andWhere('v.status = :status', { status: query.status });
    }

    return qb.orderBy('v.createdAt', 'DESC').getMany();
  }

  async resolveViolation(id: string, resolution: string, resolvedBy?: string): Promise<ConstitutionViolation> {
    const violation = await this.violationRepository.findOne({
      where: { id },
      relations: ['rule'],
    });

    if (!violation) {
      throw new NotFoundException(`Violation ${id} not found`);
    }

    violation.status = 'resolved';
    violation.resolution = resolution;
    violation.resolvedBy = resolvedBy;
    violation.resolvedAt = new Date();

    const saved = await this.violationRepository.save(violation);
    this.eventEmitter.emit('constitution.violation.resolved', { violationId: id });
    return saved;
  }

  async getViolationStats(organizationId?: string): Promise<Record<string, any>> {
    const qb = this.violationRepository.createQueryBuilder('v');

    if (organizationId) {
      qb.where('v.organizationId = :organizationId', { organizationId });
    }

    const violations = await qb.getMany();

    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byRule: Record<string, number> = {};

    for (const v of violations) {
      bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1;
      byStatus[v.status] = (byStatus[v.status] || 0) + 1;
      byRule[v.ruleId] = (byRule[v.ruleId] || 0) + 1;
    }

    return {
      total: violations.length,
      bySeverity,
      byStatus,
      byRule,
    };
  }
}
