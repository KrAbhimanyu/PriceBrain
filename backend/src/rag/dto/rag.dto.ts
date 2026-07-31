import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VectorType, VectorStatus } from '../entities/rag.entity';

export class CreateVectorDto {
  @ApiProperty({ enum: VectorType })
  @IsEnum(VectorType)
  entityType: VectorType;

  @ApiProperty()
  @IsString()
  entityId: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metadata?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;
}

export class CreateBulkVectorsDto {
  @ApiProperty({ type: [CreateVectorDto] })
  @IsArray()
  vectors: CreateVectorDto[];
}

export class QueryVectorDto {
  @ApiProperty()
  @IsString()
  query: string;

  @ApiPropertyOptional({ enum: VectorType })
  @IsOptional()
  @IsEnum(VectorType)
  entityType?: VectorType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityTypes?: VectorType[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minSimilarity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collection?: string;
}

export class SemanticSearchDto {
  @ApiProperty()
  @IsString()
  query: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topK?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minSimilarity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  filters?: Record<string, any>[];
}

export class GenerateEmbeddingDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;
}

export class GenerateBulkEmbeddingsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  texts: string[];
}

export class RAGQueryDto {
  @ApiProperty()
  @IsString()
  query: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collection?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxContextLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;
}

export class CreateCollectionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dimensions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  embeddingModel?: string;
}

export class UpdateVectorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metadata?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dimensions?: number;
}

export class ChunkDocumentDto {
  @ApiProperty()
  @IsString()
  documentId: string;

  @ApiProperty()
  @IsString()
  collectionName: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  chunkSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  overlap?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class RAGResponseDto {
  @ApiProperty()
  answer: string;

  @ApiPropertyOptional()
  @IsOptional()
  sources: Array<{
    id: string;
    content: string;
    score: number;
    metadata?: any;
  }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  tokensUsed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  responseTime: number;
}
