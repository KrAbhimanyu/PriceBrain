import { IsString, IsOptional, IsEnum, IsObject, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalType, ApprovalStatus } from '../../shared/enums/mission.enum';

export class CreateApprovalDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsEnum(ApprovalType)
  type: ApprovalType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  missionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workflowInstanceId?: string;

  @ApiProperty()
  @IsObject()
  actionData: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresVerification?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  verificationMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  expiresInMinutes?: number;
}

export class ApproveDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  verificationCode?: string;
}

export class RejectDto {
  @ApiProperty()
  @IsString()
  reason: string;
}

export class QueryApprovalsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ApprovalType)
  type?: ApprovalType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  missionId?: string;
}
