import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tool } from './tool.entity';
import { AgentInstance } from '../../kernel/entities/agent-instance.entity';
import { User } from '../../users/entities/user.entity';

export enum InvocationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
}

@Entity('tool_invocations')
export class ToolInvocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tool_id' })
  toolId: string;

  @ManyToOne(() => Tool)
  @JoinColumn({ name: 'tool_id' })
  tool: Tool;

  @Column({ name: 'agent_instance_id', nullable: true })
  agentInstanceId: string;

  @ManyToOne(() => AgentInstance, { nullable: true })
  @JoinColumn({ name: 'agent_instance_id' })
  agentInstance: AgentInstance;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'correlation_id', nullable: true })
  correlationId: string;

  @Column({ name: 'input_data', type: 'jsonb' })
  inputData: Record<string, any>;

  @Column({ name: 'output_data', type: 'jsonb', nullable: true })
  outputData: Record<string, any>;

  @Column({
    type: 'enum',
    enum: InvocationStatus,
    default: InvocationStatus.PENDING,
  })
  status: InvocationStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'execution_time_ms', nullable: true })
  executionTimeMs: number;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
