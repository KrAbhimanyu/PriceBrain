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
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto, TriggerWorkflowDto } from './dto/workflow.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workflow' })
  create(@Request() req, @Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workflows' })
  findAll(
    @Request() req,
    @Query('includeTemplates') includeTemplates?: boolean,
  ) {
    return this.workflowsService.findAll(req.user.id, includeTemplates);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get workflow templates' })
  findTemplates() {
    return this.workflowsService.findTemplates();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific workflow' })
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workflow' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflowsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workflow' })
  delete(@Param('id') id: string) {
    return this.workflowsService.delete(id);
  }

  @Post(':id/trigger')
  @ApiOperation({ summary: 'Trigger a workflow execution' })
  trigger(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: TriggerWorkflowDto,
  ) {
    return this.workflowsService.trigger(req.user.id, id, dto);
  }

  // ============ Workflow Instances ============

  @Get('instances/mine')
  @ApiOperation({ summary: 'Get my workflow instances' })
  findMyInstances(
    @Request() req,
    @Query('status') status?: string,
  ) {
    return this.workflowsService.findInstances(req.user.id, status);
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Get a workflow instance' })
  getInstance(@Request() req, @Param('id') id: string) {
    return this.workflowsService.getInstance(id, req.user.id);
  }

  @Post('instances/:id/pause')
  @ApiOperation({ summary: 'Pause a workflow instance' })
  pauseInstance(@Request() req, @Param('id') id: string) {
    return this.workflowsService.pauseInstance(id, req.user.id);
  }

  @Post('instances/:id/resume')
  @ApiOperation({ summary: 'Resume a workflow instance' })
  resumeInstance(@Request() req, @Param('id') id: string) {
    return this.workflowsService.resumeInstance(id, req.user.id);
  }

  @Post('instances/:id/cancel')
  @ApiOperation({ summary: 'Cancel a workflow instance' })
  cancelInstance(@Request() req, @Param('id') id: string) {
    return this.workflowsService.cancelInstance(id, req.user.id);
  }

  @Get('instances/:id/logs')
  @ApiOperation({ summary: 'Get execution logs for an instance' })
  getInstanceLogs(@Param('id') id: string) {
    return this.workflowsService.getInstanceLogs(id);
  }
}
