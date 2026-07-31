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
import { User } from '../../users/entities/user.entity';

@Entity('constitution_rules')
export class ConstitutionRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'is_global', default: false })
  isGlobal: boolean;

  @Column({ name: 'rule_type' })
  ruleType: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'rule_text', type: 'text' })
  ruleText: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ name: 'is_immutable', default: false })
  isImmutable: boolean;

  @Column({ name: 'is_enforced', default: true })
  isEnforced: boolean;

  @Column({ type: 'jsonb', default: '[]' })
  exceptions: Record<string, any>[];

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('constitution_violations')
export class ConstitutionViolation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rule_id' })
  ruleId: string;

  @ManyToOne(() => ConstitutionRule)
  @JoinColumn({ name: 'rule_id' })
  rule: ConstitutionRule;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'violated_by', nullable: true })
  violatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'violated_by' })
  violator: User;

  @Column({ name: 'agent_instance_id', nullable: true })
  agentInstanceId: string;

  @Column({ name: 'workflow_id', nullable: true })
  workflowId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'low' })
  severity: string;

  @Column({ default: 'open' })
  status: string;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ name: 'resolved_by', nullable: true })
  resolvedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolved_by' })
  resolver: User;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
