import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum LifeStage {
  CHILD = 'child',
  TEENAGER = 'teenager',
  YOUNG_ADULT = 'young_adult',
  ADULT = 'adult',
  MIDDLE_AGE = 'middle_age',
  SENIOR = 'senior',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum BodyType {
  SLIM = 'slim',
  ATHLETIC = 'athletic',
  AVERAGE = 'average',
  HEAVY = 'heavy',
  PLUS_SIZE = 'plus_size',
}

export enum SkinTone {
  FAIR = 'fair',
  LIGHT = 'light',
  MEDIUM = 'medium',
  TAN = 'tan',
  DARK = 'dark',
}

@Entity('askbrain_user_context')
@Index(['userId'])
export class AskBrainUserContext {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  // Basic Info
  @Column({ nullable: true })
  age: number;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ nullable: true })
  profession: string;

  @Column({ type: 'enum', enum: LifeStage, nullable: true })
  lifeStage: LifeStage;

  // Physical Attributes
  @Column({ type: 'enum', enum: BodyType, nullable: true })
  bodyType: BodyType;

  @Column({ type: 'enum', enum: SkinTone, nullable: true })
  skinTone: SkinTone;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  shoeSize: string;

  @Column({ nullable: true })
  shirtSize: string;

  @Column({ nullable: true })
  pantSize: string;

  @Column({ nullable: true })
  dressSize: string;

  // Location & Environment
  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  climate: string;

  @Column({ nullable: true })
  season: string;

  // Family
  @Column({ type: 'jsonb', nullable: true })
  familyMembers: {
    relation: string;
    age?: number;
    count?: number;
  }[];

  @Column({ nullable: true })
  maritalStatus: string;

  @Column({ nullable: true })
  childrenCount: number;

  // Preferences
  @Column({ type: 'jsonb', nullable: true })
  colorPreferences: string[];

  @Column({ type: 'jsonb', nullable: true })
  stylePreferences: string[];

  @Column({ type: 'jsonb', nullable: true })
  preferredBrands: string[];

  @Column({ type: 'jsonb', nullable: true })
  dislikedBrands: string[];

  @Column({ type: 'jsonb', nullable: true })
  dietaryRestrictions: string[];

  @Column({ type: 'jsonb', nullable: true })
  healthPreferences: string[];

  @Column({ nullable: true })
  sustainabilityPreference: boolean;

  // Financial
  @Column({ type: 'float', nullable: true })
  monthlyBudget: number;

  @Column({ type: 'float', nullable: true })
  shoppingBudget: number;

  @Column({ nullable: true })
  riskTolerance: 'low' | 'medium' | 'high';

  // Lifestyle
  @Column({ type: 'jsonb', nullable: true })
  hobbies: string[];

  @Column({ type: 'jsonb', nullable: true })
  interests: string[];

  @Column({ type: 'jsonb', nullable: true })
  activities: string[];

  @Column({ nullable: true })
  dressCode: string;

  @Column({ nullable: true })
  workEnvironment: string;

  // Current Situation
  @Column({ nullable: true })
  currentGoal: string;

  @Column({ nullable: true })
  upcomingEvent: string;

  @Column({ nullable: true })
  eventDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  lifeEvents: {
    type: string;
    date: Date;
    description: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  travelPlans: {
    destination: string;
    date: Date;
    duration: string;
    purpose: string;
  }[];

  @Column({ nullable: true })
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('askbrain_user_profile')
export class AskBrainUserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'jsonb', nullable: true })
  personalityTraits: string[];

  @Column({ type: 'jsonb', nullable: true })
  shoppingPersonality: {
    type: string;
    description: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  lifestyleProfile: {
    category: string;
    score: number;
  }[];

  @Column({ type: 'int', default: 0 })
  totalPurchases: number;

  @Column({ type: 'float', default: 0 })
  totalSpent: number;

  @Column({ type: 'float', default: 0 })
  moneySaved: number;

  @Column({ type: 'int', default: 0 })
  itemsReturned: number;

  @Column({ type: 'float', default: 0 })
  avgSatisfactionScore: number;

  @Column({ type: 'int', default: 0 })
  buyerRegretCount: number;

  @Column({ type: 'jsonb', nullable: true })
  expertise: string[];

  @Column({ type: 'jsonb', nullable: true })
  certifications: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
