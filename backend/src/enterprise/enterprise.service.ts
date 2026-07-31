import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Organization,
  Department,
  Team,
  TeamMember,
  OrganizationMember,
  Project,
  ProjectMember,
} from './entities';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  CreateDepartmentDto,
  CreateTeamDto,
  AddTeamMemberDto,
  AddOrgMemberDto,
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
} from './dto/enterprise.dto';

@Injectable()
export class EnterpriseService {
  private readonly logger = new Logger(EnterpriseService.name);

  constructor(
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(Department)
    private deptRepository: Repository<Department>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(OrganizationMember)
    private orgMemberRepository: Repository<OrganizationMember>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
  ) {}

  // ============ ORGANIZATIONS ============

  async createOrganization(userId: string, dto: CreateOrganizationDto): Promise<Organization> {
    const existing = await this.orgRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException(`Organization with slug ${dto.slug} already exists`);
    }

    const org = this.orgRepository.create(dto);
    const saved = await this.orgRepository.save(org);

    // Add creator as owner
    await this.orgMemberRepository.save({
      organizationId: saved.id,
      userId,
      role: 'owner',
    });

    this.logger.log(`Organization created: ${saved.name} by user ${userId}`);
    return saved;
  }

  async findOrganizations(userId: string): Promise<Organization[]> {
    const memberships = await this.orgMemberRepository.find({
      where: { userId },
      relations: ['organization'],
    });
    return memberships.map((m) => m.organization);
  }

  async getOrganization(id: string): Promise<Organization> {
    const org = await this.orgRepository.findOne({
      where: { id },
    });
    if (!org) {
      throw new NotFoundException(`Organization ${id} not found`);
    }
    return org;
  }

  async updateOrganization(id: string, userId: string, dto: UpdateOrganizationDto): Promise<Organization> {
    await this.checkOrgPermission(id, userId, ['owner', 'admin']);
    const org = await this.getOrganization(id);
    Object.assign(org, dto);
    return this.orgRepository.save(org);
  }

  async deleteOrganization(id: string, userId: string): Promise<void> {
    await this.checkOrgPermission(id, userId, ['owner']);
    const org = await this.getOrganization(id);
    await this.orgRepository.remove(org);
  }

  async getOrgMembers(orgId: string): Promise<OrganizationMember[]> {
    return this.orgMemberRepository.find({
      where: { organizationId: orgId },
      relations: ['user', 'department'],
    });
  }

  async addOrgMember(orgId: string, userId: string, dto: AddOrgMemberDto): Promise<OrganizationMember> {
    await this.checkOrgPermission(orgId, userId, ['owner', 'admin']);

    const existing = await this.orgMemberRepository.findOne({
      where: { organizationId: orgId, userId: dto.userId },
    });
    if (existing) {
      throw new BadRequestException('User is already a member');
    }

    return this.orgMemberRepository.save({
      organizationId: orgId,
      ...dto,
    });
  }

  async removeOrgMember(orgId: string, requesterId: string, memberUserId: string): Promise<void> {
    await this.checkOrgPermission(orgId, requesterId, ['owner', 'admin']);

    const member = await this.orgMemberRepository.findOne({
      where: { organizationId: orgId, userId: memberUserId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === 'owner') {
      throw new BadRequestException('Cannot remove organization owner');
    }

    await this.orgMemberRepository.remove(member);
  }

  // ============ DEPARTMENTS ============

  async createDepartment(orgId: string, userId: string, dto: CreateDepartmentDto): Promise<Department> {
    await this.checkOrgPermission(orgId, userId, ['owner', 'admin']);
    return this.deptRepository.save({
      organizationId: orgId,
      ...dto,
    });
  }

  async getDepartments(orgId: string): Promise<Department[]> {
    return this.deptRepository.find({
      where: { organizationId: orgId },
      relations: ['parentDepartment', 'headUser'],
    });
  }

  async deleteDepartment(orgId: string, userId: string, deptId: string): Promise<void> {
    await this.checkOrgPermission(orgId, userId, ['owner', 'admin']);
    const dept = await this.deptRepository.findOne({
      where: { id: deptId, organizationId: orgId },
    });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }
    await this.deptRepository.remove(dept);
  }

  // ============ TEAMS ============

  async createTeam(orgId: string, userId: string, dto: CreateTeamDto): Promise<Team> {
    await this.checkOrgPermission(orgId, userId, ['owner', 'admin']);
    return this.teamRepository.save({
      organizationId: orgId,
      ...dto,
    });
  }

  async getTeams(orgId: string): Promise<Team[]> {
    return this.teamRepository.find({
      where: { organizationId: orgId },
      relations: ['department', 'members', 'members.user'],
    });
  }

  async getTeam(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });
    if (!team) {
      throw new NotFoundException(`Team ${id} not found`);
    }
    return team;
  }

  async addTeamMember(teamId: string, requesterId: string, dto: AddTeamMemberDto): Promise<TeamMember> {
    const team = await this.getTeam(teamId);
    await this.checkOrgPermission(team.organizationId, requesterId, ['owner', 'admin']);

    const existing = await this.teamMemberRepository.findOne({
      where: { teamId, userId: dto.userId },
    });
    if (existing) {
      throw new BadRequestException('User is already a team member');
    }

    return this.teamMemberRepository.save({
      teamId,
      ...dto,
    });
  }

  async removeTeamMember(teamId: string, requesterId: string, memberUserId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    await this.checkOrgPermission(team.organizationId, requesterId, ['owner', 'admin']);

    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId: memberUserId },
    });
    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    await this.teamMemberRepository.remove(member);
  }

  async getUserTeams(userId: string, orgId: string): Promise<Team[]> {
    const memberships = await this.teamMemberRepository.find({
      where: { userId },
      relations: ['team'],
    });
    return memberships
      .filter((m) => m.team.organizationId === orgId)
      .map((m) => m.team);
  }

  // ============ PROJECTS ============

  async createProject(orgId: string, userId: string, dto: CreateProjectDto): Promise<Project> {
    await this.checkOrgPermission(orgId, userId, ['owner', 'admin', 'member']);

    const project = this.projectRepository.create({
      organizationId: orgId,
      ...dto,
    });

    if (dto.startDate) {
      project.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      project.endDate = new Date(dto.endDate);
    }

    const saved = await this.projectRepository.save(project);

    // Add creator as project member
    await this.projectMemberRepository.save({
      projectId: saved.id,
      userId,
      role: 'owner',
    });

    return saved;
  }

  async getProjects(orgId: string, teamId?: string): Promise<Project[]> {
    const qb = this.projectRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.members', 'members')
      .where('p.organizationId = :orgId', { orgId });

    if (teamId) {
      qb.andWhere('p.teamId = :teamId', { teamId });
    }

    return qb.orderBy('p.createdAt', 'DESC').getMany();
  }

  async getProject(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['members', 'members.user', 'team'],
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  async updateProject(id: string, userId: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.getProject(id);
    await this.checkOrgPermission(project.organizationId, userId, ['owner', 'admin', 'member']);

    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    const project = await this.getProject(id);
    await this.checkOrgPermission(project.organizationId, userId, ['owner', 'admin']);
    await this.projectRepository.remove(project);
  }

  async addProjectMember(projectId: string, userId: string, dto: AddProjectMemberDto): Promise<ProjectMember> {
    const project = await this.getProject(projectId);
    await this.checkOrgPermission(project.organizationId, userId, ['owner', 'admin', 'member']);

    const existing = await this.projectMemberRepository.findOne({
      where: { projectId, userId: dto.userId },
    });
    if (existing) {
      throw new BadRequestException('User is already a project member');
    }

    return this.projectMemberRepository.save({
      projectId,
      ...dto,
    });
  }

  async getUserProjects(userId: string, orgId: string): Promise<Project[]> {
    const memberships = await this.projectMemberRepository.find({
      where: { userId },
      relations: ['project'],
    });
    return memberships
      .filter((m) => m.project.organizationId === orgId)
      .map((m) => m.project);
  }

  // ============ PERMISSIONS ============

  private async checkOrgPermission(
    orgId: string,
    userId: string,
    allowedRoles: string[],
  ): Promise<void> {
    const membership = await this.orgMemberRepository.findOne({
      where: { organizationId: orgId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (!allowedRoles.includes(membership.role)) {
      throw new ForbiddenException(`You need one of these roles: ${allowedRoles.join(', ')}`);
    }
  }

  async isOrgMember(orgId: string, userId: string): Promise<boolean> {
    const membership = await this.orgMemberRepository.findOne({
      where: { organizationId: orgId, userId },
    });
    return !!membership;
  }

  async getUserOrgRole(orgId: string, userId: string): Promise<string | null> {
    const membership = await this.orgMemberRepository.findOne({
      where: { organizationId: orgId, userId },
    });
    return membership?.role || null;
  }
}
