import { IsString, IsOptional, IsBoolean, IsNumber, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PolicyType } from '../../shared/enums/mission.enum';

export class CreatePolicyDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PolicyType })
  @IsString()
  type: PolicyType;

  @ApiProperty()
  @IsObject()
  conditions: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  actions?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class UpdatePolicyDto {
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
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  actions?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class EvaluateContextDto {
  @ApiProperty()
  @IsObject()
  context: Record<string, any>;
}
