import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { Category } from '../../categories/entities/category.entity';
import { RetailerPrice } from './retailer-price.entity';
import { ProductImage } from './product-image.entity';
import { ProductAttribute } from './product-attribute.entity';

@Entity('products')
@Index(['slug'])
@Index(['isActive', 'isFeatured'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  @Index()
  brandId: string;

  @ManyToOne(() => Brand, { eager: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ nullable: true })
  @Index()
  categoryId: string;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => ProductImage, (image) => image.product, { eager: true, cascade: true })
  images: ProductImage[];

  @OneToMany(() => ProductAttribute, (attr) => attr.product, { eager: true, cascade: true })
  specifications: ProductAttribute[];

  @OneToMany(() => RetailerPrice, (price) => price.product, { cascade: true })
  retailerPrices: RetailerPrice[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Index()
  lowestPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  highestPrice: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: true })
  inStock: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: true })
  @Index()
  isActive: boolean;

  @Column({ nullable: true })
  aiProductId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
