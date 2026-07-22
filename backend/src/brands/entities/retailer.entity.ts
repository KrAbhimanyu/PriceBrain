import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('retailers')
export class Retailer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  affiliateProgramUrl: string;

  @Column({ nullable: true })
  affiliateNetwork: string;

  @Column({ default: true })
  @Index()
  isActive: boolean;

  @Column({ default: 0 })
  commissionRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
