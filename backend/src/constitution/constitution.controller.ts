import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConstitutionService } from './constitution.service';
import { CreateRuleDto, UpdateRuleDto, QueryRulesDto, CreateViolationDto, ResolveViolationDto, QueryViolationsDto } from './dto/constitution.dto';

@ApiTags('constitution')
@Controller('constitution')
export class ConstitutionController {
  constructor(private readonly constitutionService: ConstitutionService) {}

  @Post('rules')
  @ApiOperation({ summary: 'Create a constitution rule' })
  @ApiResponse({ status: 201, description: 'Rule created successfully' })
  async createRule(@Body() dto: CreateRuleDto) {
    return this.constitutionService.createRule(dto);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all constitution rules' })
  async getRules(@Query() query: QueryRulesDto) {
    return this.constitutionService.findRules(query);
  }

  @Get('rules/:id')
  @ApiOperation({ summary: 'Get a constitution rule by ID' })
  async getRule(@Param('id') id: string) {
    return this.constitutionService.findRule(id);
  }

  @Put('rules/:id')
  @ApiOperation({ summary: 'Update a constitution rule' })
  async updateRule(@Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.constitutionService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Delete a constitution rule' })
  async deleteRule(@Param('id') id: string) {
    await this.constitutionService.deleteRule(id);
    return { success: true };
  }

  @Patch('rules/:id/enforce')
  @ApiOperation({ summary: 'Enable or disable rule enforcement' })
  async enforceRule(@Param('id') id: string, @Body('enforce') enforce: boolean) {
    return this.constitutionService.enforceRule(id, enforce);
  }

  // ============ VIOLATIONS ============

  @Post('violations')
  @ApiOperation({ summary: 'Report a constitution violation' })
  async createViolation(@Body() dto: CreateViolationDto) {
    return this.constitutionService.createViolation(dto);
  }

  @Get('violations')
  @ApiOperation({ summary: 'Get all violations' })
  async getViolations(@Query() query: QueryViolationsDto) {
    return this.constitutionService.findViolations(query);
  }

  @Patch('violations/:id/resolve')
  @ApiOperation({ summary: 'Resolve a violation' })
  async resolveViolation(
    @Param('id') id: string,
    @Body() dto: ResolveViolationDto,
  ) {
    return this.constitutionService.resolveViolation(id, dto.resolution, dto.resolvedBy);
  }

  @Get('violations/stats')
  @ApiOperation({ summary: 'Get violation statistics' })
  async getViolationStats(@Query('organizationId') organizationId?: string) {
    return this.constitutionService.getViolationStats(organizationId);
  }
}
