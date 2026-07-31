import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { Workflow } from './entities/workflow.entity';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { WorkflowExecutionLog } from './entities/workflow-execution-log.entity';
import { CreateWorkflowDto, UpdateWorkflowDto, TriggerWorkflowDto } from './dto/workflow.dto';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);
  private workflowTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowInstance)
    private instanceRepository: Repository<WorkflowInstance>,
    @InjectRepository(WorkflowExecutionLog)
    private logRepository: Repository<WorkflowExecutionLog>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  // ============ Workflow CRUD ============

  async create(userId: string, dto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = this.workflowRepository.create({
      ...dto,
      userId,
    });
    const saved = await this.workflowRepository.save(workflow);

    if (this.isCronTrigger(dto.triggerConfig)) {
      this.scheduleWorkflow(saved);
    }

    this.logger.log(`Created workflow ${saved.id}`);
    return saved;
  }

  async findAll(userId: string, includeTemplates = false): Promise<Workflow[]> {
    const query = this.workflowRepository.createQueryBuilder('w')
      .where('w.userId = :userId', { userId });

    if (includeTemplates) {
      query.orWhere('w.isTemplate = true');
    }

    return query.orderBy('w.updatedAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Workflow> {
    const workflow = await this.workflowRepository.findOne({ where: { id } });
    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }
    return workflow;
  }

  async findTemplates(): Promise<Workflow[]> {
    return this.workflowRepository.find({
      where: { isTemplate: true, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateWorkflowDto): Promise<Workflow> {
    const workflow = await this.findOne(id);
    Object.assign(workflow, dto);
    const saved = await this.workflowRepository.save(workflow);

    // Reschedule if trigger config changed
    if (dto.triggerConfig) {
      this.unscheduleWorkflow(id);
      if (this.isCronTrigger(dto.triggerConfig)) {
        this.scheduleWorkflow(saved);
      }
    }

    return saved;
  }

  async delete(id: string): Promise<void> {
    this.unscheduleWorkflow(id);
    await this.workflowRepository.delete(id);
    this.logger.log(`Deleted workflow ${id}`);
  }

  // ============ Workflow Execution ============

  async trigger(userId: string, workflowId: string, dto: TriggerWorkflowDto): Promise<WorkflowInstance> {
    const workflow = await this.findOne(workflowId);

    const instance = this.instanceRepository.create({
      workflowId,
      missionId: dto.missionId,
      userId,
      status: 'pending',
      inputData: dto.inputData || {},
      context: {},
      outputData: {},
    });

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(`Triggered workflow ${workflowId} as instance ${saved.id}`);

    // Execute workflow asynchronously
    this.executeWorkflow(saved, workflow).catch((err) => {
      this.logger.error(`Workflow execution failed: ${err.message}`);
    });

    return saved;
  }

  async executeWorkflow(instance: WorkflowInstance, workflow: Workflow): Promise<void> {
    try {
      await this.instanceRepository.update(instance.id, {
        status: 'running',
        startedAt: new Date(),
      });

      const steps = workflow.stepsConfig.steps || [];
      let currentContext = { ...instance.inputData };

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        // Log step start
        const log = this.logRepository.create({
          instanceId: instance.id,
          stepName: step.name,
          stepOrder: i,
          status: 'running',
          inputData: currentContext,
          startedAt: new Date(),
        });
        await this.logRepository.save(log);

        try {
          // Execute step
          const result = await this.executeStep(step, currentContext, instance);

          // Log step completion
          await this.logRepository.update(log.id, {
            status: 'completed',
            outputData: result,
            completedAt: new Date(),
          });

          currentContext = { ...currentContext, ...result };
          await this.instanceRepository.update(instance.id, {
            currentStep: step.name,
            context: currentContext,
          });
        } catch (error) {
          // Handle step failure
          await this.logRepository.update(log.id, {
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date(),
          });

          // Check retry config
          const retryConfig = workflow.retryConfig || { maxRetries: 3 };
          if (retryConfig.maxRetries > 0) {
            // Retry logic would go here
          }

          throw error;
        }
      }

      // Workflow completed
      await this.instanceRepository.update(instance.id, {
        status: 'completed',
        currentStep: null,
        completedAt: new Date(),
        outputData: currentContext,
      });
    } catch (error) {
      await this.instanceRepository.update(instance.id, {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
      });
    }
  }

  private async executeStep(
    step: any,
    context: Record<string, any>,
    instance: WorkflowInstance,
  ): Promise<Record<string, any>> {
    // Step execution logic - this would integrate with actual services
    // For now, simulate step execution
    this.logger.log(`Executing step ${step.name} for instance ${instance.id}`);

    switch (step.action) {
      case 'check_current_prices':
        return { pricesChecked: true, timestamp: new Date().toISOString() };
      case 'compare_with_history':
        return { compared: true, hasDropped: false };
      case 'notify_if_dropped':
        return { notificationSent: false, reason: 'No price drop detected' };
      case 'find_expiring':
        return { warrantiesFound: 0 };
      case 'create_notifications':
        return { notificationsCreated: 0 };
      case 'get_current_deals':
        return { dealsFound: 0 };
      case 'filter_by_preferences':
        return { matchingDeals: 0 };
      case 'notify_user':
        return { userNotified: false };
      default:
        return { executed: true, step: step.name };
    }
  }

  // ============ Workflow Instances ============

  async findInstances(userId: string, status?: string): Promise<WorkflowInstance[]> {
    const query = this.instanceRepository
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.workflow', 'workflow')
      .where('i.userId = :userId', { userId });

    if (status) {
      query.andWhere('i.status = :status', { status });
    }

    return query.orderBy('i.createdAt', 'DESC').getMany();
  }

  async getInstance(id: string, userId: string): Promise<WorkflowInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id, userId },
      relations: ['workflow'],
    });

    if (!instance) {
      throw new NotFoundException(`Instance ${id} not found`);
    }

    return instance;
  }

  async pauseInstance(id: string, userId: string): Promise<WorkflowInstance> {
    const instance = await this.getInstance(id, userId);
    await this.instanceRepository.update(id, {
      status: 'paused',
      pausedAt: new Date(),
    });
    return this.instanceRepository.findOne({ where: { id } });
  }

  async resumeInstance(id: string, userId: string): Promise<WorkflowInstance> {
    const instance = await this.getInstance(id, userId);
    const workflow = await this.findOne(instance.workflowId);

    await this.instanceRepository.update(id, {
      status: 'running',
    });

    // Resume execution
    this.executeWorkflow(instance, workflow).catch((err) => {
      this.logger.error(`Workflow resume failed: ${err.message}`);
    });

    return this.instanceRepository.findOne({ where: { id } });
  }

  async cancelInstance(id: string, userId: string): Promise<void> {
    const instance = await this.getInstance(id, userId);
    await this.instanceRepository.update(id, {
      status: 'cancelled',
      completedAt: new Date(),
    });
  }

  async getInstanceLogs(instanceId: string): Promise<WorkflowExecutionLog[]> {
    return this.logRepository.find({
      where: { instanceId },
      order: { stepOrder: 'ASC' },
    });
  }

  // ============ Scheduling ============

  private isCronTrigger(triggerConfig: Record<string, any>): boolean {
    return triggerConfig?.type === 'scheduled' && triggerConfig?.schedule;
  }

  private scheduleWorkflow(workflow: Workflow): void {
    if (!this.isCronTrigger(workflow.triggerConfig)) return;

    const schedule = workflow.triggerConfig.schedule;

    try {
      const callback = () => {
        this.triggerScheduledExecution(workflow.id);
      };

      const interval = this.parseCronToMs(schedule);
      if (interval > 0) {
        const timer = setInterval(callback, interval);
        this.workflowTimers.set(workflow.id, timer);
        this.logger.log(`Scheduled workflow ${workflow.id} with interval ${interval}ms`);
      }
    } catch (error) {
      this.logger.error(`Failed to schedule workflow ${workflow.id}: ${error.message}`);
    }
  }

  private unscheduleWorkflow(workflowId: string): void {
    const timer = this.workflowTimers.get(workflowId);
    if (timer) {
      clearInterval(timer);
      this.workflowTimers.delete(workflowId);
    }
  }

  private async triggerScheduledExecution(workflowId: string): Promise<void> {
    const workflow = await this.findOne(workflowId);
    if (!workflow.isActive) return;

    this.logger.log(`Scheduled execution of workflow ${workflowId}`);

    // Find users with this workflow
    const instances = await this.instanceRepository.find({
      where: { workflowId },
      take: 10,
    });

    for (const instance of instances) {
      this.executeWorkflow(instance, workflow).catch((err) => {
        this.logger.error(`Scheduled workflow execution failed: ${err.message}`);
      });
    }
  }

  private parseCronToMs(cron: string): number {
    // Simple cron parser for common patterns
    const parts = cron.split(' ');
    if (parts.length !== 5) return 0;

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Every X minutes
    if (minute.startsWith('*/')) {
      return parseInt(minute.slice(2)) * 60 * 1000;
    }

    // Every X hours
    if (hour.startsWith('*/')) {
      return parseInt(hour.slice(2)) * 60 * 60 * 1000;
    }

    // Default to 1 hour
    return 60 * 60 * 1000;
  }
}
