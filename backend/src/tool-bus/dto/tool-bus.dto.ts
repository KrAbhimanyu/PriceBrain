import { IsString, IsOptional, IsBoolean, IsArray, IsObject, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateToolDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsString()
  version: string;

  @ApiProperty()
  @IsObject()
  inputSchema: Record<string, any>;

  @ApiProperty()
  @IsObject()
  outputSchema: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rateLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  timeoutMs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAsync?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  handlerPath?: string;
}

export class UpdateToolDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  inputSchema?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  outputSchema?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rateLimit?: number;

  @ApiPropertyOptional()
  @IsNumber()
  timeoutMs?: number;
}

export class InvokeToolDto {
  @ApiProperty()
  @IsObject()
  input: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agentInstanceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correlationId?: string;
}

export class QueryToolsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  systemOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
