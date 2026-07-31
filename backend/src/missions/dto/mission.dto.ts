import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MissionType, MissionStatus, MissionPriority } from '../../shared/enums/mission.enum';

export class CreateMissionDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: MissionType })
  @IsEnum(MissionType)
  type: MissionType;

  @ApiPropertyOptional({ enum: MissionPriority })
  @IsOptional()
  @IsEnum(MissionPriority)
  priority?: MissionPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  targetBudget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateMissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: MissionStatus })
  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @ApiPropertyOptional({ enum: MissionPriority })
  @IsOptional()
  @IsEnum(MissionPriority)
  priority?: MissionPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  targetBudget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  currentSpent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  progress?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateMissionTaskDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: MissionPriority })
  @IsOptional()
  @IsEnum(MissionPriority)
  priority?: MissionPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedAgent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentTaskId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isArray?: boolean;
  dependencies?: string[];
  tags?: string[];
}

export class UpdateMissionTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: MissionPriority })
  @IsOptional()
  @IsEnum(MissionPriority)
  priority?: MissionPriority;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  actualCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedAgent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isArray?: boolean;
  dependencies?: string[];
  tags?: string[];
}

export class CreateBudgetAllocationDto {
  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsNumber()
  allocatedAmount: number;
}

export class UpdateBudgetAllocationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  allocatedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  spentAmount?: number;
}
