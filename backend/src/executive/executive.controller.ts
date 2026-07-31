import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExecutiveService } from './executive.service';
import {
  CreateChiefAIDto,
  UpdateChiefAIDto,
  CreateDecisionDto,
  UpdateDecisionDto,
  QueryDecisionsDto,
} from './dto/executive.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Executive Intelligence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('executive')
export class ExecutiveController {
  constructor(private readonly executiveService: ExecutiveService) {}

  // ============ Chief AI ============

  @Post('chief-ai')
  @ApiOperation({ summary: 'Create Chief AI for organization' })
  createChiefAI(@Body() dto: CreateChiefAIDto) {
    return this.executiveService.createChiefAI(dto);
  }

  @Get('chief-ai/:organizationId')
  @ApiOperation({ summary: 'Get Chief AI for organization' })
  getChiefAI(@Param('organizationId') organizationId: string) {
    return this.executiveService.findChiefAI(organizationId);
  }

  @Patch('chief-ai/:organizationId')
  @ApiOperation({ summary: 'Update Chief AI' })
  updateChiefAI(
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateChiefAIDto,
  ) {
    return this.executiveService.updateChiefAI(organizationId, dto);
  }

  @Get('chief-ai/:organizationId/performance')
  @ApiOperation({ summary: 'Get Chief AI performance metrics' })
  getChiefAIPerformance(@Param('organizationId') organizationId: string) {
    return this.executiveService.getChiefAIPerformance(organizationId);
  }

  @Get('chief-ai/:organizationId/recommendations')
  @ApiOperation({ summary: 'Get strategic recommendations' })
  getRecommendations(@Param('organizationId') organizationId: string) {
    return this.executiveService.getStrategicRecommendations(organizationId);
  }

  // ============ Decisions ============

  @Post('decisions')
  @ApiOperation({ summary: 'Create executive decision' })
  createDecision(@Request() req, @Body() dto: CreateDecisionDto) {
    return this.executiveService.createDecision(
      dto.departmentId || req.user.organizationId,
      req.user.id,
      dto,
    );
  }

  @Get('decisions/:organizationId')
  @ApiOperation({ summary: 'Get organization decisions' })
  findDecisions(
    @Param('organizationId') organizationId: string,
    @Query() query: QueryDecisionsDto,
  ) {
    return this.executiveService.findDecisions(organizationId, query);
  }

  @Get('decisions/detail/:id')
  @ApiOperation({ summary: 'Get decision details' })
  getDecision(@Param('id') id: string) {
    return this.executiveService.getDecision(id);
  }

  @Post('decisions/:id/approve')
  @ApiOperation({ summary: 'Approve decision' })
  approveDecision(@Param('id') id: string, @Request() req) {
    return this.executiveService.approveDecision(id, req.user.id);
  }

  @Post('decisions/:id/reject')
  @ApiOperation({ summary: 'Reject decision' })
  rejectDecision(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { reason: string },
  ) {
    return this.executiveService.rejectDecision(id, req.user.id, body.reason);
  }

  @Post('decisions/:id/implement')
  @ApiOperation({ summary: 'Mark decision as implemented' })
  implementDecision(@Param('id') id: string) {
    return this.executiveService.implementDecision(id);
  }

  @Get('decisions/:organizationId/analytics')
  @ApiOperation({ summary: 'Get decision analytics' })
  getDecisionAnalytics(@Param('organizationId') organizationId: string) {
    return this.executiveService.getDecisionAnalytics(organizationId);
  }
}
