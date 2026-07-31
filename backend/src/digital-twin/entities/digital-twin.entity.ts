import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../enterprise/entities/organization.entity';

@Entity('digital_twins')
export class DigitalTwin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', unique: true })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'model_state', type: 'jsonb', default: '{}' })
  modelState: Record<string, any>;

  @Column({ name: 'sync_status', default: 'synced' })
  syncStatus: string;

  @Column({ name: 'last_sync_at', nullable: true })
  lastSyncAt: Date;

  @Column({ name: 'health_score', type: 'decimal', precision: 5, scale: 2, default: 100 })
  healthScore: number;

  @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore: number;

  @Column({ name: 'performance_score', type: 'decimal', precision: 5, scale: 2, default: 100 })
  performanceScore: number;

  @Column({ type: 'jsonb', default: '{}' })
  metrics: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  configurations: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('twin_components')
export class TwinComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'twin_id' })
  twinId: string;

  @ManyToOne(() => DigitalTwin)
  @JoinColumn({ name: 'twin_id' })
  twin: DigitalTwin;

  @Column({ name: 'component_type' })
  componentType: string;

  @Column({ name: 'component_id' })
  componentId: string;

  @Column({ type: 'jsonb', default: '{}' })
  state: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  metrics: Record<string, any>;

  @Column({ name: 'health_status', default: 'healthy' })
  healthStatus: string;

  @Column({ name: 'last_updated', nullable: true })
  lastUpdated: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('twin_snapshots')
export class TwinSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'twin_id' })
  twinId: string;

  @ManyToOne(() => DigitalTwin)
  @JoinColumn({ name: 'twin_id' })
  twin: DigitalTwin;

  @Column({ name: 'snapshot_data', type: 'jsonb' })
  snapshotData: Record<string, any>;

  @Column({ name: 'health_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  healthScore: number;

  @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  riskScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
