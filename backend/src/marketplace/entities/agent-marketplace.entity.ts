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
import { Agent } from '../../kernel/entities/agent.entity';

@Entity('agent_marketplace')
export class AgentMarketplace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agent_id' })
  agentId: string;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ name: 'author_id', nullable: true })
  authorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'author_name', nullable: true })
  authorName: string;

  @Column()
  category: string;

  @Column({ name: 'short_description', nullable: true })
  shortDescription: string;

  @Column({ name: 'long_description', type: 'text', nullable: true })
  longDescription: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'jsonb', default: '[]' })
  screenshots: string[];

  @Column({ name: 'demo_url', nullable: true })
  demoUrl: string;

  @Column({
    name: 'pricing_model',
    type: 'enum',
    enum: ['free', 'subscription', 'one_time', 'usage'],
    default: 'free',
  })
  pricingModel: string;

  @Column({ name: 'price_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceAmount: number;

  @Column({ name: 'price_currency', default: 'USD' })
  priceCurrency: string;

  @Column({ name: 'subscription_interval', nullable: true })
  subscriptionInterval: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'rating_count', default: 0 })
  ratingCount: number;

  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({ name: 'install_count', default: 0 })
  installCount: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_premium', default: false })
  isPremium: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: '[]' })
  tags: string[];

  @Column({ name: 'supported_platforms', type: 'jsonb', default: '["web"]' })
  supportedPlatforms: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
