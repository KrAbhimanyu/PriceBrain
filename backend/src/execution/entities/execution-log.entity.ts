import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Mission } from '../../missions/entities/mission.entity';

@Entity('execution_logs')
export class ExecutionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'mission_id', nullable: true })
  missionId: string;

  @ManyToOne(() => Mission, { nullable: true })
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @Column({ name: 'workflow_instance_id', nullable: true })
  workflowInstanceId: string;

  @Column({ name: 'automation_rule_id', nullable: true })
  automationRuleId: string;

  @Column({ name: 'execution_type' })
  executionType: string;

  @Column()
  action: string;

  @Column()
  status: string;

  @Column({ name: 'input_data', type: 'jsonb', default: {} })
  inputData: Record<string, any>;

  @Column({ name: 'output_data', type: 'jsonb', default: {} })
  outputData: Record<string, any>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'risk_level', type: 'varchar', length: 20, default: 'low' })
  riskLevel: string;

  @Column({ name: 'approval_id', nullable: true })
  approvalId: string;

  @Column({ name: 'execution_time_ms', nullable: true })
  executionTimeMs: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
