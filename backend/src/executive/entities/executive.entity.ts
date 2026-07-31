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
import { Department } from '../../enterprise/entities/department.entity';
import { Agent } from '../../kernel/entities/agent.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chief_ai_agents')
export class ChiefAIAgent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'agent_id' })
  agentId: string;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column()
  name: string;

  @Column({ default: 'Chief AI Officer' })
  title: string;

  @Column({ type: 'jsonb', default: '[]' })
  responsibilities: string[];

  @Column({ name: 'strategic_goals', type: 'jsonb', default: '[]' })
  strategicGoals: string[];

  @Column({ name: 'key_decisions', type: 'jsonb', default: '[]' })
  keyDecisions: Record<string, any>[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'performance_metrics', type: 'jsonb', default: '{}' })
  performanceMetrics: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('executive_decisions')
export class ExecutiveDecision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'chief_ai_id', nullable: true })
  chiefAiId: string;

  @ManyToOne(() => ChiefAIAgent, { nullable: true })
  @JoinColumn({ name: 'chief_ai_id' })
  chiefAi: ChiefAIAgent;

  @Column({ name: 'department_id', nullable: true })
  departmentId: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'decision_type' })
  decisionType: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: '{}' })
  context: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  rationale: string;

  @Column({ type: 'jsonb', default: '[]' })
  alternatives: Record<string, any>[];

  @Column({ type: 'jsonb', default: '{}' })
  outcome: Record<string, any>;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ name: 'risk_level', default: 'medium' })
  riskLevel: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedByUser: User;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'rejected_by' })
  rejectedByUser: User;

  @Column({ name: 'rejected_at', nullable: true })
  rejectedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
