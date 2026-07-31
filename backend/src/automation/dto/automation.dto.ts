import { IsString, IsOptional, IsEnum, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutomationRuleType, AutomationStatus } from '../../shared/enums/mission.enum';

export class CreateAutomationRuleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AutomationRuleType })
  @IsEnum(AutomationRuleType)
  type: AutomationRuleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  missionId?: string;

  @ApiProperty()
  @IsObject()
  triggerConfig: Record<string, any>;

  @ApiProperty()
  @IsObject()
  actionConfig: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  conditions?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  scheduleConfig?: Record<string, any>;
}

export class UpdateAutomationRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: AutomationStatus })
  @IsOptional()
  @IsEnum(AutomationStatus)
  status?: AutomationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  actionConfig?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  conditions?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  scheduleConfig?: Record<string, any>;
}

export class TriggerAutomationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  triggerData?: Record<string, any>;
}
