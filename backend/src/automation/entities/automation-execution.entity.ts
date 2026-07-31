import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AutomationRule } from './automation-rule.entity';

@Entity('automation_executions')
export class AutomationExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rule_id' })
  ruleId: string;

  @ManyToOne(() => AutomationRule)
  @JoinColumn({ name: 'rule_id' })
  rule: AutomationRule;

  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string;

  @Column({ name: 'trigger_data', type: 'jsonb', default: {} })
  triggerData: Record<string, any>;

  @Column({ name: 'result_data', type: 'jsonb', default: {} })
  resultData: Record<string, any>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'executed_at', nullable: true })
  executedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
