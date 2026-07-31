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
import { PluginsService } from './plugins.service';
import {
  CreatePluginDto,
  UpdatePluginDto,
  InstallPluginDto,
  UpdateUserPluginDto,
  QueryPluginsDto,
} from './dto/plugin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Plugins')
@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  // Public endpoints
  @Get()
  @ApiOperation({ summary: 'Get available plugins' })
  findAll(@Query() query: QueryPluginsDto) {
    return this.pluginsService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get plugin categories' })
  getCategories() {
    return this.pluginsService.getCategories();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get plugin by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.pluginsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific plugin' })
  findOne(@Param('id') id: string) {
    return this.pluginsService.findOne(id);
  }

  // Admin endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new plugin (admin)' })
  create(@Body() dto: CreatePluginDto) {
    return this.pluginsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a plugin (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdatePluginDto) {
    return this.pluginsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plugin (admin)' })
  delete(@Param('id') id: string) {
    return this.pluginsService.delete(id);
  }

  // User plugin endpoints
  @Post('install')
  @ApiOperation({ summary: 'Install a plugin' })
  @UseGuards(JwtAuthGuard)
  install(@Request() req, @Body() dto: InstallPluginDto) {
    return this.pluginsService.install(req.user.id, dto);
  }

  @Get('installed/mine')
  @ApiOperation({ summary: 'Get my installed plugins' })
  @UseGuards(JwtAuthGuard)
  findInstalled(@Request() req) {
    return this.pluginsService.findInstalled(req.user.id);
  }

  @Get('active/mine')
  @ApiOperation({ summary: 'Get my active plugins' })
  @UseGuards(JwtAuthGuard)
  findActive(@Request() req) {
    return this.pluginsService.findActive(req.user.id);
  }

  @Patch('installed/:id')
  @ApiOperation({ summary: 'Update installed plugin' })
  @UseGuards(JwtAuthGuard)
  updateUserPlugin(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateUserPluginDto,
  ) {
    return this.pluginsService.updateUserPlugin(id, req.user.id, dto);
  }

  @Delete('installed/:id')
  @ApiOperation({ summary: 'Uninstall a plugin' })
  @UseGuards(JwtAuthGuard)
  uninstall(@Request() req, @Param('id') id: string) {
    return this.pluginsService.uninstall(id, req.user.id);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute a plugin action' })
  @UseGuards(JwtAuthGuard)
  executePlugin(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { action: string; params?: Record<string, any> },
  ) {
    return this.pluginsService.executePlugin(
      req.user.id,
      id,
      body.action,
      body.params || {},
    );
  }
}
