import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GovernanceService } from './governance.service';
import { CreatePolicyDto, UpdatePolicyDto, CreateAuditDto, CompleteAuditDto, GenerateReportDto } from './dto/governance.dto';

@ApiTags('governance')
@Controller('governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  // ============ POLICIES ============

  @Post('policies')
  @ApiOperation({ summary: 'Create a governance policy' })
  async createPolicy(@Body() dto: CreatePolicyDto) {
    return this.governanceService.createPolicy(dto);
  }

  @Get('policies')
  @ApiOperation({ summary: 'Get all governance policies' })
  async getPolicies(@Query('organizationId') organizationId?: string) {
    return this.governanceService.findPolicies(organizationId);
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get a policy by ID' })
  async getPolicy(@Param('id') id: string) {
    return this.governanceService.findPolicy(id);
  }

  @Put('policies/:id')
  @ApiOperation({ summary: 'Update a policy' })
  async updatePolicy(@Param('id') id: string, @Body() dto: UpdatePolicyDto) {
    return this.governanceService.updatePolicy(id, dto);
  }

  @Delete('policies/:id')
  @ApiOperation({ summary: 'Delete a policy' })
  async deletePolicy(@Param('id') id: string) {
    await this.governanceService.deletePolicy(id);
    return { success: true };
  }

  @Post('policies/:id/evaluate')
  @ApiOperation({ summary: 'Evaluate a policy against context' })
  async evaluatePolicy(
    @Param('id') id: string,
    @Body() context: Record<string, any>,
  ) {
    const result = await this.governanceService.evaluatePolicy(id, context);
    return { compliant: result };
  }

  // ============ AUDITS ============

  @Post('audits')
  @ApiOperation({ summary: 'Create a new audit' })
  async createAudit(@Body() dto: CreateAuditDto) {
    return this.governanceService.createAudit(dto);
  }

  @Get('audits')
  @ApiOperation({ summary: 'Get all audits' })
  async getAudits(@Query('organizationId') organizationId?: string) {
    return this.governanceService.findAudits(organizationId);
  }

  @Get('audits/:id')
  @ApiOperation({ summary: 'Get an audit by ID' })
  async getAudit(@Param('id') id: string) {
    return this.governanceService.findAudit(id);
  }

  @Patch('audits/:id/complete')
  @ApiOperation({ summary: 'Complete an audit with results' })
  async completeAudit(@Param('id') id: string, @Body() dto: CompleteAuditDto) {
    return this.governanceService.completeAudit(id, dto);
  }

  // ============ REPORTS ============

  @Post('reports')
  @ApiOperation({ summary: 'Generate a governance report' })
  async generateReport(@Body() dto: GenerateReportDto) {
    return this.governanceService.generateReport(dto.organizationId, dto.reportType);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all reports for an organization' })
  async getReports(@Query('organizationId') organizationId: string) {
    return this.governanceService.findReports(organizationId);
  }

  @Patch('reports/:id/publish')
  @ApiOperation({ summary: 'Publish a report' })
  async publishReport(@Param('id') id: string) {
    return this.governanceService.publishReport(id);
  }

  // ============ COMPLIANCE ============

  @Get('compliance')
  @ApiOperation({ summary: 'Check compliance status' })
  async checkCompliance(@Query('organizationId') organizationId: string) {
    return this.governanceService.checkCompliance(organizationId);
  }
}
