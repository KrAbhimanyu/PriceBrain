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
import { KernelService } from './kernel.service';
import {
  CreateAgentDto,
  UpdateAgentDto,
  StartAgentDto,
  UpdateAgentStateDto,
  QueryAgentsDto,
  KernelHealthDto,
  KernelMetricsDto,
} from './dto/kernel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI Kernel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kernel')
export class KernelController {
  constructor(private readonly kernelService: KernelService) {}

  // ============ Health & Metrics ============

  @Get('health')
  @ApiOperation({ summary: 'Get kernel health status' })
  getHealth() {
    return this.kernelService.getKernelHealth();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get kernel metrics' })
  getMetrics() {
    return this.kernelService.getKernelMetrics();
  }

  @Post('metrics')
  @ApiOperation({ summary: 'Record a kernel metric' })
  recordMetric(@Body() dto: KernelMetricsDto) {
    return this.kernelService.recordMetric(dto);
  }

  // ============ Kernel State ============

  @Get('state/:key')
  @ApiOperation({ summary: 'Get kernel state value' })
  getState(@Param('key') key: string) {
    return this.kernelService.getKernelState(key);
  }

  @Post('state/:key')
  @ApiOperation({ summary: 'Set kernel state value' })
  setState(@Param('key') key: string, @Body() body: { value: Record<string, any> }) {
    return this.kernelService.setKernelState(key, body.value);
  }

  // ============ Agents ============

  @Post('agents')
  @ApiOperation({ summary: 'Create a new agent' })
  createAgent(@Body() dto: CreateAgentDto) {
    return this.kernelService.createAgent(dto);
  }

  @Get('agents')
  @ApiOperation({ summary: 'Get all agents' })
  findAllAgents(@Query() query: QueryAgentsDto) {
    return this.kernelService.findAllAgents(query);
  }

  @Get('agents/system')
  @ApiOperation({ summary: 'Get system agents' })
  findSystemAgents() {
    return this.kernelService.findAllAgents({ systemOnly: true });
  }

  @Get('agents/marketplace')
  @ApiOperation({ summary: 'Get marketplace agents' })
  findMarketplaceAgents() {
    return this.kernelService.findAllAgents({ marketplaceOnly: true });
  }

  @Get('agents/slug/:slug')
  @ApiOperation({ summary: 'Get agent by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.kernelService.findAgentBySlug(slug);
  }

  @Get('agents/:id')
  @ApiOperation({ summary: 'Get agent by ID' })
  findById(@Param('id') id: string) {
    return this.kernelService.findAgentById(id);
  }

  @Patch('agents/:id')
  @ApiOperation({ summary: 'Update an agent' })
  updateAgent(@Param('id') id: string, @Body() dto: UpdateAgentDto) {
    return this.kernelService.updateAgent(id, dto);
  }

  @Delete('agents/:id')
  @ApiOperation({ summary: 'Delete an agent' })
  deleteAgent(@Param('id') id: string) {
    return this.kernelService.deleteAgent(id);
  }

  @Get('agents/:id/health')
  @ApiOperation({ summary: 'Get agent health status' })
  getAgentHealth(@Param('id') id: string) {
    return this.kernelService.getAgentHealth(id);
  }

  @Post('agents/:id/health')
  @ApiOperation({ summary: 'Update agent health status' })
  updateAgentHealth(@Param('id') id: string, @Body() health: KernelHealthDto) {
    return this.kernelService.updateAgentHealth(id, health);
  }

  // ============ Agent Instances ============

  @Post('agents/:id/start')
  @ApiOperation({ summary: 'Start an agent instance' })
  startAgent(@Param('id') id: string, @Request() req, @Body() dto: StartAgentDto) {
    return this.kernelService.startAgent(id, req.user.id, dto);
  }

  @Get('agents/:id/instances')
  @ApiOperation({ summary: 'Get instances for an agent' })
  getAgentInstances(@Param('id') id: string) {
    return this.kernelService.getUserInstances('');
  }

  @Get('instances/mine')
  @ApiOperation({ summary: 'Get my agent instances' })
  getMyInstances(@Request() req) {
    return this.kernelService.getUserInstances(req.user.id);
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Get instance by ID' })
  getInstance(@Param('id') id: string) {
    return this.kernelService.getInstance(id);
  }

  @Patch('instances/:id/state')
  @ApiOperation({ summary: 'Update instance state' })
  updateInstanceState(@Param('id') id: string, @Body() dto: UpdateAgentStateDto) {
    return this.kernelService.updateInstanceState(id, dto);
  }

  @Post('instances/:id/pause')
  @ApiOperation({ summary: 'Pause an instance' })
  pauseInstance(@Param('id') id: string) {
    return this.kernelService.pauseInstance(id);
  }

  @Post('instances/:id/resume')
  @ApiOperation({ summary: 'Resume an instance' })
  resumeInstance(@Param('id') id: string) {
    return this.kernelService.resumeInstance(id);
  }

  @Post('instances/:id/cancel')
  @ApiOperation({ summary: 'Cancel an instance' })
  cancelInstance(@Param('id') id: string) {
    return this.kernelService.cancelInstance(id);
  }

  // ============ Lifecycle ============

  @Post('shutdown')
  @ApiOperation({ summary: 'Shutdown the kernel' })
  shutdown() {
    return this.kernelService.shutdown();
  }

  @Post('restart')
  @ApiOperation({ summary: 'Restart the kernel' })
  restart() {
    return this.kernelService.restart();
  }
}
