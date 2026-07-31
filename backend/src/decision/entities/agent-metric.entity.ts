import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('agent_metrics')
export class AgentMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agent_id' })
  agentId: string;

  @Column({ name: 'agent_type' })
  agentType: string;

  @Column({ name: 'metric_name' })
  metricName: string;

  @Column({ name: 'metric_value', type: 'decimal', precision: 15, scale: 4 })
  metricValue: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}
