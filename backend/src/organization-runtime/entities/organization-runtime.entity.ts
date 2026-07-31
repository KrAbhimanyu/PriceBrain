import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum OrganizationType {
  SINGLE = 'single',
  PARTNERSHIP = 'partnership',
  LLP = 'llp',
  PRIVATE_LTD = 'private_ltd',
  PUBLIC_LTD = 'public_ltd',
  STARTUP = 'startup',
  ENTERPRISE = 'enterprise',
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  ARCHIVED = 'archived',
}

export enum RoleType {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
  BOT = 'bot',
}

export enum PermissionType {
  MANAGE_USERS = 'manage_users',
  MANAGE_PRODUCTS = 'manage_products',
  MANAGE_ORDERS = 'manage_orders',
  MANAGE_FINANCE = 'manage_finance',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_REPORTS = 'view_reports',
  MANAGE_AI = 'manage_ai',
  APPROVE_PURCHASES = 'approve_purchases',
  MANAGE_MEMBERSHIPS = 'manage_memberships',
  CONFIGURE_AUTOMATIONS = 'configure_automations',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  legalName: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: OrganizationType,
    default: OrganizationType.STARTUP,
  })
  organizationType: OrganizationType;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE,
  })
  status: OrganizationStatus;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  pincode: string;

  @Column({ nullable: true })
  gstin: string;

  @Column({ nullable: true })
  pan: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('organization_members')
export class OrganizationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.MEMBER,
  })
  role: RoleType;

  @Column({ type: 'jsonb', nullable: true })
  permissions: PermissionType[];

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  title: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  invitedBy: string;

  @Column({ nullable: true })
  invitedAt: Date;

  @Column({ nullable: true })
  joinedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('organization_ai_instances')
export class OrganizationAIInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  agentId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.BOT,
  })
  role: RoleType;

  @Column({ default: 'idle' })
  status: string;

  @Column({ nullable: true })
  currentTask: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ default: 0 })
  tasksCompleted: number;

  @Column({ default: 0 })
  tasksFailed: number;

  @Column({ type: 'jsonb', nullable: true })
  capabilities: string[];

  @Column({ type: 'jsonb', nullable: true })
  configuration: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  memory: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('organization_workflows')
export class OrganizationWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  definition: Record<string, any>;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  schedule: string;

  @Column({ nullable: true })
  lastRunAt: Date;

  @Column({ nullable: true })
  nextRunAt: Date;

  @Column({ default: 0 })
  totalRuns: number;

  @Column({ default: 0 })
  successfulRuns: number;

  @Column({ default: 0 })
  failedRuns: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import { ManyToOne, JoinColumn } from 'typeorm';
