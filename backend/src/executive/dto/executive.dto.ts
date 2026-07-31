import { IsString, IsOptional, IsArray, IsObject, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChiefAIDto {
  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty()
  @IsString()
  agentId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  responsibilities?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  strategicGoals?: string[];
}

export class UpdateChiefAIDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  responsibilities?: string[];

  @ApiPropertyOptional()
  @IsArray()
  strategicGoals?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  performanceMetrics?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  keyDecisions?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  isActive?: number;
}

export class CreateDecisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chiefAiId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty()
  @IsString()
  decisionType: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rationale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  alternatives?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  riskLevel?: string;
}

export class UpdateDecisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  outcome?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'implemented'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class QueryDecisionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  decisionType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  riskLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;
}
