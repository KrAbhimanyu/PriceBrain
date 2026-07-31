import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Mission } from '../../missions/entities/mission.entity';
import { WorkflowInstance } from '../../workflows/entities/workflow-instance.entity';

@Entity('approvals')
export class Approval {
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

  @ManyToOne(() => WorkflowInstance, { nullable: true })
  @JoinColumn({ name: 'workflow_instance_id' })
  workflowInstance: WorkflowInstance;

  @Column()
  type: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'action_data', type: 'jsonb' })
  actionData: Record<string, any>;

  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority: string;

  @Column({ name: 'requires_verification', default: false })
  requiresVerification: boolean;

  @Column({ name: 'verification_method', nullable: true })
  verificationMethod: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejected_at', nullable: true })
  rejectedAt: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'approver_id', nullable: true })
  approverId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approver_id' })
  approver: User;

  @Column({ name: 'approver_notes', type: 'text', nullable: true })
  approverNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
