import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Approval } from './entities/approval.entity';
import { CreateApprovalDto, ApproveDto, RejectDto, QueryApprovalsDto } from './dto/approval.dto';
import { ApprovalStatus } from '../shared/enums/mission.enum';

@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
  ) {}

  // ============ Approval CRUD ============

  async create(userId: string, dto: CreateApprovalDto): Promise<Approval> {
    const expiresAt = dto.expiresInMinutes
      ? new Date(Date.now() + dto.expiresInMinutes * 60 * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24 hours

    const approval = this.approvalRepository.create({
      userId,
      title: dto.title,
      type: dto.type,
      description: dto.description,
      missionId: dto.missionId,
      workflowInstanceId: dto.workflowInstanceId,
      actionData: dto.actionData,
      priority: dto.priority || 'medium',
      requiresVerification: dto.requiresVerification || false,
      verificationMethod: dto.verificationMethod,
      status: ApprovalStatus.PENDING,
      expiresAt,
    });

    const saved = await this.approvalRepository.save(approval);
    this.logger.log(`Created approval ${saved.id} for user ${userId}`);

    return saved;
  }

  async findAll(userId: string, query: QueryApprovalsDto): Promise<Approval[]> {
    const qb = this.approvalRepository
      .createQueryBuilder('a')
      .where('a.userId = :userId', { userId });

    if (query.status) {
      qb.andWhere('a.status = :status', { status: query.status });
    }

    if (query.type) {
      qb.andWhere('a.type = :type', { type: query.type });
    }

    if (query.missionId) {
      qb.andWhere('a.missionId = :missionId', { missionId: query.missionId });
    }

    return qb.orderBy('a.createdAt', 'DESC').getMany();
  }

  async findPending(userId: string): Promise<Approval[]> {
    return this.approvalRepository.find({
      where: {
        userId,
        status: ApprovalStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({
      where: { id, userId },
    });

    if (!approval) {
      throw new NotFoundException(`Approval ${id} not found`);
    }

    return approval;
  }

  async approve(id: string, userId: string, dto: ApproveDto): Promise<Approval> {
    const approval = await this.findOne(id, userId);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Only pending approvals can be approved');
    }

    if (approval.expiresAt && new Date() > approval.expiresAt) {
      throw new BadRequestException('Approval has expired');
    }

    if (approval.requiresVerification) {
      // Verify the verification code
      if (!dto.verificationCode) {
        throw new BadRequestException('Verification code required');
      }
      // Verification logic would go here
    }

    approval.status = ApprovalStatus.APPROVED;
    approval.approvedAt = new Date();
    approval.approverId = userId;
    approval.approverNotes = dto.notes;

    const saved = await this.approvalRepository.save(approval);
    this.logger.log(`Approved ${id} by user ${userId}`);

    return saved;
  }

  async reject(id: string, userId: string, dto: RejectDto): Promise<Approval> {
    const approval = await this.findOne(id, userId);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Only pending approvals can be rejected');
    }

    approval.status = ApprovalStatus.REJECTED;
    approval.rejectedAt = new Date();
    approval.approverId = userId;
    approval.approverNotes = dto.reason;

    const saved = await this.approvalRepository.save(approval);
    this.logger.log(`Rejected ${id} by user ${userId}`);

    return saved;
  }

  async cancel(id: string, userId: string): Promise<Approval> {
    const approval = await this.findOne(id, userId);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Only pending approvals can be cancelled');
    }

    approval.status = ApprovalStatus.CANCELLED;

    return this.approvalRepository.save(approval);
  }

  // ============ Approval Checks ============

  async requiresApproval(
    userId: string,
    actionType: string,
    actionData: Record<string, any>,
  ): Promise<{ required: boolean; approvalType?: string }> {
    // High-value purchases need approval
    if (actionType === 'purchase' && actionData.price > 50000) {
      return { required: true, approvalType: 'purchase' };
    }

    // Sharing personal data needs approval
    if (actionType === 'share' && actionData.includesPersonalData) {
      return { required: true, approvalType: 'sharing' };
    }

    // New automation rules need approval
    if (actionType === 'create_automation') {
      return { required: true, approvalType: 'automation_create' };
    }

    // Plugin installations need approval
    if (actionType === 'install_plugin') {
      return { required: true, approvalType: 'plugin_install' };
    }

    return { required: false };
  }

  async checkAndCreateApproval(
    userId: string,
    actionType: string,
    actionData: Record<string, any>,
  ): Promise<Approval | null> {
    const { required, approvalType } = await this.requiresApproval(userId, actionType, actionData);

    if (!required) {
      return null;
    }

    return this.create(userId, {
      title: this.generateApprovalTitle(actionType, actionData),
      type: approvalType as any,
      actionData,
      description: this.generateApprovalDescription(actionType, actionData),
      priority: this.calculatePriority(actionType, actionData),
      expiresInMinutes: 1440, // 24 hours
    });
  }

  private generateApprovalTitle(type: string, data: Record<string, any>): string {
    switch (type) {
      case 'purchase':
        return `Purchase: ${data.productName || 'Product'}`;
      case 'create_automation':
        return `New Automation: ${data.name || 'Automation'}`;
      case 'install_plugin':
        return `Install Plugin: ${data.pluginName || 'Plugin'}`;
      case 'share':
        return `Share: ${data.resourceName || 'Resource'}`;
      default:
        return `Action: ${type}`;
    }
  }

  private generateApprovalDescription(type: string, data: Record<string, any>): string {
    switch (type) {
      case 'purchase':
        return `Request to purchase ${data.productName} for ₹${data.price?.toLocaleString()}`;
      case 'create_automation':
        return `Request to create automation rule: ${data.description || data.name}`;
      case 'install_plugin':
        return `Request to install plugin: ${data.description || data.pluginName}`;
      case 'share':
        return `Request to share ${data.resourceName || 'resource'} with external parties`;
      default:
        return `Action type: ${type}`;
    }
  }

  private calculatePriority(type: string, data: Record<string, any>): string {
    if (data.price > 100000) return 'high';
    if (data.price > 50000) return 'medium';
    return 'low';
  }

  // ============ Cron Jobs ============

  @Cron('0 * * * *') // Every hour
  async expireOldApprovals(): Promise<void> {
    const expired = await this.approvalRepository.find({
      where: {
        status: ApprovalStatus.PENDING,
        expiresAt: LessThan(new Date()),
      },
    });

    for (const approval of expired) {
      approval.status = ApprovalStatus.EXPIRED;
      await this.approvalRepository.save(approval);
      this.logger.log(`Expired approval ${approval.id}`);
    }

    if (expired.length > 0) {
      this.logger.log(`Expired ${expired.length} old approvals`);
    }
  }

  // ============ Statistics ============

  async getStats(userId: string): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    total: number;
  }> {
    const stats = await this.approvalRepository
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('a.userId = :userId', { userId })
      .groupBy('a.status')
      .getRawMany();

    const result = {
      pending: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
      cancelled: 0,
      total: 0,
    };

    for (const stat of stats) {
      result[stat.status] = parseInt(stat.count);
      result.total += parseInt(stat.count);
    }

    return result;
  }
}
