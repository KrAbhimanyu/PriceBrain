import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('plugins')
export class Plugin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  version: string;

  @Column({ nullable: true })
  author: string;

  @Column({ name: 'author_url', nullable: true })
  authorUrl: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ name: 'homepage_url', nullable: true })
  homepageUrl: string;

  @Column({ name: 'documentation_url', nullable: true })
  documentationUrl: string;

  @Column({ name: 'source_url', nullable: true })
  sourceUrl: string;

  @Column({ name: 'is_official', default: false })
  isOfficial: boolean;

  @Column({ name: 'is_premium', default: false })
  isPremium: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ type: 'jsonb' })
  manifest: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  permissions: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
