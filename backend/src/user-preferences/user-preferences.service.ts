import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserPreferences, Theme, Language, Currency } from './entities/user-preferences.entity';
import {
  UpdatePreferencesDto,
  UpdateNotificationSettingsDto,
  UpdateShoppingPreferencesDto,
  UpdateLocationDto,
  UpdatePrivacyDto,
  UpdateAIPreferencesDto,
  UpdateAccessibilityDto,
} from './dto/user-preferences.dto';

@Injectable()
export class UserPreferencesService {
  private readonly logger = new Logger(UserPreferencesService.name);

  constructor(
    @InjectRepository(UserPreferences)
    private preferencesRepo: Repository<UserPreferences>,
    private eventEmitter: EventEmitter2,
  ) {}

  async getOrCreatePreferences(userId: string): Promise<UserPreferences> {
    let preferences = await this.preferencesRepo.findOne({ where: { userId } });

    if (!preferences) {
      preferences = this.preferencesRepo.create({
        userId,
        theme: Theme.SYSTEM,
        language: Language.EN,
        currency: Currency.INR,
      });
      preferences = await this.preferencesRepo.save(preferences);
      this.logger.log(`Created preferences for user: ${userId}`);
    }

    return preferences;
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    return this.getOrCreatePreferences(userId);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    Object.assign(preferences, dto);
    const saved = await this.preferencesRepo.save(preferences);
    
    this.eventEmitter.emit('preferences.updated', { userId, changes: Object.keys(dto) });
    
    return saved;
  }

  async updateTheme(userId: string, theme: Theme): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    preferences.theme = theme;
    const saved = await this.preferencesRepo.save(preferences);
    
    this.eventEmitter.emit('preferences.theme_changed', { userId, theme });
    
    return saved;
  }

  async updateLanguage(userId: string, language: Language): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    preferences.language = language;
    const saved = await this.preferencesRepo.save(preferences);
    
    this.eventEmitter.emit('preferences.language_changed', { userId, language });
    
    return saved;
  }

  async updateCurrency(userId: string, currency: Currency): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    preferences.currency = currency;
    const saved = await this.preferencesRepo.save(preferences);
    
    this.eventEmitter.emit('preferences.currency_changed', { userId, currency });
    
    return saved;
  }

  async updateNotificationSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    Object.assign(preferences, dto);
    const saved = await this.preferencesRepo.save(preferences);
    
    this.eventEmitter.emit('preferences.notifications_updated', { userId });
    
    return saved;
  }

  async updateShoppingPreferences(
    userId: string,
    dto: UpdateShoppingPreferencesDto,
  ): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    Object.assign(preferences, dto);
    const saved = await this.preferencesRepo.save(preferences);
    
    this.eventEmitter.emit('preferences.shopping_updated', { userId });
    
    return saved;
  }

  async updateLocation(userId: string, dto: UpdateLocationDto): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    Object.assign(preferences, dto);
    const saved = await this.preferencesRepo.save(preferences);
    
    this.eventEmitter.emit('preferences.location_updated', { userId });
    
    return saved;
  }

  async updatePrivacy(userId: string, dto: UpdatePrivacyDto): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    Object.assign(preferences, dto);
    const saved = await this.preferencesRepo.save(preferences);
    
    this.eventEmitter.emit('preferences.privacy_updated', { userId });
    
    return saved;
  }

  async updateAIPreferences(
    userId: string,
    dto: UpdateAIPreferencesDto,
  ): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    Object.assign(preferences, dto);
    const saved = await this.preferencesRepo.save(preferences);
    
    this.eventEmitter.emit('preferences.ai_updated', { userId });
    
    return saved;
  }

  async updateAccessibility(
    userId: string,
    dto: UpdateAccessibilityDto,
  ): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    Object.assign(preferences, dto);
    const saved = await this.preferencesRepo.save(preferences);
    
    this.eventEmitter.emit('preferences.accessibility_updated', { userId });
    
    return saved;
  }

  async addFavoriteCategory(userId: string, categoryId: string): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    if (!preferences.favoriteCategories) {
      preferences.favoriteCategories = [];
    }
    
    if (!preferences.favoriteCategories.includes(categoryId)) {
      preferences.favoriteCategories.push(categoryId);
      const saved = await this.preferencesRepo.save(preferences);
      this.eventEmitter.emit('preferences.category_added', { userId, categoryId });
      return saved;
    }
    
    return preferences;
  }

  async removeFavoriteCategory(userId: string, categoryId: string): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    if (preferences.favoriteCategories) {
      preferences.favoriteCategories = preferences.favoriteCategories.filter(
        (c) => c !== categoryId,
      );
      const saved = await this.preferencesRepo.save(preferences);
      this.eventEmitter.emit('preferences.category_removed', { userId, categoryId });
      return saved;
    }
    
    return preferences;
  }

  async addFavoriteBrand(userId: string, brandId: string): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    if (!preferences.favoriteBrands) {
      preferences.favoriteBrands = [];
    }
    
    if (!preferences.favoriteBrands.includes(brandId)) {
      preferences.favoriteBrands.push(brandId);
      const saved = await this.preferencesRepo.save(preferences);
      this.eventEmitter.emit('preferences.brand_added', { userId, brandId });
      return saved;
    }
    
    return preferences;
  }

  async removeFavoriteBrand(userId: string, brandId: string): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    if (preferences.favoriteBrands) {
      preferences.favoriteBrands = preferences.favoriteBrands.filter(
        (b) => b !== brandId,
      );
      const saved = await this.preferencesRepo.save(preferences);
      this.eventEmitter.emit('preferences.brand_removed', { userId, brandId });
      return saved;
    }
    
    return preferences;
  }

  async deletePreferences(userId: string): Promise<void> {
    await this.preferencesRepo.delete({ userId });
    this.logger.log(`Deleted preferences for user: ${userId}`);
  }

  async getPreferencesSummary(userId: string): Promise<Record<string, any>> {
    const preferences = await this.getOrCreatePreferences(userId);
    
    return {
      userId,
      theme: preferences.theme,
      language: preferences.language,
      currency: preferences.currency,
      notificationsEnabled: {
        email: preferences.emailNotifications,
        push: preferences.pushNotifications,
        sms: preferences.smsNotifications,
      },
      favoriteCategoriesCount: preferences.favoriteCategories?.length || 0,
      favoriteBrandsCount: preferences.favoriteBrands?.length || 0,
      aiLevel: preferences.aiRecommendationLevel,
      accessibility: {
        highContrast: preferences.highContrast,
        screenReader: preferences.screenReader,
        fontSize: preferences.fontSize,
      },
      privacy: {
        profilePublic: preferences.profilePublic,
        wishlistPublic: preferences.showWishlistPublic,
      },
    };
  }
}
