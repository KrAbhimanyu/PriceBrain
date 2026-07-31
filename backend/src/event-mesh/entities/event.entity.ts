import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum EventStatus {
  PUBLISHED = 'published',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  DEAD_LETTER = 'dead_letter',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'event_type' })
  eventType: string;

  @Index()
  @Column()
  source: string;

  @Column({ name: 'source_id', nullable: true })
  sourceId: string;

  @Index()
  @Column({ name: 'correlation_id', nullable: true })
  correlationId: string;

  @Column({ name: 'causation_id', nullable: true })
  causationId: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @Index()
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PUBLISHED,
  })
  status: EventStatus;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', default: 3 })
  maxRetries: number;

  @Column({ name: 'processed_at', nullable: true })
  processedAt: Date;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'published_at' })
  publishedAt: Date;
}
