import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../enterprise/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

@Entity('governance_policies')
export class GovernancePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'is_global', default: false })
  isGlobal: boolean;

  @Column({ name: 'policy_type' })
  policyType: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: '[]' })
  rules: Record<string, any>[];

  @Column({ name: 'enforcement_level', default: 'advisory' })
  enforcementLevel: string;

  @Column({ name: 'compliance_requirements', type: 'jsonb', default: '[]' })
  complianceRequirements: Record<string, any>[];

  @Column({ name: 'audit_frequency', nullable: true })
  auditFrequency: string;

  @Column({ name: 'last_audit_at', nullable: true })
  lastAuditAt: Date;

  @Column({ name: 'next_audit_at', nullable: true })
  nextAuditAt: Date;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('governance_audits')
export class GovernanceAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'policy_id', nullable: true })
  policyId: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'audit_type' })
  auditType: string;

  @Column({ type: 'jsonb', default: '[]' })
  findings: Record<string, any>[];

  @Column({ type: 'jsonb', default: '[]' })
  violations: Record<string, any>[];

  @Column({ type: 'jsonb', default: '[]' })
  recommendations: Record<string, any>[];

  @Column({ name: 'overall_status', default: 'pending' })
  overallStatus: string;

  @Column({ name: 'compliance_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  complianceScore: number;

  @Column({ name: 'auditor_id', nullable: true })
  auditorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'auditor_id' })
  auditor: User;

  @Column({ name: 'audit_period_start', nullable: true })
  auditPeriodStart: Date;

  @Column({ name: 'audit_period_end', nullable: true })
  auditPeriodEnd: Date;

  @Column({ name: 'report_url', nullable: true })
  reportUrl: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('governance_reports')
export class GovernanceReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'report_type' })
  reportType: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'jsonb', default: '[]' })
  findings: Record<string, any>[];

  @Column({ type: 'jsonb', default: '{}' })
  metrics: Record<string, any>;

  @Column({ type: 'jsonb', default: '[]' })
  recommendations: Record<string, any>[];

  @Column({ default: 'draft' })
  status: string;

  @Column({ name: 'generated_by', nullable: true })
  generatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'generated_by' })
  generator: User;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({ name: 'published_at', nullable: true })
  publishedAt: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
