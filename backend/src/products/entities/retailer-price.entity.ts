import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Retailer } from '../../brands/entities/retailer.entity';

@Entity('retailer_prices')
@Index(['productId', 'retailerId'], { unique: true })
export class RetailerPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  productId: string;

  @ManyToOne(() => Product, (product) => product.retailerPrices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  retailerId: string;

  @ManyToOne(() => Retailer, { eager: true })
  @JoinColumn({ name: 'retailerId' })
  retailer: Retailer;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ nullable: true })
  affiliateUrl: string;

  @Column({ nullable: true })
  productUrl: string;

  @Column({ default: true })
  inStock: boolean;

  @Column({ nullable: true })
  lastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
