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

@Entity('monitoring_metrics')
export class MonitoringMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'mission_id', nullable: true })
  missionId: string;

  @ManyToOne(() => Mission, { nullable: true })
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @Column({ name: 'metric_type' })
  metricType: string;

  @Column({ name: 'metric_name' })
  metricName: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}
