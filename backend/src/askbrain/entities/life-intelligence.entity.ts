import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';

export enum MissionStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MissionType {
  WEDDING = 'wedding',
  ENGAGEMENT = 'engagement',
  RECEPTION = 'reception',
  BIRTHDAY = 'birthday',
  ANNIVERSARY = 'anniversary',
  FESTIVAL = 'festival',
  TRAVEL = 'travel',
  VACATION = 'vacation',
  BUSINESS_TRIP = 'business_trip',
  INTERVIEW = 'interview',
  COLLEGE = 'college',
  SCHOOL = 'school',
  GYM = 'gym',
  HOMESETUP = 'home_setup',
  KITCHEN = 'kitchen',
  LIVING_ROOM = 'living_room',
  BEDROOM = 'bedroom',
  STUDY_ROOM = 'study_room',
  WFH = 'work_from_home',
  GAMING = 'gaming',
  PHOTOGRAPHY = 'photography',
  CONTENT_CREATION = 'content_creation',
  BABY_PLANNING = 'baby_planning',
  FIRST_JOB = 'first_job',
  PROMOTION = 'promotion',
  RETIREMENT = 'retirement',
  MOVING = 'moving',
  RENOVATION = 'renovation',
  CUSTOM = 'custom',
}

@Entity('askbrain_mission')
@Index(['userId', 'status'])
export class AskBrainMission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: MissionType })
  missionType: MissionType;

  @Column({ type: 'enum', enum: MissionStatus, default: MissionStatus.PLANNING })
  status: MissionStatus;

  @Column({ nullable: true })
  eventDate: Date;

  @Column({ nullable: true })
  eventName: string;

  @Column({ type: 'float' })
  totalBudget: number;

  @Column({ type: 'float', default: 0 })
  spentAmount: number;

  @Column({ type: 'float', default: 0 })
  remainingBudget: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  deadline: Date;

  @Column({ type: 'jsonb', nullable: true })
  goals: string[];

  @Column({ type: 'jsonb', nullable: true })
  constraints: string[];

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  totalTasks: number;

  @Column({ type: 'int', default: 0 })
  completedTasks: number;

  @Column({ type: 'int', default: 0 })
  progressPercentage: number;

  @Column({ nullable: true })
  currentPhase: string;

  @Column({ type: 'jsonb', nullable: true })
  phases: {
    name: string;
    startDate: Date;
    endDate: Date;
    tasks: string[];
    completed: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  checklist: {
    id: string;
    item: string;
    completed: boolean;
    dueDate: Date;
    priority: 'low' | 'medium' | 'high';
  }[];

  @Column({ type: 'jsonb', nullable: true })
  approvedItems: string[];

  @Column({ type: 'jsonb', nullable: true })
  pendingApprovals: string[];

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  milestones: {
    name: string;
    targetDate: Date;
    completed: boolean;
    completedAt: Date;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('askbrain_mission_task')
export class AskBrainMissionTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  missionId: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ type: 'float', nullable: true })
  budget: number;

  @Column({ type: 'float', default: 0 })
  spentAmount: number;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  completedDate: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';

  @Column({ default: 'medium' })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true })
  productId: string;

  @Column({ nullable: true })
  productName: string;

  @Column({ type: 'jsonb', nullable: true })
  linkedProducts: string[];

  @Column({ type: 'jsonb', nullable: true })
  dependencies: string[];

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  needsApproval: boolean;

  @Column({ nullable: true })
  approvalStatus: 'pending' | 'approved' | 'rejected';

  @Column({ nullable: true })
  approvedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('askbrain_life_timeline')
export class AskBrainLifeTimeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  eventType: string;

  @Column()
  eventName: string;

  @Column()
  eventDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  relatedGoals: string[];

  @Column({ type: 'jsonb', nullable: true })
  shoppingNeeds: {
    category: string;
    items: string[];
    estimatedBudget: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  milestones: {
    name: string;
    targetDate: Date;
    completed: boolean;
  }[];

  @Column({ nullable: true })
  status: 'upcoming' | 'ongoing' | 'completed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('askbrain_digital_wardrobe')
export class AskBrainDigitalWardrobe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  productId: string;

  @Column({ nullable: true })
  productName: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  fabric: string;

  @Column({ nullable: true })
  style: string;

  @Column({ nullable: true })
  occasion: string;

  @Column({ type: 'float', nullable: true })
  price: number;

  @Column({ nullable: true })
  purchaseDate: Date;

  @Column({ nullable: true })
  usageCount: number;

  @Column({ nullable: true })
  lastWornDate: Date;

  @Column({ nullable: true })
  costPerWear: number;

  @Column({ default: 'owned' })
  status: 'owned' | 'donated' | 'resold' | 'discarded';

  @Column({ nullable: true })
  condition: string;

  @Column({ type: 'jsonb', nullable: true })
  compatibleWith: string[];

  @Column({ type: 'jsonb', nullable: true })
  outfitsUsedIn: string[];

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('askbrain_ai_memory')
export class AskBrainAIMemory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  memoryType: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'float', default: 1.0 })
  importance: number;

  @Column({ type: 'int', default: 0 })
  accessCount: number;

  @Column({ nullable: true })
  lastAccessedAt: Date;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  conversationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
