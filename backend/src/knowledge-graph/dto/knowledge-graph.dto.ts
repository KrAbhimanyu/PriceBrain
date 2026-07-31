import { IsString, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityType, RelationType } from '../entities/knowledge-graph.entity';

export class CreateEntityDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: EntityType })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  properties?: Record<string, any>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  aliases?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  popularity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateEntityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  properties?: Record<string, any>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  aliases?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  popularity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  searchCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  viewCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  purchaseCount?: number;
}

export class CreateRelationDto {
  @ApiProperty()
  @IsString()
  sourceEntityId: string;

  @ApiProperty()
  @IsString()
  targetEntityId: string;

  @ApiProperty({ enum: RelationType })
  @IsEnum(RelationType)
  relationType: RelationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  properties?: Record<string, any>;
}

export class UpdateRelationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  properties?: Record<string, any>;
}

export class QueryKnowledgeGraphDto {
  @ApiProperty()
  @IsString()
  query: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minConfidence?: number;
}

export class SearchEntitiesDto {
  @ApiProperty()
  @IsString()
  query: string;

  @ApiPropertyOptional({ enum: EntityType })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  relationTypes?: RelationType[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class GetRelatedEntitiesDto {
  @ApiProperty()
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  relationTypes?: RelationType[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  depth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
