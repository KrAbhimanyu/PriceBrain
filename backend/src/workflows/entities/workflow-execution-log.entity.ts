import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkflowInstance } from './workflow-instance.entity';

@Entity('workflow_execution_logs')
export class WorkflowExecutionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'instance_id' })
  instanceId: string;

  @ManyToOne(() => WorkflowInstance)
  @JoinColumn({ name: 'instance_id' })
  instance: WorkflowInstance;

  @Column({ name: 'step_name' })
  stepName: string;

  @Column({ name: 'step_order' })
  stepOrder: number;

  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string;

  @Column({ name: 'input_data', type: 'jsonb', default: {} })
  inputData: Record<string, any>;

  @Column({ name: 'output_data', type: 'jsonb', default: {} })
  outputData: Record<string, any>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
