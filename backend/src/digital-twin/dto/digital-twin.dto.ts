import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDigitalTwinDto {
  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  configurations?: Record<string, any>;
}

export class UpdateDigitalTwinDto {
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
  modelState?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  configurations?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metrics?: Record<string, any>;
}

export class UpdateTwinComponentDto {
  @ApiProperty()
  @IsObject()
  state: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metrics?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  healthStatus?: string;
}

export class SyncDigitalTwinDto {
  @ApiProperty()
  @IsArray()
  components: {
    componentType: string;
    componentId: string;
    state: Record<string, any>;
    metrics?: Record<string, any>;
  }[];
}
