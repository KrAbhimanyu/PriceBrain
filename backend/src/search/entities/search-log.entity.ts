import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('search_logs')
export class SearchLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  query: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  resultsCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
