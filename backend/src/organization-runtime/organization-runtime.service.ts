import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Organization,
  OrganizationMember,
  OrganizationAIInstance,
  OrganizationWorkflow,
  RoleType,
  PermissionType,
} from './entities/organization-runtime.entity';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  InviteMemberDto,
  UpdateMemberDto,
  CreateAIInstanceDto,
  UpdateAIInstanceDto,
  CreateWorkflowDto,
  UpdateWorkflowDto,
} from './dto/organization-runtime.dto';

@Injectable()
export class OrganizationRuntimeService {
  private readonly logger = new Logger(OrganizationRuntimeService.name);

  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private memberRepo: Repository<OrganizationMember>,
    @InjectRepository(OrganizationAIInstance)
    private aiInstanceRepo: Repository<OrganizationAIInstance>,
    @InjectRepository(OrganizationWorkflow)
    private workflowRepo: Repository<OrganizationWorkflow>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ============ ORGANIZATION ============

  async createOrganization(dto: CreateOrganizationDto, ownerId: string): Promise<Organization> {
    const org = this.orgRepo.create(dto);
    const saved = await this.orgRepo.save(org);

    // Add owner as member
    const ownerMembership = this.memberRepo.create({
      organizationId: saved.id,
      userId: ownerId,
      role: RoleType.OWNER,
      permissions: Object.values(PermissionType),
      joinedAt: new Date(),
    });
    await this.memberRepo.save(ownerMembership);

    this.eventEmitter.emit('organization.created', { organizationId: saved.id, ownerId });
    this.logger.log(`Created organization: ${saved.name} by ${ownerId}`);

    return saved;
  }

