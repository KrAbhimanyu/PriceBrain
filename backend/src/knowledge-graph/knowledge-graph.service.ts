import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  KnowledgeGraphEntity,
  KnowledgeGraphRelation,
  KnowledgeGraphQuery,
  EntityType,
  RelationType,
} from './entities/knowledge-graph.entity';
import {
  CreateEntityDto,
  UpdateEntityDto,
  CreateRelationDto,
  UpdateRelationDto,
  QueryKnowledgeGraphDto,
  SearchEntitiesDto,
  GetRelatedEntitiesDto,
} from './dto/knowledge-graph.dto';

// RAG Integration types
interface RAGSearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: any;
}

@Injectable()
export class KnowledgeGraphService {
  private readonly logger = new Logger(KnowledgeGraphService.name);

  constructor(
    @InjectRepository(KnowledgeGraphEntity)
    private entityRepo: Repository<KnowledgeGraphEntity>,
    @InjectRepository(KnowledgeGraphRelation)
    private relationRepo: Repository<KnowledgeGraphRelation>,
    @InjectRepository(KnowledgeGraphQuery)
    private queryRepo: Repository<KnowledgeGraphQuery>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ============ ENTITY OPERATIONS ============

  async createEntity(dto: CreateEntityDto): Promise<KnowledgeGraphEntity> {
    const entity = this.entityRepo.create(dto);
    const saved = await this.entityRepo.save(entity);
    
    this.eventEmitter.emit('knowledge.entity.created', { entityId: saved.id, type: saved.entityType });
    this.logger.log(`Created knowledge entity: ${saved.name} (${saved.entityType})`);
    
    return saved;
  }

  async findEntity(id: string): Promise<KnowledgeGraphEntity> {
    const entity = await this.entityRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Entity ${id} not found`);
    }
    return entity;
  }

  async findEntityByName(name: string, type?: EntityType): Promise<KnowledgeGraphEntity | null> {
    const qb = this.entityRepo
      .createQueryBuilder('e')
      .where('LOWER(e.name) = LOWER(:name)', { name });

    if (type) {
      qb.andWhere('e.entityType = :type', { type });
    }

    return qb.getOne();
  }

  async updateEntity(id: string, dto: UpdateEntityDto): Promise<KnowledgeGraphEntity> {
    const entity = await this.findEntity(id);
    Object.assign(entity, dto);
    return this.entityRepo.save(entity);
  }

  async deleteEntity(id: string): Promise<void> {
    const entity = await this.findEntity(id);
    
    // Delete all relations involving this entity
    await this.relationRepo.delete({ sourceEntityId: id });
    await this.relationRepo.delete({ targetEntityId: id });
    
    await this.entityRepo.remove(entity);
    this.logger.log(`Deleted entity: ${entity.name}`);
  }

  async incrementEntityCount(id: string, field: 'searchCount' | 'viewCount' | 'purchaseCount'): Promise<void> {
    await this.entityRepo.increment({ id }, field, 1);
  }

  // ============ RELATION OPERATIONS ============

  async createRelation(dto: CreateRelationDto): Promise<KnowledgeGraphRelation> {
    // Verify both entities exist
    await this.findEntity(dto.sourceEntityId);
    await this.findEntity(dto.targetEntityId);

    // Check if relation already exists
    const existing = await this.relationRepo.findOne({
      where: {
        sourceEntityId: dto.sourceEntityId,
        targetEntityId: dto.targetEntityId,
        relationType: dto.relationType,
      },
    });

    if (existing) {
      existing.weight += 1;
      existing.usageCount += 1;
      return this.relationRepo.save(existing);
    }

    const relation = this.relationRepo.create(dto);
    const saved = await this.relationRepo.save(relation);
    
    this.eventEmitter.emit('knowledge.relation.created', { relationId: saved.id });
    
    return saved;
  }

  async updateRelation(id: string, dto: UpdateRelationDto): Promise<KnowledgeGraphRelation> {
    const relation = await this.relationRepo.findOne({ where: { id } });
    if (!relation) {
      throw new NotFoundException(`Relation ${id} not found`);
    }

    Object.assign(relation, dto);
    return this.relationRepo.save(relation);
  }

  async deleteRelation(id: string): Promise<void> {
    const relation = await this.relationRepo.findOne({ where: { id } });
    if (!relation) {
      throw new NotFoundException(`Relation ${id} not found`);
    }

    await this.relationRepo.remove(relation);
  }

  async incrementRelationUsage(id: string): Promise<void> {
    await this.relationRepo.increment({ id }, 'usageCount', 1);
  }

  // ============ SEARCH & QUERY OPERATIONS ============

  async searchEntities(dto: SearchEntitiesDto): Promise<KnowledgeGraphEntity[]> {
    const qb = this.entityRepo
      .createQueryBuilder('e')
      .where('e.isActive = :active', { active: true });

    // Text search on name and aliases
    if (dto.query) {
      qb.andWhere(
        '(LOWER(e.name) LIKE LOWER(:query) OR LOWER(e.description) LIKE LOWER(:query))',
        { query: `%${dto.query}%` },
      );
    }

    if (dto.entityType) {
      qb.andWhere('e.entityType = :type', { type: dto.entityType });
    }

    qb.orderBy('e.popularity', 'DESC');

    if (dto.limit) {
      qb.take(dto.limit);
    }

    if (dto.offset) {
      qb.skip(dto.offset);
    }

    return qb.getMany();
  }

  async getRelatedEntities(dto: GetRelatedEntitiesDto): Promise<Record<string, any>[]> {
    const results: Record<string, any>[] = [];
    const visited = new Set<string>();
    const depth = dto.depth || 1;

    const traverse = async (entityId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(entityId)) return;
      visited.add(entityId);

      // Find relations where this entity is source
      const outgoing = await this.relationRepo.find({
        where: { sourceEntityId: entityId, isActive: true },
        relations: ['targetEntity'],
      });

      for (const rel of outgoing) {
        if (dto.relationTypes && !dto.relationTypes.includes(rel.relationType)) {
          continue;
        }

        if (!visited.has(rel.targetEntityId)) {
          results.push({
            entity: rel.targetEntity,
            relation: rel,
            depth: currentDepth,
          });
        }

        if (currentDepth < depth) {
          await traverse(rel.targetEntityId, currentDepth + 1);
        }
      }

      // Find relations where this entity is target
      const incoming = await this.relationRepo.find({
        where: { targetEntityId: entityId, isActive: true },
        relations: ['sourceEntity'],
      });

      for (const rel of incoming) {
        if (dto.relationTypes && !dto.relationTypes.includes(rel.relationType)) {
          continue;
        }

        if (!visited.has(rel.sourceEntityId)) {
          results.push({
            entity: rel.sourceEntity,
            relation: rel,
            depth: currentDepth,
            direction: 'incoming',
          });
        }
      }
    };

    await traverse(dto.entityId, 0);

    return results.slice(0, dto.limit || 50);
  }

  async query(dto: QueryKnowledgeGraphDto): Promise<Record<string, any>> {
    const startTime = Date.now();
    
    // Parse the query to extract entities and intent
    const parsed = this.parseQuery(dto.query);
    
    // Find entities matching the query
    const entities = await this.searchEntities({
      query: dto.query,
      entityType: dto.entityType as EntityType,
      limit: dto.limit || 10,
    });

    // Find relations between entities
    const entityIds = entities.map((e) => e.id);
    let relations: KnowledgeGraphRelation[] = [];

    if (entityIds.length > 0) {
      relations = await this.relationRepo
        .createQueryBuilder('r')
        .where('r.sourceEntityId IN (:...ids)', { ids: entityIds })
        .orWhere('r.targetEntityId IN (:...ids)', { ids: entityIds })
        .andWhere('r.isActive = :active', { active: true })
        .getMany();
    }

    // Increment search counts
    for (const entity of entities) {
      await this.incrementEntityCount(entity.id, 'searchCount');
    }

    const responseTime = Date.now() - startTime;

    // Save query for learning
    const queryRecord = this.queryRepo.create({
      query: dto.query,
      parsedQuery: parsed,
      entities: entityIds,
      intent: parsed.intent,
      resultCount: entities.length,
      responseTime,
      isSuccessful: entities.length > 0,
    });
    await this.queryRepo.save(queryRecord);

    return {
      query: dto.query,
      parsedQuery: parsed,
      entities,
      relations,
      resultCount: entities.length,
      responseTime,
    };
  }

  private parseQuery(query: string): Record<string, any> {
    const lowerQuery = query.toLowerCase();
    let intent = 'search';

    // Detect intent
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus')) {
      intent = 'compare';
    } else if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      intent = 'recommend';
    } else if (lowerQuery.includes('alternative') || lowerQuery.includes('instead')) {
      intent = 'alternative';
    } else if (lowerQuery.includes('similar') || lowerQuery.includes('like')) {
      intent = 'similar';
    } else if (lowerQuery.includes('accessory') || lowerQuery.includes('complement')) {
      intent = 'accessory';
    } else if (lowerQuery.includes('cheaper') || lowerQuery.includes('budget')) {
      intent = 'cheaper';
    }

    // Extract keywords
    const keywords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    return {
      intent,
      keywords,
      originalQuery: query,
    };
  }

  // ============ STATISTICS ============

  async getStatistics(): Promise<Record<string, any>> {
    const [entityCount, relationCount, queryCount] = await Promise.all([
      this.entityRepo.count(),
      this.relationRepo.count(),
      this.queryRepo.count(),
    ]);

    const topEntities = await this.entityRepo
      .createQueryBuilder('e')
      .orderBy('e.popularity', 'DESC')
      .take(10)
      .getMany();

    const topRelations = await this.relationRepo
      .createQueryBuilder('r')
      .groupBy('r.relationType')
      .select('r.relationType', 'type')
      .addSelect('COUNT(*)', 'count')
      .getRawMany();

    const entityTypeDistribution = await this.entityRepo
      .createQueryBuilder('e')
      .groupBy('e.entityType')
      .select('e.entityType', 'type')
      .addSelect('COUNT(*)', 'count')
      .getRawMany();

    return {
      totalEntities: entityCount,
      totalRelations: relationCount,
      totalQueries: queryCount,
      topEntities,
      relationTypeDistribution: topRelations,
      entityTypeDistribution,
    };
  }

  // ============ RECOMMENDATIONS ============

  async getRecommendations(entityId: string, limit: number = 10): Promise<KnowledgeGraphEntity[]> {
    // Get similar entities based on relations
    const relations = await this.relationRepo.find({
      where: [
        { sourceEntityId: entityId, isActive: true },
        { targetEntityId: entityId, isActive: true },
      ],
      order: { weight: 'DESC' },
      take: 50,
    });

    const relatedIds = relations.map((r) =>
      r.sourceEntityId === entityId ? r.targetEntityId : r.sourceEntityId,
    );

    if (relatedIds.length === 0) {
      return [];
    }

    return this.entityRepo
      .createQueryBuilder('e')
      .where('e.id IN (:...ids)', { ids: relatedIds })
      .andWhere('e.id != :entityId', { entityId })
      .orderBy('e.popularity', 'DESC')
      .take(limit)
      .getMany();
  }

  async getAlternatives(entityId: string): Promise<KnowledgeGraphEntity[]> {
    const alternatives = await this.relationRepo.find({
      where: [
        { sourceEntityId: entityId, relationType: RelationType.ALTERNATIVE_TO, isActive: true },
        { targetEntityId: entityId, relationType: RelationType.ALTERNATIVE_TO, isActive: true },
      ],
      relations: ['sourceEntity', 'targetEntity'],
    });

    return alternatives.map((a) =>
      a.sourceEntityId === entityId ? a.targetEntity : a.sourceEntity,
    );
  }

  async getAccessories(entityId: string): Promise<KnowledgeGraphEntity[]> {
    const accessories = await this.relationRepo.find({
      where: [
        { sourceEntityId: entityId, relationType: RelationType.ACCESSORY_OF, isActive: true },
        { targetEntityId: entityId, relationType: RelationType.ACCESSORY_OF, isActive: true },
      ],
      relations: ['sourceEntity', 'targetEntity'],
    });

    return accessories.map((a) =>
      a.sourceEntityId === entityId ? a.targetEntity : a.sourceEntity,
    );
  }
}
