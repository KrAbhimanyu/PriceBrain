import { IsString, IsOptional, IsArray, IsObject, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiProperty()
  @IsString()
  ruleType: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  ruleText: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isImmutable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnforced?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  exceptions?: Record<string, any>[];
}

export class UpdateRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ruleText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnforced?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  exceptions?: Record<string, any>[];
}

export class QueryRulesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ruleType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnforced?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isImmutable?: boolean;
}

export class CreateViolationDto {
  @ApiProperty()
  @IsString()
  ruleId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  severity: 'low' | 'medium' | 'high' | 'critical';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  violatedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agentInstanceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workflowId?: string;
}

export class QueryViolationsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ruleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  severity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['open', 'investigating', 'resolved'])
  status?: string;
}

export class ResolveViolationDto {
  @ApiProperty()
  @IsString()
  resolution: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolvedBy?: string;
}
