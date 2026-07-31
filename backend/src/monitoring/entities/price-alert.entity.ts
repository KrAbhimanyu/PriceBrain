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
import { Product } from '../../products/entities/product.entity';

@Entity('price_alerts')
export class PriceAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'target_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  targetPrice: number;

  @Column({ name: 'current_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentPrice: number;

  @Column({ name: 'price_change_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  priceChangePercentage: number;

  @Column({ name: 'alert_type', type: 'varchar', length: 30, default: 'price_drop' })
  alertType: string;

  @Column({ name: 'is_triggered', default: false })
  isTriggered: boolean;

  @Column({ name: 'triggered_at', nullable: true })
  triggeredAt: Date;

  @Column({ name: 'notification_sent', default: false })
  notificationSent: boolean;

  @Column({ name: 'notification_id', nullable: true })
  notificationId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
