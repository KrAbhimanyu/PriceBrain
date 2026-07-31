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
import { MissionsService } from './missions.service';
import {
  CreateMissionDto,
  UpdateMissionDto,
  CreateMissionTaskDto,
  UpdateMissionTaskDto,
  CreateBudgetAllocationDto,
  UpdateBudgetAllocationDto,
} from './dto/mission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MissionStatus } from '../shared/enums/mission.enum';

@ApiTags('Missions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new mission' })
  create(@Request() req, @Body() dto: CreateMissionDto) {
    return this.missionsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all missions for the current user' })
  findAll(
    @Request() req,
    @Query('status') status?: MissionStatus,
  ) {
    return this.missionsService.findAll(req.user.id, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific mission' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.missionsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a mission' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateMissionDto,
  ) {
    return this.missionsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a mission' })
  delete(@Request() req, @Param('id') id: string) {
    return this.missionsService.delete(id, req.user.id);
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generate a mission from a user goal' })
  generateFromGoal(@Request() req, @Param('id') id: string, @Body() body: { goal: string }) {
    return this.missionsService.generateMissionFromGoal(req.user.id, body.goal);
  }

  @Post(':id/progress')
  @ApiOperation({ summary: 'Update mission progress based on tasks' })
  updateProgress(@Request() req, @Param('id') id: string) {
    return this.missionsService.updateProgress(id, req.user.id);
  }

  // ============ Tasks ============

  @Post(':id/tasks')
  @ApiOperation({ summary: 'Create a task in a mission' })
  createTask(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateMissionTaskDto,
  ) {
    return this.missionsService.createTask(id, dto);
  }

  @Post(':id/tasks/bulk')
  @ApiOperation({ summary: 'Create multiple tasks in a mission' })
  createTasks(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: { tasks: CreateMissionTaskDto[] },
  ) {
    return this.missionsService.createMultipleTasks(id, dto.tasks);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get all tasks in a mission' })
  findTasks(@Param('id') id: string) {
    return this.missionsService.findTasks(id);
  }

  @Patch('tasks/:taskId')
  @ApiOperation({ summary: 'Update a task' })
  updateTask(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateMissionTaskDto,
  ) {
    return this.missionsService.updateTask(taskId, dto);
  }

  @Delete('tasks/:taskId')
  @ApiOperation({ summary: 'Delete a task' })
  deleteTask(@Param('taskId') taskId: string) {
    return this.missionsService.deleteTask(taskId);
  }

  @Post(':id/tasks/reorder')
  @ApiOperation({ summary: 'Reorder tasks in a mission' })
  reorderTasks(
    @Param('id') id: string,
    @Body() dto: { taskIds: string[] },
  ) {
    return this.missionsService.reorderTasks(id, dto.taskIds);
  }

  // ============ Budget Allocations ============

  @Post(':id/budget')
  @ApiOperation({ summary: 'Create a budget allocation' })
  createBudget(
    @Param('id') id: string,
    @Body() dto: CreateBudgetAllocationDto,
  ) {
    return this.missionsService.createBudgetAllocation(id, dto);
  }

  @Get(':id/budget')
  @ApiOperation({ summary: 'Get budget allocations for a mission' })
  findBudget(@Param('id') id: string) {
    return this.missionsService.findBudgetAllocations(id);
  }

  @Patch('budget/:allocationId')
  @ApiOperation({ summary: 'Update a budget allocation' })
  updateBudget(
    @Param('allocationId') allocationId: string,
    @Body() dto: UpdateBudgetAllocationDto,
  ) {
    return this.missionsService.updateBudgetAllocation(allocationId, dto);
  }
}
