import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Retailer } from '../../brands/entities/retailer.entity';

@Entity('price_history')
@Index(['productId', 'createdAt'])
export class PriceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  retailerId: string;

  @ManyToOne(() => Retailer)
  @JoinColumn({ name: 'retailerId' })
  retailer: Retailer;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ default: 'INR' })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;
}
