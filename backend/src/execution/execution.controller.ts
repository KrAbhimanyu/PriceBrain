import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExecutionService } from './execution.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionType } from '../shared/enums/mission.enum';

@ApiTags('Execution')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('execution')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Get execution logs' })
  findLogs(
    @Request() req,
    @Query('missionId') missionId?: string,
    @Query('type') type?: ExecutionType,
    @Query('status') status?: string,
    @Query('days') days?: number,
  ) {
    const from = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : undefined;
    return this.executionService.findExecutionLogs(req.user.id, {
      missionId,
      type,
      status,
      from,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get execution statistics' })
  getStats(@Request() req, @Query('days') days?: number) {
    return this.executionService.getExecutionStats(req.user.id, days);
  }

  @Post('audit')
  @ApiOperation({ summary: 'Log an audit event' })
  logAudit(
    @Request() req,
    @Body() body: {
      action: string;
      resourceType: string;
      resourceId?: string;
      oldValue?: Record<string, any>;
      newValue?: Record<string, any>;
      metadata?: Record<string, any>;
    },
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.executionService.logAudit({
      ...body,
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent,
    });
  }

  @Get('audit')
  @ApiOperation({ summary: 'Get audit logs' })
  findAuditLogs(
    @Request() req,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('action') action?: string,
    @Query('days') days?: number,
  ) {
    const from = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : undefined;
    return this.executionService.findAuditLogs({
      userId: req.user.id,
      resourceType,
      resourceId,
      action,
      from,
    });
  }
}
