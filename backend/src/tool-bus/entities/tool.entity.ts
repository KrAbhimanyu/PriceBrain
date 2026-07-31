import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tools')
export class Tool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  category: string;

  @Column()
  version: string;

  @Column({ name: 'input_schema', type: 'jsonb' })
  inputSchema: Record<string, any>;

  @Column({ name: 'output_schema', type: 'jsonb' })
  outputSchema: Record<string, any>;

  @Column({ type: 'jsonb', default: '[]' })
  permissions: string[];

  @Column({ name: 'rate_limit', nullable: true })
  rateLimit: number;

  @Column({ name: 'timeout_ms', default: 30000 })
  timeoutMs: number;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({ name: 'is_async', default: false })
  isAsync: boolean;

  @Column({ name: 'handler_path', nullable: true })
  handlerPath: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
