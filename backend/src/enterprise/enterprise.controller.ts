import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnterpriseService } from './enterprise.service';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Enterprise Workspace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enterprise')
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  // ============ Organizations ============

  @Post('organizations')
  @ApiOperation({ summary: 'Create organization' })
  createOrganization(@Request() req, @Body() dto: CreateOrganizationDto) {
    return this.enterpriseService.createOrganization(req.user.id, dto);
  }

  @Get('organizations')
  @ApiOperation({ summary: 'Get my organizations' })
  findOrganizations(@Request() req) {
    return this.enterpriseService.findOrganizations(req.user.id);
  }

  @Get('organizations/:id')
  @ApiOperation({ summary: 'Get organization' })
  getOrganization(@Param('id') id: string) {
    return this.enterpriseService.getOrganization(id);
  }

  @Patch('organizations/:id')
  @ApiOperation({ summary: 'Update organization' })
  updateOrganization(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.enterpriseService.updateOrganization(id, req.user.id, dto);
  }

  @Delete('organizations/:id')
  @ApiOperation({ summary: 'Delete organization' })
  deleteOrganization(@Request() req, @Param('id') id: string) {
    return this.enterpriseService.deleteOrganization(id, req.user.id);
  }

  @Get('organizations/:id/members')
  @ApiOperation({ summary: 'Get organization members' })
  getOrgMembers(@Param('id') id: string) {
    return this.enterpriseService.getOrgMembers(id);
  }

  @Post('organizations/:id/members')
  @ApiOperation({ summary: 'Add organization member' })
  addOrgMember(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddOrgMemberDto,
  ) {
    return this.enterpriseService.addOrgMember(id, req.user.id, dto);
  }

  @Delete('organizations/:id/members/:userId')
  @ApiOperation({ summary: 'Remove organization member' })
  removeOrgMember(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
  ) {
    return this.enterpriseService.removeOrgMember(id, req.user.id, memberUserId);
  }

  // ============ Departments ============

  @Post('organizations/:id/departments')
  @ApiOperation({ summary: 'Create department' })
  createDepartment(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.enterpriseService.createDepartment(id, req.user.id, dto);
  }

  @Get('organizations/:id/departments')
  @ApiOperation({ summary: 'Get departments' })
  getDepartments(@Param('id') id: string) {
    return this.enterpriseService.getDepartments(id);
  }

  @Delete('departments/:id')
  @ApiOperation({ summary: 'Delete department' })
  deleteDepartment(@Request() req, @Param('id') id: string) {
    return this.enterpriseService.deleteDepartment(id, req.user.id, id);
  }

  // ============ Teams ============

  @Post('organizations/:id/teams')
  @ApiOperation({ summary: 'Create team' })
  createTeam(@Request() req, @Param('id') id: string, @Body() dto: CreateTeamDto) {
    return this.enterpriseService.createTeam(id, req.user.id, dto);
  }

  @Get('organizations/:id/teams')
  @ApiOperation({ summary: 'Get teams' })
  getTeams(@Param('id') id: string) {
    return this.enterpriseService.getTeams(id);
  }

  @Get('teams/mine')
  @ApiOperation({ summary: 'Get my teams' })
  getMyTeams(@Request() req, @Query('organizationId') orgId: string) {
    return this.enterpriseService.getUserTeams(req.user.id, orgId);
  }

  @Get('teams/:id')
  @ApiOperation({ summary: 'Get team' })
  getTeam(@Param('id') id: string) {
    return this.enterpriseService.getTeam(id);
  }

  @Post('teams/:id/members')
  @ApiOperation({ summary: 'Add team member' })
  addTeamMember(@Request() req, @Param('id') id: string, @Body() dto: AddTeamMemberDto) {
    return this.enterpriseService.addTeamMember(id, req.user.id, dto);
  }

  @Delete('teams/:id/members/:userId')
  @ApiOperation({ summary: 'Remove team member' })
  removeTeamMember(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
  ) {
    return this.enterpriseService.removeTeamMember(id, req.user.id, memberUserId);
  }

  // ============ Projects ============

  @Post('organizations/:id/projects')
  @ApiOperation({ summary: 'Create project' })
  createProject(@Request() req, @Param('id') id: string, @Body() dto: CreateProjectDto) {
    return this.enterpriseService.createProject(id, req.user.id, dto);
  }

  @Get('organizations/:id/projects')
  @ApiOperation({ summary: 'Get projects' })
  getProjects(@Param('id') id: string, @Query('teamId') teamId?: string) {
    return this.enterpriseService.getProjects(id, teamId);
  }

  @Get('projects/mine')
  @ApiOperation({ summary: 'Get my projects' })
  getMyProjects(@Request() req, @Query('organizationId') orgId: string) {
    return this.enterpriseService.getUserProjects(req.user.id, orgId);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get project' })
  getProject(@Param('id') id: string) {
    return this.enterpriseService.getProject(id);
  }

  @Patch('projects/:id')
  @ApiOperation({ summary: 'Update project' })
  updateProject(@Request() req, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.enterpriseService.updateProject(id, req.user.id, dto);
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: 'Delete project' })
  deleteProject(@Request() req, @Param('id') id: string) {
    return this.enterpriseService.deleteProject(id, req.user.id);
  }

  @Post('projects/:id/members')
  @ApiOperation({ summary: 'Add project member' })
  addProjectMember(@Request() req, @Param('id') id: string, @Body() dto: AddProjectMemberDto) {
    return this.enterpriseService.addProjectMember(id, req.user.id, dto);
  }
}
