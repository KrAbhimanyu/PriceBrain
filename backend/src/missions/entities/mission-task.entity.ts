import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mission } from './mission.entity';
import { TaskStatus, TaskPriority } from '../../shared/enums/mission.enum';

@Entity('mission_tasks')
export class MissionTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mission_id' })
  missionId: string;

  @ManyToOne(() => Mission, (mission) => mission.tasks)
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @Column({ name: 'parent_task_id', nullable: true })
  parentTaskId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 30, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'varchar', length: 20, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ name: 'estimated_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  actualCost: number;

  @Column({ name: 'assigned_agent', nullable: true })
  assignedAgent: string;

  @Column({ type: 'jsonb', default: [] })
  dependencies: string[];

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
