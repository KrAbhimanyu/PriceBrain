import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ExecutionLog } from './entities/execution-log.entity';
import { AuditLog } from './entities/audit-log.entity';
import { ExecutionType, RiskLevel } from '../shared/enums/mission.enum';

export interface CreateExecutionLogDto {
  userId: string;
  missionId?: string;
  workflowInstanceId?: string;
  automationRuleId?: string;
  executionType: ExecutionType;
  action: string;
  status: 'success' | 'failure' | 'pending' | 'cancelled';
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  riskLevel?: RiskLevel;
  approvalId?: string;
  executionTimeMs?: number;
}

export interface CreateAuditLogDto {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    @InjectRepository(ExecutionLog)
    private executionLogRepository: Repository<ExecutionLog>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  // ============ Execution Logs ============

  async logExecution(dto: CreateExecutionLogDto): Promise<ExecutionLog> {
    const log = this.executionLogRepository.create({
      ...dto,
      riskLevel: dto.riskLevel || RiskLevel.LOW,
    });

    const saved = await this.executionLogRepository.save(log);

    if (dto.status === 'failure') {
      this.logger.warn(`Execution failed: ${dto.action} - ${dto.errorMessage}`);
    }

    return saved;
  }

  async findExecutionLogs(
    userId: string,
    options?: {
      missionId?: string;
      type?: ExecutionType;
      status?: string;
      from?: Date;
      limit?: number;
    },
  ): Promise<ExecutionLog[]> {
    const query = this.executionLogRepository
      .createQueryBuilder('e')
      .where('e.userId = :userId', { userId });

    if (options?.missionId) {
      query.andWhere('e.missionId = :missionId', { missionId: options.missionId });
    }

    if (options?.type) {
      query.andWhere('e.executionType = :type', { type: options.type });
    }

    if (options?.status) {
      query.andWhere('e.status = :status', { status: options.status });
    }

    if (options?.from) {
      query.andWhere('e.createdAt >= :from', { from: options.from });
    }

    return query
      .orderBy('e.createdAt', 'DESC')
      .take(options?.limit || 100)
      .getMany();
  }

  async getExecutionStats(userId: string, days = 30): Promise<{
    total: number;
    success: number;
    failure: number;
    byType: Record<string, number>;
    avgExecutionTime: number;
    riskDistribution: Record<string, number>;
  }> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const logs = await this.executionLogRepository
      .createQueryBuilder('e')
      .where('e.userId = :userId', { userId })
      .andWhere('e.createdAt >= :fromDate', { fromDate })
      .getMany();

    const byType: Record<string, number> = {};
    const riskDistribution: Record<string, number> = {};
    let totalExecutionTime = 0;
    let executionTimeCount = 0;

    for (const log of logs) {
      byType[log.executionType] = (byType[log.executionType] || 0) + 1;
      riskDistribution[log.riskLevel] = (riskDistribution[log.riskLevel] || 0) + 1;

      if (log.executionTimeMs) {
        totalExecutionTime += log.executionTimeMs;
        executionTimeCount++;
      }
    }

    return {
      total: logs.length,
      success: logs.filter((l) => l.status === 'success').length,
      failure: logs.filter((l) => l.status === 'failure').length,
      byType,
      avgExecutionTime: executionTimeCount > 0 ? totalExecutionTime / executionTimeCount : 0,
      riskDistribution,
    };
  }

  // ============ Audit Logs ============

  async logAudit(dto: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepository.create(dto);
    return this.auditLogRepository.save(log);
  }

  async findAuditLogs(
    options?: {
      userId?: string;
      resourceType?: string;
      resourceId?: string;
      action?: string;
      from?: Date;
      to?: Date;
      limit?: number;
    },
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('a');

    if (options?.userId) {
      query.andWhere('a.userId = :userId', { userId: options.userId });
    }

    if (options?.resourceType) {
      query.andWhere('a.resourceType = :resourceType', { resourceType: options.resourceType });
    }

    if (options?.resourceId) {
      query.andWhere('a.resourceId = :resourceId', { resourceId: options.resourceId });
    }

    if (options?.action) {
      query.andWhere('a.action = :action', { action: options.action });
    }

    if (options?.from) {
      query.andWhere('a.createdAt >= :from', { from: options.from });
    }

    if (options?.to) {
      query.andWhere('a.createdAt <= :to', { to: options.to });
    }

    return query
      .orderBy('a.createdAt', 'DESC')
      .take(options?.limit || 100)
      .getMany();
  }

  // ============ Risk Assessment ============

  assessRisk(action: string, data: Record<string, any>): RiskLevel {
    // High risk actions
    const highRiskActions = [
      'purchase',
      'subscription',
      'automation_create',
      'automation_delete',
      'plugin_install',
      'share_personal_data',
    ];

    // Medium risk actions
    const mediumRiskActions = [
      'track_product',
      'create_alert',
      'share_plan',
      'automation_modify',
    ];

    if (highRiskActions.includes(action)) {
      return RiskLevel.HIGH;
    }

    if (mediumRiskActions.includes(action)) {
      return RiskLevel.MEDIUM;
    }

    // Check for high-value transactions
    if (data.price && data.price > 50000) {
      return RiskLevel.HIGH;
    }

    if (data.price && data.price > 10000) {
      return RiskLevel.MEDIUM;
    }

    return RiskLevel.LOW;
  }

  // ============ Cleanup ============

  async cleanupOldLogs(daysToKeep = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.executionLogRepository.delete({
      createdAt: MoreThan(cutoffDate),
    });

    this.logger.log(`Cleaned up ${result.affected} old execution logs`);
    return result.affected || 0;
  }
}
