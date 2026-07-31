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

@Entity('enterprise_memory')
export class EnterpriseMemory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'department_id', nullable: true })
  departmentId: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'memory_type' })
  memoryType: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'source_type', nullable: true })
  sourceType: string;

  @Column({ name: 'source_id', nullable: true })
  sourceId: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.5 })
  importance: number;

  @Column({ default: 'organization' })
  accessibility: string;

  @Column({ type: 'jsonb', default: '[]' })
  tags: string[];

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('memory_associations')
export class MemoryAssociation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'memory_id' })
  memoryId: string;

  @Column({ name: 'associated_id' })
  associatedId: string;

  @Column({ name: 'association_type', nullable: true })
  associationType: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.5 })
  strength: number;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