  async findOrganization(id: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization ${id} not found`);
    }
    return org;
  }

  async updateOrganization(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.findOrganization(id);
    Object.assign(org, dto);
    return this.orgRepo.save(org);
  }

  async deleteOrganization(id: string): Promise<void> {
    const org = await this.findOrganization(id);
    
    // Delete all related entities
    await this.memberRepo.delete({ organizationId: id });
    await this.aiInstanceRepo.delete({ organizationId: id });
    await this.workflowRepo.delete({ organizationId: id });
    
    await this.orgRepo.remove(org);
    this.logger.log(`Deleted organization: ${id}`);
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const memberships = await this.memberRepo.find({
      where: { userId, isActive: true },
    });

    const orgIds = memberships.map((m) => m.organizationId);
    if (orgIds.length === 0) return [];

    return this.orgRepo
      .createQueryBuilder('org')
      .whereInIds(orgIds)
      .getMany();
  }

  async getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
    return this.memberRepo.find({
      where: { organizationId, isActive: true },
    });
  }

  // ============ MEMBERSHIP ============

  async inviteMember(
    organizationId: string,
    dto: InviteMemberDto,
    invitedBy: string,
  ): Promise<OrganizationMember> {
    // Verify inviter has permission
    const inviter = await this.memberRepo.findOne({
      where: { organizationId, userId: invitedBy, isActive: true },
    });

    if (!inviter || ![RoleType.OWNER, RoleType.ADMIN].includes(inviter.role)) {
      throw new ForbiddenException('Only owners and admins can invite members');
    }

    const member = this.memberRepo.create({
      organizationId,
      userId: dto.userId,
      role: dto.role,
      permissions: dto.permissions,
      department: dto.department,
      title: dto.title,
      invitedBy,
      invitedAt: new Date(),
    });

    const saved = await this.memberRepo.save(member);
    this.eventEmitter.emit('organization.member.invited', {
      organizationId,
      memberId: saved.id,
    });

    return saved;
  }

  async updateMember(
    organizationId: string,
    memberId: string,
    dto: UpdateMemberDto,
  ): Promise<OrganizationMember> {
    const member = await this.memberRepo.findOne({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      throw new NotFoundException(`Member ${memberId} not found`);
    }

    Object.assign(member, dto);
    return this.memberRepo.save(member);
  }

  async removeMember(organizationId: string, memberId: string): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      throw new NotFoundException(`Member ${memberId} not found`);
    }

    if (member.role === RoleType.OWNER) {
      throw new ForbiddenException('Cannot remove organization owner');
    }

    member.isActive = false;
    await this.memberRepo.save(member);
  }

  async getMemberRole(organizationId: string, userId: string): Promise<RoleType | null> {
    const member = await this.memberRepo.findOne({
      where: { organizationId, userId, isActive: true },
    });
    return member?.role || null;
  }

  async hasPermission(
    organizationId: string,
    userId: string,
    permission: PermissionType,
  ): Promise<boolean> {
    const member = await this.memberRepo.findOne({
      where: { organizationId, userId, isActive: true },
    });

    if (!member) return false;

    // Owners and admins have all permissions
    if ([RoleType.OWNER, RoleType.ADMIN].includes(member.role)) {
      return true;
    }

    return member.permissions?.includes(permission) || false;
  }

  // ============ AI INSTANCES ============

  async createAIInstance(
    organizationId: string,
    dto: CreateAIInstanceDto,
  ): Promise<OrganizationAIInstance> {
    const instance = this.aiInstanceRepo.create({
      organizationId,
      ...dto,
      role: dto.role || RoleType.BOT,
      capabilities: dto.capabilities || [],
    });

    const saved = await this.aiInstanceRepo.save(instance);
    this.eventEmitter.emit('organization.ai_instance.created', {
      organizationId,
      instanceId: saved.id,
    });

    return saved;
  }

  async getAIInstances(organizationId: string): Promise<OrganizationAIInstance[]> {
    return this.aiInstanceRepo.find({
      where: { organizationId, isActive: true },
    });
  }

  async updateAIInstance(
    instanceId: string,
    organizationId: string,
    dto: UpdateAIInstanceDto,
  ): Promise<OrganizationAIInstance> {
    const instance = await this.aiInstanceRepo.findOne({
      where: { id: instanceId, organizationId },
    });

    if (!instance) {
      throw new NotFoundException(`AI instance ${instanceId} not found`);
    }

    Object.assign(instance, dto);
    return this.aiInstanceRepo.save(instance);
  }

  async deleteAIInstance(instanceId: string, organizationId: string): Promise<void> {
    const instance = await this.aiInstanceRepo.findOne({
      where: { id: instanceId, organizationId },
    });

    if (!instance) {
      throw new NotFoundException(`AI instance ${instanceId} not found`);
    }

    instance.isActive = false;
    await this.aiInstanceRepo.save(instance);
  }

  async startAIInstance(instanceId: string, organizationId: string): Promise<OrganizationAIInstance> {
    return this.updateAIInstance(instanceId, organizationId, { status: 'running' });
  }

  async stopAIInstance(instanceId: string, organizationId: string): Promise<OrganizationAIInstance> {
    return this.updateAIInstance(instanceId, organizationId, { status: 'idle', currentTask: null });
  }

  // ============ WORKFLOWS ============

  async createWorkflow(
    organizationId: string,
    dto: CreateWorkflowDto,
  ): Promise<OrganizationWorkflow> {
    const workflow = this.workflowRepo.create({
      organizationId,
      ...dto,
    });

    const saved = await this.workflowRepo.save(workflow);
    this.eventEmitter.emit('organization.workflow.created', {
      organizationId,
      workflowId: saved.id,
    });

    return saved;
  }

  async getWorkflows(organizationId: string): Promise<OrganizationWorkflow[]> {
    return this.workflowRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateWorkflow(
    workflowId: string,
    organizationId: string,
    dto: UpdateWorkflowDto,
  ): Promise<OrganizationWorkflow> {
    const workflow = await this.workflowRepo.findOne({
      where: { id: workflowId, organizationId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${workflowId} not found`);
    }

    Object.assign(workflow, dto);
    return this.workflowRepo.save(workflow);
  }

  async deleteWorkflow(workflowId: string, organizationId: string): Promise<void> {
    const workflow = await this.workflowRepo.findOne({
      where: { id: workflowId, organizationId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${workflowId} not found`);
    }

    workflow.isActive = false;
    await this.workflowRepo.save(workflow);
  }

  async executeWorkflow(workflowId: string, organizationId: string): Promise<void> {
    const workflow = await this.workflowRepo.findOne({
      where: { id: workflowId, organizationId, isActive: true },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${workflowId} not found or inactive`);
    }

    workflow.totalRuns += 1;
    workflow.lastRunAt = new Date();
    
    try {
      // Execute workflow logic here
      await this.executeWorkflowLogic(workflow);
      workflow.successfulRuns += 1;
    } catch (error) {
      workflow.failedRuns += 1;
      throw error;
    } finally {
      await this.workflowRepo.save(workflow);
    }
  }

  private async executeWorkflowLogic(workflow: OrganizationWorkflow): Promise<void> {
    this.logger.log(`Executing workflow: ${workflow.name}`);
    // Workflow execution logic would be implemented here
    // This is a placeholder for actual workflow execution
  }

  // ============ DASHBOARD ============

  async getOrganizationDashboard(organizationId: string): Promise<Record<string, any>> {
    const [org, members, aiInstances, workflows] = await Promise.all([
      this.findOrganization(organizationId),
      this.getOrganizationMembers(organizationId),
      this.getAIInstances(organizationId),
      this.getWorkflows(organizationId),
    ]);

    const activeWorkflows = workflows.filter((w) => w.isActive);

    return {
      organization: org,
      members: {
        total: members.length,
        byRole: members.reduce((acc, m) => {
          acc[m.role] = (acc[m.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      aiInstances: {
        total: aiInstances.length,
        active: aiInstances.filter((i) => i.status === 'running').length,
        idle: aiInstances.filter((i) => i.status === 'idle').length,
      },
      workflows: {
        total: workflows.length,
        active: activeWorkflows.length,
        totalRuns: workflows.reduce((sum, w) => sum + w.totalRuns, 0),
        successfulRuns: workflows.reduce((sum, w) => sum + w.successfulRuns, 0),
      },
    };
  }
}
