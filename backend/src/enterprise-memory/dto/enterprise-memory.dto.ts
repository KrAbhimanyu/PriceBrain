import { IsString, IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMemoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty()
  @IsString()
  memoryType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  importance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['public', 'organization', 'department', 'private'])
  accessibility?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateMemoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  importance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['public', 'organization', 'department', 'private'])
  accessibility?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class QueryMemoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  memoryType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['public', 'organization', 'department', 'private'])
  accessibility?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class CreateAssociationDto {
  @ApiProperty()
  @IsString()
  memoryId: string;

  @ApiProperty()
  @IsString()
  associatedId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  associationType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  strength?: number;
}

export class LearnFromOutcomeDto {
  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  lessonsLearned?: string[];
}
