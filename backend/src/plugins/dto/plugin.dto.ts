import { IsString, IsOptional, IsBoolean, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PluginCategory } from '../../shared/enums/mission.enum';

export class CreatePluginDto {
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

  @ApiProperty({ enum: PluginCategory })
  @IsString()
  category: PluginCategory;

  @ApiProperty()
  @IsObject()
  manifest: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorUrl?: string;
}

export class UpdatePluginDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  manifest?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  permissions?: string[];
}

export class InstallPluginDto {
  @ApiProperty()
  @IsString()
  pluginId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class UpdateUserPluginDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class QueryPluginsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: PluginCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  officialOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
