import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  RUNNING = 'running',
  PAUSED = 'paused',
  ERROR = 'error',
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  version: string;

  @Column({ name: 'agent_type' })
  agentType: string;

  @Column({ type: 'jsonb', default: '[]' })
  capabilities: string[];

  @Column({ type: 'jsonb', default: '[]' })
  permissions: string[];

  @Column({ type: 'jsonb', default: '{}' })
  config: Record<string, any>;

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.INACTIVE,
  })
  status: AgentStatus;

  @Column({
    name: 'health_status',
    type: 'enum',
    enum: HealthStatus,
    default: HealthStatus.UNKNOWN,
  })
  healthStatus: HealthStatus;

  @Column({ name: 'health_checks', type: 'jsonb', default: {
    lastCheck: null,
    failures: 0
  }})
  healthChecks: Record<string, any>;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({ name: 'is_marketplace', default: false })
  isMarketplace: boolean;

  @Column({ name: 'marketplace_id', nullable: true })
  marketplaceId: string;

  @Column({ name: 'parent_agent_id', nullable: true })
  parentAgentId: string;

  @Column({ type: 'jsonb', default: '[]' })
  dependencies: string[];

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
