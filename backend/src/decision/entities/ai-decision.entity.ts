import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Mission } from '../../missions/entities/mission.entity';

@Entity('ai_decision_logs')
export class AiDecisionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'mission_id', nullable: true })
  missionId: string;

  @ManyToOne(() => Mission, { nullable: true })
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @Column({ name: 'decision_type' })
  decisionType: string;

  @Column({ name: 'input_data', type: 'jsonb' })
  inputData: Record<string, any>;

  @Column({ name: 'output_data', type: 'jsonb' })
  outputData: Record<string, any>;

  @Column({ name: 'confidence_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidenceScore: number;

  @Column({ type: 'text', nullable: true })
  reasoning: string;

  @Column({ name: 'model_used', nullable: true })
  modelUsed: string;

  @Column({ name: 'tokens_used', nullable: true })
  tokensUsed: number;

  @Column({ name: 'execution_time_ms', nullable: true })
  executionTimeMs: number;

  @Column({ name: 'is_explained', default: false })
  isExplained: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
