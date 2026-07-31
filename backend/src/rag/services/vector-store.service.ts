import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, MoreThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  VectorStore,
  VectorCollection,
  QueryHistory,
  DocumentChunk,
  VectorStatus,
  VectorType,
} from '../entities/rag.entity';
import { EmbeddingService } from './embedding.service';

export interface SearchResult {
  id: string;
  entityType: VectorType;
  entityId: string;
  content: string;
  metadata?: any;
  score: number;
  distance?: number;
}

export interface SemanticSearchOptions {
  query: string;
  entityTypes?: VectorType[];
  limit?: number;
  minSimilarity?: number;
  userId?: string;
  collection?: string;
}

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(
    @InjectRepository(VectorStore)
    private vectorRepo: Repository<VectorStore>,
    @InjectRepository(VectorCollection)
    private collectionRepo: Repository<VectorCollection>,
    @InjectRepository(QueryHistory)
    private queryHistoryRepo: Repository<QueryHistory>,
    @InjectRepository(DocumentChunk)
    private chunkRepo: Repository<DocumentChunk>,
    private embeddingService: EmbeddingService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ============ VECTOR OPERATIONS ============

  async createVector(
    entityType: VectorType,
    entityId: string,
    content: string,
    metadata?: string,
    userId?: string,
  ): Promise<VectorStore> {
    // Generate embedding
    const embeddingResult = await this.embeddingService.generateEmbedding(content);

    const vector = this.vectorRepo.create({
      entityType,
      entityId,
      content,
      metadata,
      userId,
      embedding: embeddingResult?.embedding || [],
      dimensions: embeddingResult?.embedding?.length || 1536,
      status: VectorStatus.PROCESSING,
    });

    const saved = await this.vectorRepo.save(vector);

    // Update status to indexed
    saved.status = VectorStatus.INDEXED;
    saved.indexedAt = new Date();
    await this.vectorRepo.save(saved);

    this.eventEmitter.emit('vector.indexed', { id: saved.id, entityType, entityId });

    return saved;
  }

  async createBulkVectors(
    vectors: Array<{
      entityType: VectorType;
      entityId: string;
      content: string;
      metadata?: string;
      userId?: string;
    }>,
  ): Promise<VectorStore[]> {
    const contents = vectors.map((v) => v.content);
    const embeddingResults = await this.embeddingService.generateBulkEmbeddings(contents);

    const entities = vectors.map((v, index) =>
      this.vectorRepo.create({
        entityType: v.entityType,
        entityId: v.entityId,
        content: v.content,
        metadata: v.metadata,
        userId: v.userId,
        embedding: embeddingResults?.embeddings[index] || [],
        dimensions: embeddingResults?.embeddings[index]?.length || 1536,
        status: VectorStatus.INDEXED,
        indexedAt: new Date(),
      }),
    );

    return this.vectorRepo.save(entities);
  }

  async findVector(id: string): Promise<VectorStore> {
    const vector = await this.vectorRepo.findOne({ where: { id } });
    if (!vector) {
      throw new NotFoundException(`Vector ${id} not found`);
    }
    return vector;
  }

  async updateVector(id: string, content: string, metadata?: string): Promise<VectorStore> {
    const vector = await this.findVector(id);

    // Regenerate embedding if content changed
    const embeddingResult = await this.embeddingService.generateEmbedding(content);

    vector.content = content;
    if (metadata) vector.metadata = metadata;
    vector.embedding = embeddingResult?.embedding || vector.embedding;
    vector.status = VectorStatus.INDEXED;
    vector.indexedAt = new Date();

    return this.vectorRepo.save(vector);
  }

  async deleteVector(id: string): Promise<void> {
    const vector = await this.findVector(id);
    await this.vectorRepo.remove(vector);
  }

  async getVectorsByEntityId(entityId: string): Promise<VectorStore[]> {
    return this.vectorRepo.find({ where: { entityId } });
  }

  // ============ SEMANTIC SEARCH ============

  async semanticSearch(options: SemanticSearchOptions): Promise<SearchResult[]> {
    const {
      query,
      entityTypes,
      limit = 10,
      minSimilarity = 0.7,
      userId,
      collection,
    } = options;

    // Generate query embedding
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    if (!queryEmbedding) {
      this.logger.error('Failed to generate query embedding');
      return [];
    }

    // Build query
    const qb = this.vectorRepo
      .createQueryBuilder('v')
      .where('v.status = :status', { status: VectorStatus.INDEXED })
      .andWhere('v.embedding IS NOT NULL')
      .andWhere('array_length(v.embedding, 1) > 0');

    if (entityTypes && entityTypes.length > 0) {
      qb.andWhere('v.entityType IN (:...entityTypes)', { entityTypes });
    }

    if (userId) {
      qb.andWhere('v.userId = :userId', { userId });
    }

    if (collection) {
      qb.andWhere('v.metadata LIKE :collection', { collection: `%${collection}%` });
    }

    qb.orderBy('v.accessCount', 'DESC');

    const vectors = await qb.getMany();

    // Calculate similarities
    const results: SearchResult[] = vectors
      .map((v) => {
        if (!v.embedding || v.embedding.length === 0) return null;

        const score = this.embeddingService.cosineSimilarity(
          queryEmbedding.embedding,
          v.embedding,
        );

        return {
          id: v.id,
          entityType: v.entityType,
          entityId: v.entityId,
          content: v.content,
          metadata: v.metadata ? JSON.parse(v.metadata) : undefined,
          score,
          distance: 1 - score,
        };
      })
      .filter((r) => r !== null && r.score >= minSimilarity)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, limit) as SearchResult[];

    // Update access counts
    for (const result of results) {
      await this.vectorRepo.increment({ id: result.id }, 'accessCount', 1);
      await this.vectorRepo.update({ id: result.id }, { lastAccessedAt: new Date() });
    }

    return results;
  }

  // ============ HYBRID SEARCH ============

  async hybridSearch(options: SemanticSearchOptions): Promise<SearchResult[]> {
    const {
      query,
      entityTypes,
      limit = 10,
      minSimilarity = 0.5,
    } = options;

    // Get semantic results
    const semanticResults = await this.semanticSearch({
      ...options,
      minSimilarity: 0.3, // Lower threshold for semantic
    });

    // Get keyword results using full-text search
    const keywordResults = await this.vectorRepo
      .createQueryBuilder('v')
      .where('v.status = :status', { status: VectorStatus.INDEXED })
      .andWhere('LOWER(v.content) LIKE LOWER(:query)', { query: `%${query}%` });

    if (entityTypes && entityTypes.length > 0) {
      keywordResults.andWhere('v.entityType IN (:...entityTypes)', { entityTypes });
    }

    const keywordVectors = await keywordResults.take(limit * 2).getMany();

    // Merge and rerank results
    const resultMap = new Map<string, SearchResult>();

    // Add semantic results
    semanticResults.forEach((r) => {
      resultMap.set(r.id, { ...r, score: r.score * 0.7 });
    });

    // Add keyword results with lower weight
    keywordVectors.forEach((v) => {
      const existing = resultMap.get(v.id);
      if (existing) {
        existing.score = Math.max(existing.score, 0.5 + 0.5);
      } else {
        resultMap.set(v.id, {
          id: v.id,
          entityType: v.entityType,
          entityId: v.entityId,
          content: v.content,
          metadata: v.metadata ? JSON.parse(v.metadata) : undefined,
          score: 0.5,
        });
      }
    });

    return Array.from(resultMap.values())
      .filter((r) => r.score >= minSimilarity)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // ============ COLLECTION MANAGEMENT ============

  async createCollection(
    name: string,
    description?: string,
    dimensions?: number,
  ): Promise<VectorCollection> {
    const collection = this.collectionRepo.create({
      name,
      description,
      dimensions: dimensions || 1536,
      embeddingModel: 'text-embedding-3-small',
    });
    return this.collectionRepo.save(collection);
  }

  async getCollections(): Promise<VectorCollection[]> {
    return this.collectionRepo.find();
  }

  async getCollection(name: string): Promise<VectorCollection> {
    const collection = await this.collectionRepo.findOne({ where: { name } });
    if (!collection) {
      throw new NotFoundException(`Collection ${name} not found`);
    }
    return collection;
  }

  async getCollectionStats(name: string): Promise<Record<string, any>> {
    const collection = await this.getCollection(name);

    const [totalVectors, indexedVectors, failedVectors] = await Promise.all([
      this.vectorRepo.count({ where: { metadata: `%${name}%` } }),
      this.vectorRepo.count({
        where: { metadata: `%${name}%`, status: VectorStatus.INDEXED },
      }),
      this.vectorRepo.count({
        where: { metadata: `%${name}%`, status: VectorStatus.FAILED },
      }),
    ]);

    return {
      collection,
      stats: {
        totalVectors,
        indexedVectors,
        failedVectors,
      },
    };
  }

  // ============ QUERY HISTORY ============

  async saveQuery(
    query: string,
    queryEmbedding: number[],
    userId?: string,
    retrievedDocuments?: string[],
    response?: Record<string, any>,
    responseTime?: number,
  ): Promise<QueryHistory> {
    const history = this.queryHistoryRepo.create({
      query,
      queryEmbedding,
      userId,
      retrievedDocuments,
      response,
      responseTime,
    });
    return this.queryHistoryRepo.save(history);
  }

  async getQueryHistory(userId?: string, limit = 20): Promise<QueryHistory[]> {
    const qb = this.queryHistoryRepo
      .createQueryBuilder('q')
      .orderBy('q.createdAt', 'DESC')
      .take(limit);

    if (userId) {
      qb.where('q.userId = :userId', { userId });
    }

    return qb.getMany();
  }

  // ============ DOCUMENT CHUNKING ============

  async chunkDocument(
    documentId: string,
    collectionName: string,
    content: string,
    chunkSize = 500,
    overlap = 50,
    metadata?: Record<string, any>,
  ): Promise<DocumentChunk[]> {
    const chunks: string[] = [];
    const words = content.split(/\s+/);

    let currentChunk = '';
    let startIndex = 0;

    while (startIndex < words.length) {
      currentChunk = words.slice(startIndex, startIndex + chunkSize).join(' ');

      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }

      startIndex += chunkSize - overlap;
    }

    // Generate embeddings for all chunks
    const embeddings = await this.embeddingService.generateBulkEmbeddings(chunks);

    const entities = chunks.map((chunk, index) =>
      this.chunkRepo.create({
        documentId,
        collectionName,
        chunkIndex: index,
        content: chunk,
        embedding: embeddings?.embeddings[index] || [],
        chunkSize: chunk.length,
        metadata,
      }),
    );

    return this.chunkRepo.save(entities);
  }

  // ============ STATISTICS ============

  async getStats(): Promise<Record<string, any>> {
    const [
      totalVectors,
      indexedVectors,
      pendingVectors,
      failedVectors,
      totalCollections,
      totalQueries,
    ] = await Promise.all([
      this.vectorRepo.count(),
      this.vectorRepo.count({ where: { status: VectorStatus.INDEXED } }),
      this.vectorRepo.count({ where: { status: VectorStatus.PENDING } }),
      this.vectorRepo.count({ where: { status: VectorStatus.FAILED } }),
      this.collectionRepo.count(),
      this.queryHistoryRepo.count(),
    ]);

    const vectorTypeDistribution = await this.vectorRepo
      .createQueryBuilder('v')
      .select('v.entityType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('v.entityType')
      .getRawMany();

    return {
      vectors: {
        total: totalVectors,
        indexed: indexedVectors,
        pending: pendingVectors,
        failed: failedVectors,
      },
      collections: totalCollections,
      queries: totalQueries,
      typeDistribution: vectorTypeDistribution,
    };
  }
}
