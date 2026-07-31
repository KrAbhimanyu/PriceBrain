import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EndpointType {
  WEBHOOK = 'webhook',
  QUEUE = 'queue',
  FUNCTION = 'function',
  EMAIL = 'email',
}

@Entity('event_subscriptions')
export class EventSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @Column()
  name: string;

  @Column({ name: 'event_pattern' })
  eventPattern: string;

  @Column({ name: 'event_types', type: 'jsonb', default: '[]' })
  eventTypes: string[];

  @Column({ name: 'filter_expression', type: 'text', nullable: true })
  filterExpression: string;

  @Column({ name: 'endpoint_url', nullable: true })
  endpointUrl: string;

  @Column({
    name: 'endpoint_type',
    type: 'enum',
    enum: EndpointType,
    default: EndpointType.WEBHOOK,
  })
  endpointType: EndpointType;

  @Column({ type: 'jsonb', default: '{}' })
  headers: Record<string, string>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
