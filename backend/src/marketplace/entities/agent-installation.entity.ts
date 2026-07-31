import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AgentMarketplace } from './agent-marketplace.entity';
import { Agent } from '../../kernel/entities/agent.entity';

@Entity('agent_installations')
@Unique(['marketplaceId', 'userId', 'organizationId'])
export class AgentInstallation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'marketplace_id' })
  marketplaceId: string;

  @ManyToOne(() => AgentMarketplace)
  @JoinColumn({ name: 'marketplace_id' })
  marketplace: AgentMarketplace;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @Column({ name: 'installed_agent_id', nullable: true })
  installedAgentId: string;

  @ManyToOne(() => Agent, { nullable: true })
  @JoinColumn({ name: 'installed_agent_id' })
  installedAgent: Agent;

  @Column()
  version: string;

  @Column({ type: 'jsonb', default: '{}' })
  config: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ['active', 'disabled', 'error', 'update_available'],
    default: 'active',
  })
  status: string;

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
