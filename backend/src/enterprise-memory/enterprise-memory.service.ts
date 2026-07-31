import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EnterpriseMemory, MemoryAssociation } from './entities/enterprise-memory.entity';
import { CreateMemoryDto, UpdateMemoryDto, QueryMemoryDto, CreateAssociationDto } from './dto/enterprise-memory.dto';

@Injectable()
export class EnterpriseMemoryService {
  private readonly logger = new Logger(EnterpriseMemoryService.name);

  constructor(
    @InjectRepository(EnterpriseMemory)
    private memoryRepository: Repository<EnterpriseMemory>,
    @InjectRepository(MemoryAssociation)
    private associationRepository: Repository<MemoryAssociation>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ============ MEMORY ============

  async createMemory(dto: CreateMemoryDto): Promise<EnterpriseMemory> {
    const memory = this.memoryRepository.create({
      ...dto,
      tags: dto.tags || [],
    });

    const saved = await this.memoryRepository.save(memory);
    this.eventEmitter.emit('memory.created', { memoryId: saved.id });
    this.logger.log(`Enterprise memory created: ${dto.title || dto.memoryType}`);
    return saved;
  }

  async findMemories(query: QueryMemoryDto): Promise<EnterpriseMemory[]> {
    const qb = this.memoryRepository.createQueryBuilder('m');

    if (query.organizationId) {
      qb.andWhere('m.organizationId = :organizationId', { organizationId: query.organizationId });
    }

    if (query.departmentId) {
      qb.andWhere('m.departmentId = :departmentId', { departmentId: query.departmentId });
    }

    if (query.memoryType) {
      qb.andWhere('m.memoryType = :memoryType', { memoryType: query.memoryType });
    }

    if (query.accessibility) {
      qb.andWhere('m.accessibility = :accessibility', { accessibility: query.accessibility });
    }

    if (query.search) {
      qb.andWhere('(m.title ILIKE :search OR m.content ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.tags && query.tags.length > 0) {
      qb.andWhere('m.tags && :tags', { tags: query.tags });
    }

    return qb.orderBy('m.importance', 'DESC').addOrderBy('m.createdAt', 'DESC').getMany();
  }

  async findMemory(id: string): Promise<EnterpriseMemory> {
    const memory = await this.memoryRepository.findOne({ where: { id } });
    if (!memory) {
      throw new NotFoundException(`Memory ${id} not found`);
    }
    return memory;
  }

  async updateMemory(id: string, dto: UpdateMemoryDto): Promise<EnterpriseMemory> {
    const memory = await this.findMemory(id);
    Object.assign(memory, dto);
    return this.memoryRepository.save(memory);
  }

  async deleteMemory(id: string): Promise<void> {
    const memory = await this.findMemory(id);
    await this.memoryRepository.remove(memory);
    // Also remove associations
    await this.associationRepository.delete({ memoryId: id });
  }

  // ============ MEMORY SEARCH ============

  async searchMemories(
    query: string,
    organizationId?: string,
    options?: {
      memoryTypes?: string[];
      limit?: number;
      minImportance?: number;
    },
  ): Promise<EnterpriseMemory[]> {
    const qb = this.memoryRepository
      .createQueryBuilder('m')
      .where('(m.title ILIKE :query OR m.content ILIKE :query)', { query: `%${query}%` });

    if (organizationId) {
      qb.andWhere('m.organizationId = :organizationId', { organizationId });
    }

    if (options?.memoryTypes && options.memoryTypes.length > 0) {
      qb.andWhere('m.memoryType IN (:...types)', { types: options.memoryTypes });
    }

    if (options?.minImportance !== undefined) {
      qb.andWhere('m.importance >= :importance', { importance: options.minImportance });
    }

    qb.orderBy('m.importance', 'DESC').addOrderBy('m.createdAt', 'DESC');

    if (options?.limit) {
      qb.limit(options.limit);
    }

    return qb.getMany();
  }

  async findRelatedMemories(memoryId: string): Promise<EnterpriseMemory[]> {
    const associations = await this.associationRepository.find({
      where: { memoryId },
      order: { strength: 'DESC' },
    });

    const relatedIds = associations.map(a => a.associatedId);
    if (relatedIds.length === 0) {
      return [];
    }

    return this.memoryRepository.findByIds(relatedIds);
  }

  // ============ ASSOCIATIONS ============

  async createAssociation(dto: CreateAssociationDto): Promise<MemoryAssociation> {
    const association = this.associationRepository.create(dto);
    return this.associationRepository.save(association);
  }

  async findAssociations(memoryId: string): Promise<MemoryAssociation[]> {
    return this.associationRepository.find({
      where: { memoryId },
      order: { strength: 'DESC' },
    });
  }

  async deleteAssociation(id: string): Promise<void> {
    await this.associationRepository.delete(id);
  }

  // ============ MEMORY STATS ============

  async getMemoryStats(organizationId?: string): Promise<Record<string, any>> {
    const qb = this.memoryRepository.createQueryBuilder('m');

    if (organizationId) {
      qb.where('m.organizationId = :organizationId', { organizationId });
    }

    const memories = await qb.getMany();

    const byType: Record<string, number> = {};
    const byAccessibility: Record<string, number> = {};
    const avgImportance = memories.length > 0
      ? memories.reduce((sum, m) => sum + m.importance, 0) / memories.length
      : 0;

    for (const memory of memories) {
      byType[memory.memoryType] = (byType[memory.memoryType] || 0) + 1;
      byAccessibility[memory.accessibility] = (byAccessibility[memory.accessibility] || 0) + 1;
    }

    return {
      total: memories.length,
      byType,
      byAccessibility,
      avgImportance,
    };
  }

  // ============ LEARNING ============

  async learnFromOutcome(
    memoryId: string,
    outcome: {
      success: boolean;
      feedback?: string;
      lessonsLearned?: string[];
    },
  ): Promise<EnterpriseMemory> {
    const memory = await this.findMemory(memoryId);

    // Adjust importance based on outcome
    if (outcome.success) {
      memory.importance = Math.min(100, memory.importance + 5);
    } else {
      memory.importance = Math.max(1, memory.importance - 5);
    }

    // Add tags from lessons learned
    if (outcome.lessonsLearned && outcome.lessonsLearned.length > 0) {
      memory.tags = [...new Set([...memory.tags, ...outcome.lessonsLearned])];
    }

    // Append to metadata
    memory.metadata = {
      ...memory.metadata,
      lastOutcome: outcome,
      outcomeCount: (memory.metadata?.outcomeCount || 0) + 1,
    };

    const saved = await this.memoryRepository.save(memory);

    // Create learning memory if lessons learned
    if (outcome.lessonsLearned && outcome.lessonsLearned.length > 0 && memory.organizationId) {
      await this.createMemory({
        organizationId: memory.organizationId,
        memoryType: 'learning',
        title: `Learning from: ${memory.title}`,
        content: outcome.lessonsLearned.join('\n'),
        accessibility: 'department',
        importance: 50,
        tags: ['learning', 'outcome'],
      });
    }

    return saved;
  }
}
