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

@Entity('mission_budget_allocations')
export class MissionBudgetAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mission_id' })
  missionId: string;

  @ManyToOne(() => Mission)
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @Column()
  category: string;

  @Column({ name: 'allocated_amount', type: 'decimal', precision: 12, scale: 2 })
  allocatedAmount: number;

  @Column({ name: 'spent_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  spentAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
