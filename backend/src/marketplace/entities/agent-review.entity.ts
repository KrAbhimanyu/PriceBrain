import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AgentMarketplace } from './agent-marketplace.entity';

@Entity('agent_reviews')
@Unique(['marketplaceId', 'userId'])
export class AgentReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'marketplace_id' })
  marketplaceId: string;

  @ManyToOne(() => AgentMarketplace)
  @JoinColumn({ name: 'marketplace_id' })
  marketplace: AgentMarketplace;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  rating: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'is_verified_purchase', default: false })
  isVerifiedPurchase: boolean;

  @Column({ name: 'helpful_count', default: 0 })
  helpfulCount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
