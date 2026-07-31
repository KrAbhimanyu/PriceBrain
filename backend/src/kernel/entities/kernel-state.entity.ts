import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('kernel_state')
export class KernelState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'state_key', unique: true })
  stateKey: string;

  @Column({ name: 'state_value', type: 'jsonb' })
  stateValue: Record<string, any>;

  @Column({ default: 1 })
  version: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
