import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AutomationRule } from './entities/automation-rule.entity';
import { AutomationExecution } from './entities/automation-execution.entity';
import { CreateAutomationRuleDto, UpdateAutomationRuleDto } from './dto/automation.dto';
import { AutomationRuleType, AutomationStatus } from '../shared/enums/mission.enum';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @InjectRepository(AutomationRule)
    private ruleRepository: Repository<AutomationRule>,
    @InjectRepository(AutomationExecution)
    private executionRepository: Repository<AutomationExecution>,
  ) {}

  // ============ Rule CRUD ============

  async create(userId: string, dto: CreateAutomationRuleDto): Promise<AutomationRule> {
    const rule = this.ruleRepository.create({
      ...dto,
      userId,
      status: AutomationStatus.ACTIVE,
    });
    return this.ruleRepository.save(rule);
  }

  async findAll(userId: string, type?: AutomationRuleType): Promise<AutomationRule[]> {
    const query = this.ruleRepository.createQueryBuilder('r')
      .where('r.userId = :userId', { userId });

    if (type) {
      query.andWhere('r.type = :type', { type });
    }

    return query.orderBy('r.createdAt', 'DESC').getMany();
  }

  async findActive(userId: string): Promise<AutomationRule[]> {
    return this.ruleRepository.find({
      where: { userId, status: AutomationStatus.ACTIVE },
    });
  }

  async findOne(id: string, userId: string): Promise<AutomationRule> {
    const rule = await this.ruleRepository.findOne({
      where: { id, userId },
    });

    if (!rule) {
      throw new NotFoundException(`Automation rule ${id} not found`);
    }

    return rule;
  }

  async update(id: string, userId: string, dto: UpdateAutomationRuleDto): Promise<AutomationRule> {
    const rule = await this.findOne(id, userId);
    Object.assign(rule, dto);
    return this.ruleRepository.save(rule);
  }

  async delete(id: string, userId: string): Promise<void> {
    const rule = await this.findOne(id, userId);
    await this.ruleRepository.remove(rule);
  }

  async toggle(id: string, userId: string): Promise<AutomationRule> {
    const rule = await this.findOne(id, userId);
    rule.status = rule.status === AutomationStatus.ACTIVE
      ? AutomationStatus.PAUSED
      : AutomationStatus.ACTIVE;
    return this.ruleRepository.save(rule);
  }

  // ============ Rule Execution ============

  async trigger(id: string, userId: string, triggerData?: Record<string, any>): Promise<AutomationExecution> {
    const rule = await this.findOne(id, userId);

    const execution = this.executionRepository.create({
      ruleId: id,
      status: 'pending',
      triggerData: triggerData || {},
    });

    const saved = await this.executionRepository.save(execution);

    // Execute asynchronously
    this.executeRule(saved, rule).catch((err) => {
      this.logger.error(`Automation execution failed: ${err.message}`);
    });

    return saved;
  }

  private async executeRule(execution: AutomationExecution, rule: AutomationRule): Promise<void> {
    try {
      await this.executionRepository.update(execution.id, {
        status: 'running',
        executedAt: new Date(),
      });

      // Check conditions
      const conditionsMet = this.checkConditions(rule.conditions);
      if (!conditionsMet) {
        await this.executionRepository.update(execution.id, {
          status: 'completed',
          resultData: { skipped: true, reason: 'Conditions not met' },
          completedAt: new Date(),
        });
        return;
      }

      // Execute action based on type
      const result = await this.executeAction(rule);

      await this.executionRepository.update(execution.id, {
        status: 'completed',
        resultData: result,
        completedAt: new Date(),
      });

      // Update rule stats
      await this.ruleRepository.update(rule.id, {
        lastTriggeredAt: new Date(),
        triggerCount: rule.triggerCount + 1,
        successCount: rule.successCount + 1,
      });
    } catch (error) {
      await this.executionRepository.update(execution.id, {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
      });

      await this.ruleRepository.update(rule.id, {
        failureCount: rule.failureCount + 1,
      });
    }
  }

  private checkConditions(conditions: Record<string, any>[]): boolean {
    if (!conditions || conditions.length === 0) return true;

    for (const condition of conditions) {
      // Simple condition checking - would be more sophisticated in production
      const { field, operator, value } = condition;
      if (!field) continue;

      // Placeholder - actual implementation would check context
      // For now, always return true
    }

    return true;
  }

  private async executeAction(rule: AutomationRule): Promise<Record<string, any>> {
    const { type, actionConfig } = rule;

    switch (type) {
      case AutomationRuleType.PRICE_TRACKING:
        return this.executePriceTracking(actionConfig);
      case AutomationRuleType.COUPON_DISCOVERY:
        return this.executeCouponDiscovery(actionConfig);
      case AutomationRuleType.WARRANTY_TRACKING:
        return this.executeWarrantyTracking(actionConfig);
      case AutomationRuleType.SUBSCRIPTION_RENEWAL:
        return this.executeSubscriptionRenewal(actionConfig);
      case AutomationRuleType.DEAL_MONITORING:
        return this.executeDealMonitoring(actionConfig);
      case AutomationRuleType.STOCK_ALERT:
        return this.executeStockAlert(actionConfig);
      case AutomationRuleType.PRICE_DROP_ALERT:
        return this.executePriceDropAlert(actionConfig);
      default:
        return { executed: true, type };
    }
  }

  private async executePriceTracking(config: Record<string, any>): Promise<Record<string, any>> {
    this.logger.log('Executing price tracking automation');
    return { tracked: true, priceChecked: true };
  }

  private async executeCouponDiscovery(config: Record<string, any>): Promise<Record<string, any>> {
    this.logger.log('Executing coupon discovery automation');
    return { couponsFound: 0 };
  }

  private async executeWarrantyTracking(config: Record<string, any>): Promise<Record<string, any>> {
    this.logger.log('Executing warranty tracking automation');
    return { warrantiesChecked: true, expiringSoon: 0 };
  }

  private async executeSubscriptionRenewal(config: Record<string, any>): Promise<Record<string, any>> {
    this.logger.log('Executing subscription renewal automation');
    return { subscriptionsChecked: true, renewingSoon: 0 };
  }

  private async executeDealMonitoring(config: Record<string, any>): Promise<Record<string, any>> {
    this.logger.log('Executing deal monitoring automation');
    return { dealsFound: 0 };
  }

  private async executeStockAlert(config: Record<string, any>): Promise<Record<string, any>> {
    this.logger.log('Executing stock alert automation');
    return { stockChecked: true, backInStock: 0 };
  }

  private async executePriceDropAlert(config: Record<string, any>): Promise<Record<string, any>> {
    this.logger.log('Executing price drop alert automation');
    return { priceDropsFound: 0 };
  }

  // ============ Executions ============

  async findExecutions(ruleId: string, userId: string): Promise<AutomationExecution[]> {
    await this.findOne(ruleId, userId);

    return this.executionRepository.find({
      where: { ruleId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getExecution(id: string, userId: string): Promise<AutomationExecution> {
    const execution = await this.executionRepository.findOne({
      where: { id },
      relations: ['rule'],
    });

    if (!execution) {
      throw new NotFoundException(`Execution ${id} not found`);
    }

    // Verify user owns this execution
    await this.findOne(execution.ruleId, userId);

    return execution;
  }

  // ============ Cron Jobs ============

  @Cron(CronExpression.EVERY_30_MINUTES)
  async processScheduledAutomations(): Promise<void> {
    const activeRules = await this.ruleRepository.find({
      where: { status: AutomationStatus.ACTIVE },
    });

    for (const rule of activeRules) {
      if (rule.scheduleConfig?.enabled) {
        this.logger.log(`Processing scheduled automation: ${rule.name}`);
        const execution = await this.executionRepository.save(
          this.executionRepository.create({
            ruleId: rule.id,
            status: 'pending',
            triggerData: { source: 'schedule' },
          }),
        );

        this.executeRule(execution, rule).catch((err) => {
          this.logger.error(`Scheduled automation failed: ${err.message}`);
        });
      }
    }
  }

  // ============ Statistics ============

  async getStats(userId: string): Promise<{
    total: number;
    active: number;
    paused: number;
    byType: Record<string, number>;
    totalExecutions: number;
    successRate: number;
  }> {
    const rules = await this.findAll(userId);

    const byType: Record<string, number> = {};
    let totalExecutions = 0;
    let totalSuccess = 0;

    for (const rule of rules) {
      byType[rule.type] = (byType[rule.type] || 0) + 1;
      totalExecutions += rule.triggerCount;
      totalSuccess += rule.successCount;
    }

    return {
      total: rules.length,
      active: rules.filter((r) => r.status === AutomationStatus.ACTIVE).length,
      paused: rules.filter((r) => r.status === AutomationStatus.PAUSED).length,
      byType,
      totalExecutions,
      successRate: totalExecutions > 0 ? (totalSuccess / totalExecutions) * 100 : 0,
    };
  }
}
