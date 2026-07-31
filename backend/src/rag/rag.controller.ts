import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VectorStoreService } from './services/vector-store.service';
import { EmbeddingService } from './services/embedding.service';
import { RAGOrchestrationService } from './services/rag-orchestration.service';
import {
  CreateVectorDto,
  CreateBulkVectorsDto,
  QueryVectorDto,
  SemanticSearchDto,
  GenerateEmbeddingDto,
  GenerateBulkEmbeddingsDto,
  RAGQueryDto,
  CreateCollectionDto,
  ChunkDocumentDto,
} from './dto/rag.dto';
import { VectorType } from './entities/rag.entity';

@ApiTags('RAG (Retrieval Augmented Generation)')
@Controller('rag')
export class RAGController {
  constructor(
    private readonly vectorStoreService: VectorStoreService,
    private readonly embeddingService: EmbeddingService,
    private readonly ragService: RAGOrchestrationService,
  ) {}

  // ============ EMBEDDINGS ============

  @Post('embeddings')
  @ApiOperation({ summary: 'Generate embedding for text' })
  async generateEmbedding(@Body() dto: GenerateEmbeddingDto) {
    return this.embeddingService.generateEmbedding(dto.text, dto.model);
  }

  @Post('embeddings/bulk')
  @ApiOperation({ summary: 'Generate embeddings for multiple texts' })
  async generateBulkEmbeddings(@Body() dto: GenerateBulkEmbeddingsDto) {
    return this.embeddingService.generateBulkEmbeddings(dto.texts);
  }

  // ============ VECTOR OPERATIONS ============

  @Post('vectors')
  @ApiOperation({ summary: 'Create a new vector' })
  async createVector(@Body() dto: CreateVectorDto) {
    return this.vectorStoreService.createVector(
      dto.entityType,
      dto.entityId,
      dto.content,
      dto.metadata,
      dto.userId,
    );
  }

  @Post('vectors/bulk')
  @ApiOperation({ summary: 'Create multiple vectors' })
  async createBulkVectors(@Body() dto: CreateBulkVectorsDto) {
    return this.vectorStoreService.createBulkVectors(dto.vectors);
  }

  @Get('vectors/:id')
  @ApiOperation({ summary: 'Get vector by ID' })
  async getVector(@Param('id') id: string) {
    return this.vectorStoreService.findVector(id);
  }

  @Put('vectors/:id')
  @ApiOperation({ summary: 'Update vector' })
  async updateVector(
    @Param('id') id: string,
    @Body() body: { content: string; metadata?: string },
  ) {
    return this.vectorStoreService.updateVector(id, body.content, body.metadata);
  }

  @Delete('vectors/:id')
  @ApiOperation({ summary: 'Delete vector' })
  async deleteVector(@Param('id') id: string) {
    await this.vectorStoreService.deleteVector(id);
    return { success: true };
  }

  @Get('vectors/entity/:entityId')
  @ApiOperation({ summary: 'Get vectors by entity ID' })
  async getVectorsByEntity(@Param('entityId') entityId: string) {
    return this.vectorStoreService.getVectorsByEntityId(entityId);
  }

  // ============ SEARCH ============

  @Post('search')
  @ApiOperation({ summary: 'Semantic search' })
  async semanticSearch(@Body() dto: SemanticSearchDto) {
    return this.vectorStoreService.semanticSearch({
      query: dto.query,
      entityTypes: dto.filters as VectorType[],
      limit: dto.topK || 10,
      minSimilarity: dto.minSimilarity || 0.7,
      collection: dto.collection,
    });
  }

  @Post('search/hybrid')
  @ApiOperation({ summary: 'Hybrid search (semantic + keyword)' })
  async hybridSearch(@Body() dto: SemanticSearchDto) {
    return this.vectorStoreService.hybridSearch({
      query: dto.query,
      entityTypes: dto.filters as VectorType[],
      limit: dto.topK || 10,
      minSimilarity: dto.minSimilarity || 0.5,
      collection: dto.collection,
    });
  }

  @Post('query')
  @ApiOperation({ summary: 'Query with RAG (retrieval + generation)' })
  async queryWithRAG(@Body() dto: RAGQueryDto) {
    return this.ragService.query(dto);
  }

  @Post('query/products')
  @ApiOperation({ summary: 'Query products with RAG' })
  async queryProducts(
    @Body()
    body: {
      query: string;
      products: Array<{ id: string; name: string; description: string; price: number }>;
      userId?: string;
    },
  ) {
    return this.ragService.queryWithProducts(body.query, body.products, body.userId);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Compare products using RAG' })
  async compareProducts(
    @Body()
    body: {
      products: Array<{ id: string; name: string; specs: Record<string, any>; price: number }>;
    },
  ) {
    return this.ragService.compareProducts(body.products);
  }

  @Post('recommend')
  @ApiOperation({ summary: 'Get product recommendations' })
  async recommendProducts(
    @Body()
    body: {
      preferences: {
        budget?: number;
        useCase?: string;
        requirements?: string[];
      };
      products: Array<{ id: string; name: string; description: string; price: number; rating: number }>;
    },
  ) {
    return this.ragService.recommendProducts(body.preferences, body.products);
  }

  // ============ COLLECTIONS ============

  @Post('collections')
  @ApiOperation({ summary: 'Create a new collection' })
  async createCollection(@Body() dto: CreateCollectionDto) {
    return this.vectorStoreService.createCollection(
      dto.name,
      dto.description,
      dto.dimensions,
    );
  }

  @Get('collections')
  @ApiOperation({ summary: 'List all collections' })
  async getCollections() {
    return this.vectorStoreService.getCollections();
  }

  @Get('collections/:name')
  @ApiOperation({ summary: 'Get collection details' })
  async getCollection(@Param('name') name: string) {
    return this.vectorStoreService.getCollection(name);
  }

  @Get('collections/:name/stats')
  @ApiOperation({ summary: 'Get collection statistics' })
  async getCollectionStats(@Param('name') name: string) {
    return this.vectorStoreService.getCollectionStats(name);
  }

  // ============ DOCUMENT CHUNKING ============

  @Post('chunk')
  @ApiOperation({ summary: 'Chunk a document for indexing' })
  async chunkDocument(@Body() dto: ChunkDocumentDto) {
    return this.vectorStoreService.chunkDocument(
      dto.documentId,
      dto.collectionName,
      dto.content,
      dto.chunkSize,
      dto.overlap,
      dto.metadata,
    );
  }

  // ============ QUERY HISTORY ============

  @Get('history')
  @ApiOperation({ summary: 'Get query history' })
  async getQueryHistory(@Query('userId') userId?: string, @Query('limit') limit = 20) {
    return this.vectorStoreService.getQueryHistory(userId, limit);
  }

  // ============ STATISTICS ============

  @Get('stats')
  @ApiOperation({ summary: 'Get RAG statistics' })
  async getStats() {
    return this.vectorStoreService.getStats();
  }
}
