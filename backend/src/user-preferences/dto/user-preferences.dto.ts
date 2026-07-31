import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Theme, Language, Currency } from '../entities/user-preferences.entity';

export class UpdateThemeDto {
  @ApiProperty({ enum: Theme })
  @IsEnum(Theme)
  theme: Theme;
}

export class UpdateLanguageDto {
  @ApiProperty({ enum: Language })
  @IsEnum(Language)
  language: Language;
}

export class UpdateCurrencyDto {
  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  currency: Currency;
}

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  priceAlerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dealAlerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  orderUpdates?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  promotionalEmails?: boolean;
}

export class UpdateShoppingPreferencesDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteCategories?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteBrands?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shoppingInterests?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredPriceRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  budgetLimit?: number;
}

export class UpdateLocationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultAddressId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultPincode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultState?: string;
}

export class UpdatePrivacyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  profilePublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showWishlistPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowDataCollection?: boolean;
}

export class UpdateAIPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aiRecommendationLevel?: 'minimal' | 'balanced' | 'aggressive';

  @ApiPropertyOptional()
  @IsOptional()
  aiShoppingPersona?: Record<string, any>;
}

export class UpdateAccessibilityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  highContrast?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  screenReader?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reducedMotion?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fontSize?: 'small' | 'medium' | 'large' | 'extra-large';
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: Theme })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiPropertyOptional({ enum: Language })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  pushNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  smsNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  priceAlerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  dealAlerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  orderUpdates?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  favoriteCategories?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  favoriteBrands?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  shoppingInterests?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  budgetLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  profilePublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showWishlistPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aiRecommendationLevel?: 'minimal' | 'balanced' | 'aggressive';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  highContrast?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  screenReader?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fontSize?: 'small' | 'medium' | 'large' | 'extra-large';
}
