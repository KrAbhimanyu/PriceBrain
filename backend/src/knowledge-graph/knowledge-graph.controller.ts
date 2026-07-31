import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KnowledgeGraphService } from './knowledge-graph.service';
import {
  CreateEntityDto,
  UpdateEntityDto,
  CreateRelationDto,
  UpdateRelationDto,
  QueryKnowledgeGraphDto,
  SearchEntitiesDto,
  GetRelatedEntitiesDto,
} from './dto/knowledge-graph.dto';
import { EntityType, RelationType } from './entities/knowledge-graph.entity';

@ApiTags('Knowledge Graph')
@Controller('knowledge-graph')
export class KnowledgeGraphController {
  constructor(private readonly kgService: KnowledgeGraphService) {}

  // ============ ENTITIES ============

  @Post('entities')
  @ApiOperation({ summary: 'Create a new knowledge entity' })
  async createEntity(@Body() dto: CreateEntityDto) {
    return this.kgService.createEntity(dto);
  }

  @Get('entities')
  @ApiOperation({ summary: 'Search entities' })
  async searchEntities(@Query() dto: SearchEntitiesDto) {
    return this.kgService.searchEntities(dto);
  }

  @Get('entities/:id')
  @ApiOperation({ summary: 'Get entity by ID' })
  async getEntity(@Param('id') id: string) {
    return this.kgService.findEntity(id);
  }

  @Put('entities/:id')
  @ApiOperation({ summary: 'Update entity' })
  async updateEntity(@Param('id') id: string, @Body() dto: UpdateEntityDto) {
    return this.kgService.updateEntity(id, dto);
  }

  @Delete('entities/:id')
  @ApiOperation({ summary: 'Delete entity' })
  async deleteEntity(@Param('id') id: string) {
    await this.kgService.deleteEntity(id);
    return { success: true };
  }

  @Post('entities/:id/increment/:field')
  @ApiOperation({ summary: 'Increment entity count' })
  async incrementEntityCount(
    @Param('id') id: string,
    @Param('field') field: 'searchCount' | 'viewCount' | 'purchaseCount',
  ) {
    await this.kgService.incrementEntityCount(id, field);
    return { success: true };
  }

  // ============ RELATIONS ============

  @Post('relations')
  @ApiOperation({ summary: 'Create a new relation' })
  async createRelation(@Body() dto: CreateRelationDto) {
    return this.kgService.createRelation(dto);
  }

  @Get('relations/:id')
  @ApiOperation({ summary: 'Get relation by ID' })
  async getRelation(@Param('id') id: string) {
    return this.kgService.relationRepo.findOne({ where: { id } });
  }

  @Patch('relations/:id')
  @ApiOperation({ summary: 'Update relation' })
  async updateRelation(@Param('id') id: string, @Body() dto: UpdateRelationDto) {
    return this.kgService.updateRelation(id, dto);
  }

  @Delete('relations/:id')
  @ApiOperation({ summary: 'Delete relation' })
  async deleteRelation(@Param('id') id: string) {
    await this.kgService.deleteRelation(id);
    return { success: true };
  }

  // ============ QUERIES ============

  @Post('query')
  @ApiOperation({ summary: 'Query the knowledge graph' })
  async query(@Body() dto: QueryKnowledgeGraphDto) {
    return this.kgService.query(dto);
  }

  @Get('entities/:id/related')
  @ApiOperation({ summary: 'Get related entities' })
  async getRelatedEntities(@Param('id') id: string, @Query() dto: GetRelatedEntitiesDto) {
    return this.kgService.getRelatedEntities({ entityId: id, ...dto });
  }

  // ============ RECOMMENDATIONS ============

  @Get('entities/:id/recommendations')
  @ApiOperation({ summary: 'Get recommendations for entity' })
  async getRecommendations(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.kgService.getRecommendations(id, limit);
  }

  @Get('entities/:id/alternatives')
  @ApiOperation({ summary: 'Get alternative products' })
  async getAlternatives(@Param('id') id: string) {
    return this.kgService.getAlternatives(id);
  }

  @Get('entities/:id/accessories')
  @ApiOperation({ summary: 'Get related accessories' })
  async getAccessories(@Param('id') id: string) {
    return this.kgService.getAccessories(id);
  }

  // ============ STATISTICS ============

  @Get('statistics')
  @ApiOperation({ summary: 'Get knowledge graph statistics' })
  async getStatistics() {
    return this.kgService.getStatistics();
  }

  // ============ BULK OPERATIONS ============

  @Post('bulk/entities')
  @ApiOperation({ summary: 'Create multiple entities' })
  async createBulkEntities(@Body() dtos: CreateEntityDto[]) {
    const results = await Promise.all(dtos.map((dto) => this.kgService.createEntity(dto)));
    return { created: results.length, entities: results };
  }

  @Post('bulk/relations')
  @ApiOperation({ summary: 'Create multiple relations' })
  async createBulkRelations(@Body() dtos: CreateRelationDto[]) {
    const results = await Promise.all(dtos.map((dto) => this.kgService.createRelation(dto)));
    return { created: results.length, relations: results };
  }
}
