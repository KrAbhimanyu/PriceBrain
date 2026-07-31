import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MissionType, MissionStatus, MissionPriority } from '../../shared/enums/mission.enum';

@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  type: MissionType;

  @Column({ type: 'varchar', length: 30, default: MissionStatus.PLANNING })
  status: MissionStatus;

  @Column({ type: 'varchar', length: 20, default: MissionPriority.MEDIUM })
  priority: MissionPriority;

  @Column({ name: 'target_budget', type: 'decimal', precision: 12, scale: 2, nullable: true })
  targetBudget: number;

  @Column({ name: 'current_spent', type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentSpent: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'target_date', type: 'date', nullable: true })
  targetDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => MissionTask, (task) => task.mission)
  tasks: MissionTask[];
}
