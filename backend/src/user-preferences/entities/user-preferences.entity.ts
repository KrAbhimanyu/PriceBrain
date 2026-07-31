import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum Language {
  EN = 'en',
  HINDI = 'hi',
  TAMIL = 'ta',
  TELUGU = 'te',
  BENGALI = 'bn',
  MARATHI = 'mr',
  KANNADA = 'kn',
  MALAYALAM = 'ml',
}

export enum Currency {
  INR = 'INR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  // Theme Settings
  @Column({
    type: 'enum',
    enum: Theme,
    default: Theme.SYSTEM,
  })
  theme: Theme;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.EN,
  })
  language: Language;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.INR,
  })
  currency: Currency;

  // Notification Settings
  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  pushNotifications: boolean;

  @Column({ default: true })
  smsNotifications: boolean;

  @Column({ default: true })
  priceAlerts: boolean;

  @Column({ default: true })
  dealAlerts: boolean;

  @Column({ default: true })
  orderUpdates: boolean;

  @Column({ default: true })
  promotionalEmails: boolean;

  // Shopping Preferences
  @Column({ type: 'jsonb', nullable: true })
  favoriteCategories: string[];

  @Column({ type: 'jsonb', nullable: true })
  favoriteBrands: string[];

  @Column({ type: 'jsonb', nullable: true })
  shoppingInterests: string[];

  @Column({ nullable: true })
  preferredPriceRange: string; // e.g., "₹500-₹5000"

  @Column({ nullable: true })
  budgetLimit: number;

  // Location
  @Column({ nullable: true })
  defaultAddressId: string;

  @Column({ nullable: true })
  defaultPincode: string;

  @Column({ nullable: true })
  defaultCity: string;

  @Column({ nullable: true })
  defaultState: string;

  // Privacy
  @Column({ default: false })
  profilePublic: boolean;

  @Column({ default: false })
  showWishlistPublic: boolean;

  @Column({ default: true })
  allowDataCollection: boolean;

  // AI Preferences
  @Column({ default: 'balanced' })
  aiRecommendationLevel: 'minimal' | 'balanced' | 'aggressive';

  @Column({ type: 'jsonb', nullable: true })
  aiShoppingPersona: Record<string, any>;

  // Accessibility
  @Column({ default: false })
  highContrast: boolean;

  @Column({ default: false })
  screenReader: boolean;

  @Column({ default: false })
  reducedMotion: boolean;

  @Column({ nullable: true })
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
