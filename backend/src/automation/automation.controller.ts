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
import { AutomationService } from './automation.service';
import { CreateAutomationRuleDto, UpdateAutomationRuleDto, TriggerAutomationDto } from './dto/automation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AutomationRuleType } from '../shared/enums/mission.enum';

@ApiTags('Automation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new automation rule' })
  create(@Request() req, @Body() dto: CreateAutomationRuleDto) {
    return this.automationService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all automation rules' })
  findAll(
    @Request() req,
    @Query('type') type?: AutomationRuleType,
  ) {
    return this.automationService.findAll(req.user.id, type);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active automation rules' })
  findActive(@Request() req) {
    return this.automationService.findActive(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get automation statistics' })
  getStats(@Request() req) {
    return this.automationService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific automation rule' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.automationService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an automation rule' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateAutomationRuleDto,
  ) {
    return this.automationService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an automation rule' })
  delete(@Request() req, @Param('id') id: string) {
    return this.automationService.delete(id, req.user.id);
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: 'Toggle automation rule status' })
  toggle(@Request() req, @Param('id') id: string) {
    return this.automationService.toggle(id, req.user.id);
  }

  @Post(':id/trigger')
  @ApiOperation({ summary: 'Manually trigger an automation' })
  trigger(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: TriggerAutomationDto,
  ) {
    return this.automationService.trigger(id, req.user.id, dto.triggerData);
  }

  @Get(':id/executions')
  @ApiOperation({ summary: 'Get execution history for a rule' })
  findExecutions(@Request() req, @Param('id') id: string) {
    return this.automationService.findExecutions(id, req.user.id);
  }

  @Get('executions/:executionId')
  @ApiOperation({ summary: 'Get a specific execution' })
  getExecution(@Request() req, @Param('executionId') id: string) {
    return this.automationService.getExecution(id, req.user.id);
  }
}
