import { IsString, IsOptional, IsBoolean, IsArray, IsObject, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgentListingDto {
  @ApiProperty()
  @IsString()
  agentId: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  screenshots?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  demoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['free', 'subscription', 'one_time', 'usage'])
  pricingModel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priceCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  supportedPlatforms?: string[];
}

export class UpdateAgentListingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class CreateReviewDto {
  @ApiProperty()
  @IsNumber()
  rating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;
}

export class InstallAgentDto {
  @ApiProperty()
  @IsString()
  marketplaceId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class UpdateInstallationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class QueryListingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featuredOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['free', 'subscription', 'one_time', 'usage'])
  pricingModel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;
}
