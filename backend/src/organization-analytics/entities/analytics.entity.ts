import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../enterprise/entities/organization.entity';
import { Department } from '../../enterprise/entities/department.entity';

@Entity('organization_metrics')
export class OrganizationMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'metric_type' })
  metricType: string;

  @Column({ name: 'metric_name' })
  metricName: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'jsonb', default: '{}' })
  dimensions: Record<string, any>;

  @Column({ name: 'recorded_at' })
  recordedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('department_metrics')
export class DepartmentMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'department_id' })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'metric_type' })
  metricType: string;

  @Column({ name: 'metric_name' })
  metricName: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'jsonb', default: '{}' })
  dimensions: Record<string, any>;

  @Column({ name: 'recorded_at' })
  recordedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('collaboration_metrics')
export class CollaborationMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'source_department_id', nullable: true })
  sourceDepartmentId: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'source_department_id' })
  sourceDepartment: Department;

  @Column({ name: 'target_department_id', nullable: true })
  targetDepartmentId: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'target_department_id' })
  targetDepartment: Department;

  @Column({ name: 'collaboration_type' })
  collaborationType: string;

  @Column({ name: 'interaction_count', default: 0 })
  interactionCount: number;

  @Column({ name: 'effectiveness_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  effectivenessScore: number;

  @Column({ name: 'quality_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityScore: number;

  @Column({ name: 'response_time_avg', nullable: true })
  responseTimeAvg: number;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @Column({ name: 'recorded_at' })
  recordedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
