import { IsString, IsOptional, IsBoolean, IsArray, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgentStatus, HealthStatus } from '../entities/agent.entity';
import { InstanceStatus } from '../entities/agent-instance.entity';

export class CreateAgentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  version: string;

  @ApiProperty()
  @IsString()
  agentType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  capabilities?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  dependencies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class UpdateAgentDto {
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
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AgentStatus)
  status?: AgentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMarketplace?: boolean;
}

export class StartAgentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  missionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  input?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  resources?: Record<string, any>;
}

export class UpdateAgentStateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  state?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  resources?: Record<string, any>;
}

export class QueryAgentsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AgentStatus)
  status?: AgentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketplaceOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  systemOnly?: boolean;
}

export class KernelHealthDto {
  @ApiProperty()
  @IsString()
  component: string;

  @ApiProperty()
  @IsEnum(HealthStatus)
  status: HealthStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}

export class KernelMetricsDto {
  @ApiProperty()
  @IsString()
  metricType: string;

  @ApiProperty()
  @IsString()
  metricName: string;

  @ApiProperty()
  @IsObject()
  value: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  dimensions?: Record<string, any>;
}
