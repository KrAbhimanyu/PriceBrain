import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EnterpriseMemoryService } from './enterprise-memory.service';
import { CreateMemoryDto, UpdateMemoryDto, QueryMemoryDto, CreateAssociationDto, LearnFromOutcomeDto } from './dto/enterprise-memory.dto';

@ApiTags('enterprise-memory')
@Controller('enterprise-memory')
export class EnterpriseMemoryController {
  constructor(private readonly memoryService: EnterpriseMemoryService) {}

  // ============ MEMORY CRUD ============

  @Post('memories')
  @ApiOperation({ summary: 'Create a new memory' })
  async createMemory(@Body() dto: CreateMemoryDto) {
    return this.memoryService.createMemory(dto);
  }

  @Get('memories')
  @ApiOperation({ summary: 'Get all memories with filters' })
  async getMemories(@Query() query: QueryMemoryDto) {
    return this.memoryService.findMemories(query);
  }

  @Get('memories/search')
  @ApiOperation({ summary: 'Search memories by text' })
  async searchMemories(
    @Query('q') query: string,
    @Query('organizationId') organizationId?: string,
    @Query('types') types?: string,
    @Query('limit') limit?: number,
  ) {
    return this.memoryService.searchMemories(
      query,
      organizationId,
      {
        memoryTypes: types?.split(','),
        limit: limit ? parseInt(limit.toString()) : undefined,
      },
    );
  }

  @Get('memories/:id')
  @ApiOperation({ summary: 'Get a memory by ID' })
  async getMemory(@Param('id') id: string) {
    return this.memoryService.findMemory(id);
  }

  @Put('memories/:id')
  @ApiOperation({ summary: 'Update a memory' })
  async updateMemory(@Param('id') id: string, @Body() dto: UpdateMemoryDto) {
    return this.memoryService.updateMemory(id, dto);
  }

  @Delete('memories/:id')
  @ApiOperation({ summary: 'Delete a memory' })
  async deleteMemory(@Param('id') id: string) {
    await this.memoryService.deleteMemory(id);
    return { success: true };
  }

  // ============ RELATED MEMORIES ============

  @Get('memories/:id/related')
  @ApiOperation({ summary: 'Get related memories' })
  async getRelatedMemories(@Param('id') id: string) {
    return this.memoryService.findRelatedMemories(id);
  }

  // ============ ASSOCIATIONS ============

  @Post('associations')
  @ApiOperation({ summary: 'Create a memory association' })
  async createAssociation(@Body() dto: CreateAssociationDto) {
    return this.memoryService.createAssociation(dto);
  }

  @Get('memories/:id/associations')
  @ApiOperation({ summary: 'Get associations for a memory' })
  async getAssociations(@Param('id') id: string) {
    return this.memoryService.findAssociations(id);
  }

  @Delete('associations/:id')
  @ApiOperation({ summary: 'Delete an association' })
  async deleteAssociation(@Param('id') id: string) {
    await this.memoryService.deleteAssociation(id);
    return { success: true };
  }

  // ============ STATS ============

  @Get('stats')
  @ApiOperation({ summary: 'Get memory statistics' })
  async getStats(@Query('organizationId') organizationId?: string) {
    return this.memoryService.getMemoryStats(organizationId);
  }

  // ============ LEARNING ============

  @Post('memories/:id/learn')
  @ApiOperation({ summary: 'Learn from an outcome' })
  async learnFromOutcome(@Param('id') id: string, @Body() dto: LearnFromOutcomeDto) {
    return this.memoryService.learnFromOutcome(id, dto);
  }
}
