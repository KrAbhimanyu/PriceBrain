import { IsString, IsOptional, IsArray, IsObject, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePolicyDto {
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
  policyType: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  rules?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['advisory', 'enforcing', 'strict'])
  enforcementLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  complianceRequirements?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  auditFrequency?: string;
}

export class UpdatePolicyDto {
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
  @IsArray()
  rules?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['advisory', 'enforcing', 'strict'])
  enforcementLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  complianceRequirements?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  auditFrequency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateAuditDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty()
  @IsString()
  auditType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  auditorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  auditPeriodStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  auditPeriodEnd?: string;
}

export class CompleteAuditDto {
  @ApiProperty()
  @IsArray()
  findings: Record<string, any>[];

  @ApiProperty()
  @IsArray()
  violations: Record<string, any>[];

  @ApiProperty()
  @IsArray()
  recommendations: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  complianceScore?: number;
}

export class GenerateReportDto {
  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty()
  @IsString()
  reportType: string;
}
