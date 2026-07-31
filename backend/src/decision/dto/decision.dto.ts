import { IsString, IsOptional, IsNumber, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductDecisionDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsObject()
  productData: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  missionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  context?: string;
}

export class PurchaseDecisionDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  retailerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  missionId?: string;
}

export class CompareDecisionDto {
  @ApiProperty()
  @IsArray()
  productIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  decisionCriteria?: string;
}

export class RecommendDecisionDto {
  @ApiProperty()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  missionId?: string;
}

export class RecordAgentMetricDto {
  @ApiProperty()
  @IsString()
  agentId: string;

  @ApiProperty()
  @IsString()
  agentType: string;

  @ApiProperty()
  @IsString()
  metricName: string;

  @ApiProperty()
  @IsNumber()
  metricValue: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
