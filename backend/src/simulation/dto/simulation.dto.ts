import { IsString, IsOptional, IsObject, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSimulationDto {
  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty()
  @IsString()
  simulationType: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsObject()
  parameters: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  initialState?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  iterations?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  confidenceLevel?: number;
}

export class UpdateSimulationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  results?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  predictions?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  risks?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  alternatives?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  successProbability?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  expectedCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expectedTimeline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class QuerySimulationsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  simulationType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateScenarioDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsObject()
  scenarioData: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  probability?: number;
}
