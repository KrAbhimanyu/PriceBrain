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
import { ToolBusService } from './tool-bus.service';
import {
  CreateToolDto,
  UpdateToolDto,
  InvokeToolDto,
  QueryToolsDto,
} from './dto/tool-bus.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tool Bus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tools')
export class ToolBusController {
  constructor(private readonly toolBusService: ToolBusService) {}

  // ============ Tool Management ============

  @Post()
  @ApiOperation({ summary: 'Create a new tool' })
  createTool(@Body() dto: CreateToolDto) {
    return this.toolBusService.createTool(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tools' })
  findAll(@Query() query: QueryToolsDto) {
    return this.toolBusService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get tool categories' })
  getCategories() {
    return this.toolBusService.getCategories();
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system tools' })
  findSystemTools() {
    return this.toolBusService.findAll({ systemOnly: true });
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get tool by name' })
  findByName(@Param('name') name: string) {
    return this.toolBusService.findByName(name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tool by ID' })
  findById(@Param('id') id: string) {
    return this.toolBusService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tool' })
  updateTool(@Param('id') id: string, @Body() dto: UpdateToolDto) {
    return this.toolBusService.updateTool(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tool' })
  deleteTool(@Param('id') id: string) {
    return this.toolBusService.deleteTool(id);
  }

  // ============ Tool Invocation ============

  @Post('invoke/:name')
  @ApiOperation({ summary: 'Invoke a tool' })
  invoke(@Request() req, @Param('name') name: string, @Body() dto: InvokeToolDto) {
    return this.toolBusService.invoke(name, req.user.id, dto);
  }

  @Get('invocations/:id')
  @ApiOperation({ summary: 'Get invocation details' })
  getInvocation(@Param('id') id: string) {
    return this.toolBusService.getInvocation(id);
  }

  @Get('invocations/mine')
  @ApiOperation({ summary: 'Get my invocation history' })
  getMyInvocations(@Request() req, @Query('toolId') toolId?: string) {
    return this.toolBusService.getInvocationHistory(req.user.id, toolId);
  }

  // ============ Statistics ============

  @Get('stats/:name')
  @ApiOperation({ summary: 'Get tool statistics' })
  getToolStats(@Param('name') name: string) {
    return this.toolBusService.getToolStats(name);
  }
}
