import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EntityType {
  PRODUCT = 'product',
  BRAND = 'brand',
  CATEGORY = 'category',
  USER = 'user',
  SELLER = 'seller',
  KEYWORD = 'keyword',
  TREND = 'trend',
  PRICE_RANGE = 'price_range',
  FEATURE = 'feature',
  REVIEW = 'review',
  QUERY = 'query',
  CONCEPT = 'concept',
  TOPIC = 'topic',
  INTENT = 'intent',
}

export enum RelationType {
  BELONGS_TO = 'belongs_to',
  PART_OF = 'part_of',
  SIMILAR_TO = 'similar_to',
  COMPARABLE_TO = 'comparable_to',
  ALTERNATIVE_TO = 'alternative_to',
  REPLACEMENT_FOR = 'replacement_for',
  ACCESSORY_OF = 'accessory_of',
  COMPATIBLE_WITH = 'compatible_with',
  RELATED_TO = 'related_to',
  OF_BRAND = 'of_brand',
  IN_CATEGORY = 'in_category',
  HAS_FEATURE = 'has_feature',
  PRICED_AT = 'priced_at',
  REVIEWED_BY = 'reviewed_by',
  SEARCHED_FOR = 'searched_for',
  VIEWED_AFTER = 'viewed_after',
  BOUGHT_TOGETHER = 'bought_together',
  ALSO_BOUGHT = 'also_bought',
  TRENDING_AS = 'trending_as',
  PREFERED_BY = 'preferred_by',
  RECOMMENDED_FOR = 'recommended_for',
  SATISFIES = 'satisfies',
}

@Entity('knowledge_graph_entities')
@Index(['entityType', 'name'])
@Index(['entityType', 'popularity'])
export class KnowledgeGraphEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column({
    type: 'enum',
    enum: EntityType,
  })
  @Index()
  entityType: EntityType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  aliases: string[];

  @Column({ default: 0 })
  popularity: number;

  @Column({ default: 0 })
  searchCount: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  purchaseCount: number;

  @Column({ type: 'jsonb', nullable: true })
  embeddings: number[];

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  externalId: string;

  @Column({ nullable: true })
  source: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: 1.0 })
  confidence: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('knowledge_graph_relations')
@Index(['sourceEntityId', 'targetEntityId'])
@Index(['relationType'])
export class KnowledgeGraphRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sourceEntityId: string;

  @ManyToOne(() => KnowledgeGraphEntity)
  @JoinColumn({ name: 'sourceEntityId' })
  sourceEntity: KnowledgeGraphEntity;

  @Column()
  targetEntityId: string;

  @ManyToOne(() => KnowledgeGraphEntity)
  @JoinColumn({ name: 'targetEntityId' })
  targetEntity: KnowledgeGraphEntity;

  @Column({
    type: 'enum',
    enum: RelationType,
  })
  @Index()
  relationType: RelationType;

  @Column({ default: 1.0 })
  weight: number;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  evidence: Record<string, any>[];

  @Column({ default: 0 })
  usageCount: number;

  @Column({ default: 1.0 })
  confidence: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('knowledge_graph_queries')
export class KnowledgeGraphQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'text' })
  query: string;

  @Column({ type: 'jsonb', nullable: true })
  parsedQuery: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  results: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  entities: string[];

  @Column({ nullable: true })
  intent: string;

  @Column({ default: 0 })
  resultCount: number;

  @Column({ default: 0 })
  responseTime: number;

  @Column({ default: true })
  isSuccessful: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

import { ManyToOne, JoinColumn } from 'typeorm';
