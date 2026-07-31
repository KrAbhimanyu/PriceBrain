import { Controller, Get, Put, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPreferencesService } from './user-preferences.service';
import {
  UpdatePreferencesDto,
  UpdateNotificationSettingsDto,
  UpdateShoppingPreferencesDto,
  UpdateLocationDto,
  UpdatePrivacyDto,
  UpdateAIPreferencesDto,
  UpdateAccessibilityDto,
} from './dto/user-preferences.dto';
import { Theme, Language, Currency } from './entities/user-preferences.entity';

@ApiTags('User Preferences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('preferences')
export class UserPreferencesController {
  constructor(private readonly preferencesService: UserPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user preferences' })
  async getPreferences(@Request() req: any) {
    return this.preferencesService.getPreferences(req.user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get preferences summary' })
  async getPreferencesSummary(@Request() req: any) {
    return this.preferencesService.getPreferencesSummary(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update all preferences' })
  async updatePreferences(@Request() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.preferencesService.updatePreferences(req.user.id, dto);
  }

  // Theme
  @Patch('theme')
  @ApiOperation({ summary: 'Update theme' })
  async updateTheme(@Request() req: any, @Body('theme') theme: Theme) {
    return this.preferencesService.updateTheme(req.user.id, theme);
  }

  // Language
  @Patch('language')
  @ApiOperation({ summary: 'Update language' })
  async updateLanguage(@Request() req: any, @Body('language') language: Language) {
    return this.preferencesService.updateLanguage(req.user.id, language);
  }

  // Currency
  @Patch('currency')
  @ApiOperation({ summary: 'Update currency' })
  async updateCurrency(@Request() req: any, @Body('currency') currency: Currency) {
    return this.preferencesService.updateCurrency(req.user.id, currency);
  }

  // Notifications
  @Patch('notifications')
  @ApiOperation({ summary: 'Update notification settings' })
  async updateNotifications(@Request() req: any, @Body() dto: UpdateNotificationSettingsDto) {
    return this.preferencesService.updateNotificationSettings(req.user.id, dto);
  }

  // Shopping
  @Patch('shopping')
  @ApiOperation({ summary: 'Update shopping preferences' })
  async updateShopping(@Request() req: any, @Body() dto: UpdateShoppingPreferencesDto) {
    return this.preferencesService.updateShoppingPreferences(req.user.id, dto);
  }

  // Location
  @Patch('location')
  @ApiOperation({ summary: 'Update location settings' })
  async updateLocation(@Request() req: any, @Body() dto: UpdateLocationDto) {
    return this.preferencesService.updateLocation(req.user.id, dto);
  }

  // Privacy
  @Patch('privacy')
  @ApiOperation({ summary: 'Update privacy settings' })
  async updatePrivacy(@Request() req: any, @Body() dto: UpdatePrivacyDto) {
    return this.preferencesService.updatePrivacy(req.user.id, dto);
  }

  // AI Preferences
  @Patch('ai')
  @ApiOperation({ summary: 'Update AI preferences' })
  async updateAI(@Request() req: any, @Body() dto: UpdateAIPreferencesDto) {
    return this.preferencesService.updateAIPreferences(req.user.id, dto);
  }

  // Accessibility
  @Patch('accessibility')
  @ApiOperation({ summary: 'Update accessibility settings' })
  async updateAccessibility(@Request() req: any, @Body() dto: UpdateAccessibilityDto) {
    return this.preferencesService.updateAccessibility(req.user.id, dto);
  }

  // Favorite Categories
  @Post('categories/:categoryId')
  @ApiOperation({ summary: 'Add favorite category' })
  async addFavoriteCategory(@Request() req: any, @Param('categoryId') categoryId: string) {
    return this.preferencesService.addFavoriteCategory(req.user.id, categoryId);
  }

  @Delete('categories/:categoryId')
  @ApiOperation({ summary: 'Remove favorite category' })
  async removeFavoriteCategory(@Request() req: any, @Param('categoryId') categoryId: string) {
    return this.preferencesService.removeFavoriteCategory(req.user.id, categoryId);
  }

  // Favorite Brands
  @Post('brands/:brandId')
  @ApiOperation({ summary: 'Add favorite brand' })
  async addFavoriteBrand(@Request() req: any, @Param('brandId') brandId: string) {
    return this.preferencesService.addFavoriteBrand(req.user.id, brandId);
  }

  @Delete('brands/:brandId')
  @ApiOperation({ summary: 'Remove favorite brand' })
  async removeFavoriteBrand(@Request() req: any, @Param('brandId') brandId: string) {
    return this.preferencesService.removeFavoriteBrand(req.user.id, brandId);
  }

  @Delete()
  @ApiOperation({ summary: 'Reset preferences to defaults' })
  async deletePreferences(@Request() req: any) {
    await this.preferencesService.deletePreferences(req.user.id);
    return { success: true };
  }
}

import { Post } from '@nestjs/common';
