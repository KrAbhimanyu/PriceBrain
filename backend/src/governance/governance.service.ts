import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GovernancePolicy, GovernanceAudit, GovernanceReport } from './entities/governance.entity';
import { CreatePolicyDto, UpdatePolicyDto, CreateAuditDto } from './dto/governance.dto';

@Injectable()
export class GovernanceService {
  private readonly logger = new Logger(GovernanceService.name);

  constructor(
    @InjectRepository(GovernancePolicy)
    private policyRepository: Repository<GovernancePolicy>,
    @InjectRepository(GovernanceAudit)
    private auditRepository: Repository<GovernanceAudit>,
    @InjectRepository(GovernanceReport)
    private reportRepository: Repository<GovernanceReport>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ============ POLICIES ============

  async createPolicy(dto: CreatePolicyDto): Promise<GovernancePolicy> {
    const policy = this.policyRepository.create(dto);
    const saved = await this.policyRepository.save(policy);
    this.eventEmitter.emit('governance.policy.created', { policyId: saved.id });
    this.logger.log(`Governance policy created: ${dto.title}`);
    return saved;
  }

  async findPolicies(organizationId?: string): Promise<GovernancePolicy[]> {
    const qb = this.policyRepository.createQueryBuilder('p');

    if (organizationId) {
      qb.where('p.organizationId = :organizationId', { organizationId });
    }

    return qb.orderBy('p.createdAt', 'DESC').getMany();
  }

  async findPolicy(id: string): Promise<GovernancePolicy> {
    const policy = await this.policyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`Policy ${id} not found`);
    }
    return policy;
  }

  async updatePolicy(id: string, dto: UpdatePolicyDto): Promise<GovernancePolicy> {
    const policy = await this.findPolicy(id);
    Object.assign(policy, dto);
    return this.policyRepository.save(policy);
  }

  async deletePolicy(id: string): Promise<void> {
    const policy = await this.findPolicy(id);
    await this.policyRepository.remove(policy);
  }

  async evaluatePolicy(policyId: string, context: Record<string, any>): Promise<boolean> {
    const policy = await this.findPolicy(policyId);

    // Simple policy evaluation - in production, this would be more sophisticated
    const rules = policy.rules || [];
    for (const rule of rules) {
      if (rule.condition && !this.evaluateCondition(rule.condition, context)) {
        return false;
      }
    }

    return true;
  }

  private evaluateCondition(condition: Record<string, any>, context: Record<string, any>): boolean {
    // Simple condition evaluator
    const field = condition.field;
    const operator = condition.operator;
    const value = condition.value;

    const contextValue = context[field];

    switch (operator) {
      case 'eq': return contextValue === value;
      case 'neq': return contextValue !== value;
      case 'gt': return contextValue > value;
      case 'lt': return contextValue < value;
      case 'gte': return contextValue >= value;
      case 'lte': return contextValue <= value;
      case 'contains': return contextValue?.includes(value);
      default: return true;
    }
  }

  // ============ AUDITS ============

  async createAudit(dto: CreateAuditDto): Promise<GovernanceAudit> {
    const audit = this.auditRepository.create(dto);
    const saved = await this.auditRepository.save(audit);
    this.eventEmitter.emit('governance.audit.created', { auditId: saved.id });
    return saved;
  }

  async findAudits(organizationId?: string): Promise<GovernanceAudit[]> {
    const qb = this.auditRepository.createQueryBuilder('a');

    if (organizationId) {
      qb.where('a.organizationId = :organizationId', { organizationId });
    }

    return qb.orderBy('a.createdAt', 'DESC').getMany();
  }

  async findAudit(id: string): Promise<GovernanceAudit> {
    const audit = await this.auditRepository.findOne({ where: { id } });
    if (!audit) {
      throw new NotFoundException(`Audit ${id} not found`);
    }
    return audit;
  }

  async completeAudit(id: string, results: {
    findings: Record<string, any>[];
    violations: Record<string, any>[];
    recommendations: Record<string, any>[];
    complianceScore?: number;
  }): Promise<GovernanceAudit> {
    const audit = await this.findAudit(id);

    audit.overallStatus = 'completed';
    audit.findings = results.findings;
    audit.violations = results.violations;
    audit.recommendations = results.recommendations;
    if (results.complianceScore !== undefined) {
      audit.complianceScore = results.complianceScore;
    }

    const saved = await this.auditRepository.save(audit);
    this.eventEmitter.emit('governance.audit.completed', { auditId: id });
    return saved;
  }

  // ============ REPORTS ============

  async generateReport(organizationId: string, reportType: string): Promise<GovernanceReport> {
    // Generate a comprehensive governance report
    const policies = await this.findPolicies(organizationId);
    const audits = await this.findAudits(organizationId);
    const recentAudits = audits.slice(0, 10);

    const avgCompliance = recentAudits.length > 0
      ? recentAudits.reduce((sum, a) => sum + (a.complianceScore || 0), 0) / recentAudits.length
      : 0;

    const report = this.reportRepository.create({
      organizationId,
      reportType,
      title: `${reportType} Report - ${new Date().toISOString().split('T')[0]}`,
      summary: `Generated report with ${policies.length} policies and ${audits.length} audits`,
      findings: recentAudits.flatMap(a => a.findings || []),
      metrics: {
        totalPolicies: policies.length,
        totalAudits: audits.length,
        avgComplianceScore: avgCompliance,
        activePolicies: policies.filter(p => p.status === 'active').length,
      },
      recommendations: recentAudits.flatMap(a => a.recommendations || []),
      status: 'draft',
    });

    const saved = await this.reportRepository.save(report);
    this.eventEmitter.emit('governance.report.generated', { reportId: saved.id });
    return saved;
  }

  async findReports(organizationId: string): Promise<GovernanceReport[]> {
    return this.reportRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async publishReport(id: string): Promise<GovernanceReport> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }

    report.status = 'published';
    report.publishedAt = new Date();

    return this.reportRepository.save(report);
  }

  // ============ COMPLIANCE CHECK ============

  async checkCompliance(organizationId: string): Promise<Record<string, any>> {
    const policies = await this.findPolicies(organizationId);
    const audits = await this.findAudits(organizationId);

    const activePolicies = policies.filter(p => p.status === 'active');
    const completedAudits = audits.filter(a => a.overallStatus === 'completed');

    const avgScore = completedAudits.length > 0
      ? completedAudits.reduce((sum, a) => sum + (a.complianceScore || 0), 0) / completedAudits.length
      : 100;

    return {
      organizationId,
      complianceScore: avgScore,
      activePolicies: activePolicies.length,
      totalPolicies: policies.length,
      lastAudit: completedAudits[0]?.createdAt || null,
      status: avgScore >= 80 ? 'compliant' : avgScore >= 60 ? 'partial' : 'non-compliant',
    };
  }
}
