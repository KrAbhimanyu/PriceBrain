import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  type: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'is_template', default: false })
  isTemplate: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'trigger_config', type: 'jsonb' })
  triggerConfig: Record<string, any>;

  @Column({ name: 'steps_config', type: 'jsonb' })
  stepsConfig: Record<string, any>;

  @Column({ name: 'error_handling', type: 'jsonb', default: {} })
  errorHandling: Record<string, any>;

  @Column({ name: 'timeout_seconds', default: 3600 })
  timeoutSeconds: number;

  @Column({ name: 'retry_config', type: 'jsonb', default: { maxRetries: 3, backoffMultiplier: 2 } })
  retryConfig: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
