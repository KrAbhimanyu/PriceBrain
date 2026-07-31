import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationRuntimeService } from './organization-runtime.service';
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

@ApiTags('Organization Runtime')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationRuntimeController {
  constructor(private readonly runtimeService: OrganizationRuntimeService) {}

  // ============ ORGANIZATIONS ============

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  async createOrganization(@Request() req: any, @Body() dto: CreateOrganizationDto) {
    return this.runtimeService.createOrganization(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get user organizations' })
  async getUserOrganizations(@Request() req: any) {
    return this.runtimeService.getUserOrganizations(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  async getOrganization(@Param('id') id: string) {
    return this.runtimeService.findOrganization(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization' })
  async updateOrganization(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.runtimeService.updateOrganization(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization' })
  async deleteOrganization(@Param('id') id: string) {
    await this.runtimeService.deleteOrganization(id);
    return { success: true };
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get organization dashboard' })
  async getDashboard(@Param('id') id: string) {
    return this.runtimeService.getOrganizationDashboard(id);
  }

  // ============ MEMBERS ============

  @Get(':id/members')
  @ApiOperation({ summary: 'Get organization members' })
  async getMembers(@Param('id') id: string) {
    return this.runtimeService.getOrganizationMembers(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Invite a member' })
  async inviteMember(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.runtimeService.inviteMember(id, dto, req.user.id);
  }

  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: 'Update member' })
  async updateMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.runtimeService.updateMember(id, memberId, dto);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove member' })
  async removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    await this.runtimeService.removeMember(id, memberId);
    return { success: true };
  }

  @Get(':id/members/:userId/role')
  @ApiOperation({ summary: 'Get member role' })
  async getMemberRole(@Param('id') id: string, @Param('userId') userId: string) {
    return this.runtimeService.getMemberRole(id, userId);
  }

  // ============ AI INSTANCES ============

  @Get(':id/ai-instances')
  @ApiOperation({ summary: 'Get AI instances' })
  async getAIInstances(@Param('id') id: string) {
    return this.runtimeService.getAIInstances(id);
  }

  @Post(':id/ai-instances')
  @ApiOperation({ summary: 'Create AI instance' })
  async createAIInstance(@Param('id') id: string, @Body() dto: CreateAIInstanceDto) {
    return this.runtimeService.createAIInstance(id, dto);
  }

  @Put(':id/ai-instances/:instanceId')
  @ApiOperation({ summary: 'Update AI instance' })
  async updateAIInstance(
    @Param('id') id: string,
    @Param('instanceId') instanceId: string,
    @Body() dto: UpdateAIInstanceDto,
  ) {
    return this.runtimeService.updateAIInstance(instanceId, id, dto);
  }

  @Delete(':id/ai-instances/:instanceId')
  @ApiOperation({ summary: 'Delete AI instance' })
  async deleteAIInstance(@Param('id') id: string, @Param('instanceId') instanceId: string) {
    await this.runtimeService.deleteAIInstance(instanceId, id);
    return { success: true };
  }

  @Post(':id/ai-instances/:instanceId/start')
  @ApiOperation({ summary: 'Start AI instance' })
  async startAIInstance(@Param('id') id: string, @Param('instanceId') instanceId: string) {
    return this.runtimeService.startAIInstance(instanceId, id);
  }

  @Post(':id/ai-instances/:instanceId/stop')
  @ApiOperation({ summary: 'Stop AI instance' })
  async stopAIInstance(@Param('id') id: string, @Param('instanceId') instanceId: string) {
    return this.runtimeService.stopAIInstance(instanceId, id);
  }

  // ============ WORKFLOWS ============

  @Get(':id/workflows')
  @ApiOperation({ summary: 'Get workflows' })
  async getWorkflows(@Param('id') id: string) {
    return this.runtimeService.getWorkflows(id);
  }

  @Post(':id/workflows')
  @ApiOperation({ summary: 'Create workflow' })
  async createWorkflow(@Param('id') id: string, @Body() dto: CreateWorkflowDto) {
    return this.runtimeService.createWorkflow(id, dto);
  }

  @Put(':id/workflows/:workflowId')
  @ApiOperation({ summary: 'Update workflow' })
  async updateWorkflow(
    @Param('id') id: string,
    @Param('workflowId') workflowId: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.runtimeService.updateWorkflow(workflowId, id, dto);
  }

  @Delete(':id/workflows/:workflowId')
  @ApiOperation({ summary: 'Delete workflow' })
  async deleteWorkflow(@Param('id') id: string, @Param('workflowId') workflowId: string) {
    await this.runtimeService.deleteWorkflow(workflowId, id);
    return { success: true };
  }

  @Post(':id/workflows/:workflowId/execute')
  @ApiOperation({ summary: 'Execute workflow' })
  async executeWorkflow(@Param('id') id: string, @Param('workflowId') workflowId: string) {
    await this.runtimeService.executeWorkflow(workflowId, id);
    return { success: true, message: 'Workflow executed' };
  }
}
