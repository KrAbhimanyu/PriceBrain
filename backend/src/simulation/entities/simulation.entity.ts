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

@Entity('simulations')
export class Simulation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'simulation_type' })
  simulationType: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: '{}' })
  parameters: Record<string, any>;

  @Column({ name: 'initial_state', type: 'jsonb', default: '{}' })
  initialState: Record<string, any>;

  @Column({ default: 1000 })
  iterations: number;

  @Column({ name: 'duration_days', nullable: true })
  durationDays: number;

  @Column({ name: 'confidence_level', type: 'decimal', precision: 5, scale: 2, default: 95 })
  confidenceLevel: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', default: '{}' })
  results: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  predictions: Record<string, any>;

  @Column({ type: 'jsonb', default: '[]' })
  risks: Record<string, any>[];

  @Column({ type: 'jsonb', default: '[]' })
  alternatives: Record<string, any>[];

  @Column({ name: 'success_probability', type: 'decimal', precision: 5, scale: 2, nullable: true })
  successProbability: number;

  @Column({ name: 'expected_cost', type: 'decimal', precision: 15, scale: 2, nullable: true })
  expectedCost: number;

  @Column({ name: 'expected_timeline', nullable: true })
  expectedTimeline: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;
}

@Entity('simulation_scenarios')
export class SimulationScenario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'simulation_id' })
  simulationId: string;

  @ManyToOne(() => Simulation)
  @JoinColumn({ name: 'simulation_id' })
  simulation: Simulation;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'scenario_data', type: 'jsonb' })
  scenarioData: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  outcomes: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  probability: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
