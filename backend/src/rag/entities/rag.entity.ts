import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';

export enum VectorType {
  PRODUCT = 'product',
  REVIEW = 'review',
  DOCUMENT = 'document',
  KNOWLEDGE = 'knowledge',
  USER_QUERY = 'user_query',
}

export enum VectorStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  INDEXED = 'indexed',
  FAILED = 'failed',
}

@Entity('vector_store')
export class VectorStore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  entityType: VectorType;

  @Column()
  entityId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  metadata: string;

  @Column({ type: 'float', array: true, nullable: true })
  embedding: number[];

  @Column({ type: 'int', default: 1536 })
  dimensions: number;

  @Column({
    type: 'enum',
    enum: VectorStatus,
    default: VectorStatus.PENDING,
  })
  status: VectorStatus;

  @Column({ nullable: true })
  indexedAt: Date;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ default: 0 })
  accessCount: number;

  @Column({ nullable: true })
  lastAccessedAt: Date;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('vector_collections')
export class VectorCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', default: 1536 })
  dimensions: number;

  @Column({ default: 'text-embedding-3-small' })
  embeddingModel: string;

  @Column({ default: 0 })
  documentCount: number;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('query_history')
export class QueryHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'text' })
  query: string;

  @Column({ type: 'float', array: true, nullable: true })
  queryEmbedding: number[];

  @Column({ type: 'jsonb', nullable: true })
  retrievedDocuments: string[];

  @Column({ type: 'jsonb', nullable: true })
  response: Record<string, any>;

  @Column({ default: 0 })
  retrievalCount: number;

  @Column({ default: 0 })
  responseTime: number;

  @Column({ default: true })
  wasHelpful: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('document_chunks')
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentId: string;

  @Column()
  collectionName: string;

  @Column({ type: 'int' })
  chunkIndex: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'float', array: true, nullable: true })
  embedding: number[];

  @Column({ type: 'int', default: 500 })
  chunkSize: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  accessCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
