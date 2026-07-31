import { IsString, IsOptional, IsBoolean, IsNumber, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkflowDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiProperty()
  @IsObject()
  triggerConfig: Record<string, any>;

  @ApiProperty()
  @IsObject()
  stepsConfig: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  errorHandling?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  timeoutSeconds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  retryConfig?: Record<string, any>;
}

export class UpdateWorkflowDto {
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
  triggerConfig?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  stepsConfig?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  errorHandling?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  timeoutSeconds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  retryConfig?: Record<string, any>;
}

export class TriggerWorkflowDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  missionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  inputData?: Record<string, any>;
}

export class WorkflowStepResultDto {
  @ApiProperty()
  @IsString()
  stepName: string;

  @ApiProperty()
  @IsObject()
  result: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  error?: string;
}
