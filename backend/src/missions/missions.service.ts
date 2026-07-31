import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from './entities/mission.entity';
import { MissionTask } from './entities/mission-task.entity';
import { MissionBudgetAllocation } from './entities/mission-budget.entity';
import {
  CreateMissionDto,
  UpdateMissionDto,
  CreateMissionTaskDto,
  UpdateMissionTaskDto,
  CreateBudgetAllocationDto,
  UpdateBudgetAllocationDto,
} from './dto/mission.dto';
import { MissionType, MissionStatus, TaskStatus } from '../shared/enums/mission.enum';

@Injectable()
export class MissionsService {
  private readonly logger = new Logger(MissionsService.name);

  // Mission Templates for different life events
  private readonly missionTemplates: Record<MissionType, { title: string; defaultTasks: string[] }> = {
    [MissionType.WEDDING]: {
      title: 'Wedding Planning',
      defaultTasks: [
        'Set wedding budget',
        'Choose venue',
        'Select date',
        'Book caterer',
        'Find photographer',
        'Buy wedding attire',
        'Send invitations',
        'Plan honeymoon',
        'Home setup preparation',
      ],
    },
    [MissionType.VACATION]: {
      title: 'Vacation Planning',
      defaultTasks: [
        'Choose destination',
        'Set budget',
        'Book flights',
        'Reserve accommodation',
        'Plan itinerary',
        'Book activities',
        'Travel insurance',
        'Pack essentials',
      ],
    },
    [MissionType.STUDY_ABROAD]: {
      title: 'Study Abroad Preparation',
      defaultTasks: [
        'Choose program',
        'Apply for visa',
        'Arrange accommodation',
        'Buy travel insurance',
        'Set up banking',
        'Pack belongings',
        'Arrange transportation',
      ],
    },
    [MissionType.FIRST_JOB]: {
      title: 'First Job Setup',
      defaultTasks: [
        'Set up work wardrobe',
        'Organize home office',
        'Learn company tools',
        'Set financial goals',
        'Plan commute',
      ],
    },
    [MissionType.HOME_OFFICE]: {
      title: 'Home Office Setup',
      defaultTasks: [
        'Choose location',
        'Buy desk and chair',
        'Set up computer',
        'Install lighting',
        'Organize cables',
        'Add decor',
      ],
    },
    [MissionType.GAMING_SETUP]: {
      title: 'Gaming Setup',
      defaultTasks: [
        'Choose console/PC',
        'Buy monitor',
        'Get peripherals',
        'Set up audio',
        'Arrange seating',
        'Install games',
      ],
    },
    [MissionType.PHOTOGRAPHY_STUDIO]: {
      title: 'Photography Studio',
      defaultTasks: [
        'Choose space',
        'Buy camera gear',
        'Set up lighting',
        'Buy backdrop',
        'Organize props',
        'Set up editing station',
      ],
    },
    [MissionType.FITNESS_JOURNEY]: {
      title: 'Fitness Journey',
      defaultTasks: [
        'Set fitness goals',
        'Buy equipment',
        'Find workout space',
        'Plan nutrition',
        'Track progress',
      ],
    },
    [MissionType.HOME_RENOVATION]: {
      title: 'Home Renovation',
      defaultTasks: [
        'Define scope',
        'Set budget',
        'Hire contractors',
        'Choose materials',
        'Create timeline',
        'Arrange inspections',
      ],
    },
    [MissionType.BABY_PREPARATION]: {
      title: 'Baby Preparation',
      defaultTasks: [
        'Nursery setup',
        'Buy essentials',
        'Baby-proof home',
        'Plan pediatrician',
        'Arrange childcare',
      ],
    },
    [MissionType.BUSINESS_LAUNCH]: {
      title: 'Business Launch',
      defaultTasks: [
        'Define business plan',
        'Register business',
        'Set up finances',
        'Build website',
        'Create marketing plan',
        'Launch product/service',
      ],
    },
    [MissionType.FESTIVAL_PLANNING]: {
      title: 'Festival Preparation',
      defaultTasks: [
        'Set budget',
        'Plan decorations',
        'Organize food',
        'Buy gifts',
        'Plan activities',
      ],
    },
    [MissionType.CUSTOM]: {
      title: 'Custom Mission',
      defaultTasks: [],
    },
  };

  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(MissionTask)
    private taskRepository: Repository<MissionTask>,
    @InjectRepository(MissionBudgetAllocation)
    private budgetRepository: Repository<MissionBudgetAllocation>,
  ) {}

  // ============ Mission CRUD ============

  async create(userId: string, dto: CreateMissionDto): Promise<Mission> {
    const mission = this.missionRepository.create({
      ...dto,
      userId,
      status: MissionStatus.PLANNING,
    });

    const savedMission = await this.missionRepository.save(mission);

    // Generate default tasks from template
    if (dto.type !== MissionType.CUSTOM) {
      const template = this.missionTemplates[dto.type];
      for (const taskTitle of template.defaultTasks) {
        await this.createTask(savedMission.id, { title: taskTitle });
      }
    }

    this.logger.log(`Created mission ${savedMission.id} for user ${userId}`);
    return savedMission;
  }

  async findAll(userId: string, status?: MissionStatus): Promise<Mission[]> {
    const query = this.missionRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.tasks', 'tasks')
      .where('mission.userId = :userId', { userId });

    if (status) {
      query.andWhere('mission.status = :status', { status });
    }

    return query.orderBy('mission.updatedAt', 'DESC').getMany();
  }

  async findOne(id: string, userId: string): Promise<Mission> {
    const mission = await this.missionRepository.findOne({
      where: { id, userId },
      relations: ['tasks'],
    });

    if (!mission) {
      throw new NotFoundException(`Mission ${id} not found`);
    }

    return mission;
  }

  async update(id: string, userId: string, dto: UpdateMissionDto): Promise<Mission> {
    const mission = await this.findOne(id, userId);

    Object.assign(mission, dto);
    return this.missionRepository.save(mission);
  }

  async delete(id: string, userId: string): Promise<void> {
    const mission = await this.findOne(id, userId);
    await this.missionRepository.remove(mission);
    this.logger.log(`Deleted mission ${id}`);
  }

  async updateProgress(id: string, userId: string): Promise<Mission> {
    const mission = await this.findOne(id, userId);

    if (mission.tasks && mission.tasks.length > 0) {
      const completedTasks = mission.tasks.filter(
        (t) => t.status === TaskStatus.COMPLETED,
      ).length;
      mission.progress = (completedTasks / mission.tasks.length) * 100;

      if (mission.progress === 100) {
        mission.status = MissionStatus.COMPLETED;
      }
    }

    return this.missionRepository.save(mission);
  }

  // ============ Mission Tasks ============

  async createTask(
    missionId: string,
    dto: CreateMissionTaskDto,
  ): Promise<MissionTask> {
    const task = this.taskRepository.create({
      ...dto,
      missionId,
    });
    return this.taskRepository.save(task);
  }

  async createMultipleTasks(
    missionId: string,
    tasks: CreateMissionTaskDto[],
  ): Promise<MissionTask[]> {
    const taskEntities = tasks.map((dto) =>
      this.taskRepository.create({ ...dto, missionId }),
    );
    return this.taskRepository.save(taskEntities);
  }

  async findTasks(missionId: string): Promise<MissionTask[]> {
    return this.taskRepository.find({
      where: { missionId },
      order: { createdAt: 'ASC' },
    });
  }

  async updateTask(
    taskId: string,
    dto: UpdateMissionTaskDto,
  ): Promise<MissionTask> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    if (dto.status === TaskStatus.COMPLETED && !task.completedAt) {
      dto.completedAt = new Date() as any;
    }

    Object.assign(task, dto);
    return this.taskRepository.save(task);
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (task) {
      await this.taskRepository.remove(task);
    }
  }

  async reorderTasks(
    missionId: string,
    taskIds: string[],
  ): Promise<MissionTask[]> {
    const tasks = await this.taskRepository.find({ where: { missionId } });

    taskIds.forEach((id, index) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        (task as any).sortOrder = index;
      }
    });

    return this.taskRepository.save(tasks);
  }

  // ============ Budget Allocations ============

  async createBudgetAllocation(
    missionId: string,
    dto: CreateBudgetAllocationDto,
  ): Promise<MissionBudgetAllocation> {
    const allocation = this.budgetRepository.create({
      ...dto,
      missionId,
    });
    return this.budgetRepository.save(allocation);
  }

  async findBudgetAllocations(missionId: string): Promise<MissionBudgetAllocation[]> {
    return this.budgetRepository.find({ where: { missionId } });
  }

  async updateBudgetAllocation(
    allocationId: string,
    dto: UpdateBudgetAllocationDto,
  ): Promise<MissionBudgetAllocation> {
    const allocation = await this.budgetRepository.findOne({
      where: { id: allocationId },
    });

    if (!allocation) {
      throw new NotFoundException(`Budget allocation ${allocationId} not found`);
    }

    Object.assign(allocation, dto);
    return this.budgetRepository.save(allocation);
  }

  async updateMissionSpent(missionId: string): Promise<void> {
    const allocations = await this.budgetRepository.find({ where: { missionId } });
    const totalSpent = allocations.reduce(
      (sum, a) => sum + Number(a.spentAmount),
      0,
    );

    await this.missionRepository.update(missionId, { currentSpent: totalSpent });
  }

  // ============ Mission Generation ============

  async generateMissionFromGoal(
    userId: string,
    goal: string,
  ): Promise<Mission> {
    // Use AI to determine the mission type based on the goal
    const type = this.inferMissionType(goal);
    const template = this.missionTemplates[type];

    const mission = await this.create(userId, {
      title: template.title,
      description: `Mission generated from goal: ${goal}`,
      type,
      targetDate: this.calculateTargetDate(type),
    });

    return mission;
  }

  private inferMissionType(goal: string): MissionType {
    const lowerGoal = goal.toLowerCase();

    if (lowerGoal.includes('wedding') || lowerGoal.includes('married')) {
      return MissionType.WEDDING;
    }
    if (lowerGoal.includes('vacation') || lowerGoal.includes('trip') || lowerGoal.includes('holiday')) {
      return MissionType.VACATION;
    }
    if (lowerGoal.includes('study abroad') || lowerGoal.includes('exchange program')) {
      return MissionType.STUDY_ABROAD;
    }
    if (lowerGoal.includes('first job') || lowerGoal.includes('new job') || lowerGoal.includes('career')) {
      return MissionType.FIRST_JOB;
    }
    if (lowerGoal.includes('home office') || lowerGoal.includes('work from home')) {
      return MissionType.HOME_OFFICE;
    }
    if (lowerGoal.includes('gaming') || lowerGoal.includes('gamer')) {
      return MissionType.GAMING_SETUP;
    }
    if (lowerGoal.includes('photography') || lowerGoal.includes('photo studio')) {
      return MissionType.PHOTOGRAPHY_STUDIO;
    }
    if (lowerGoal.includes('fitness') || lowerGoal.includes('gym') || lowerGoal.includes('workout')) {
      return MissionType.FITNESS_JOURNEY;
    }
    if (lowerGoal.includes('renovation') || lowerGoal.includes('remodel') || lowerGoal.includes('home improvement')) {
      return MissionType.HOME_RENOVATION;
    }
    if (lowerGoal.includes('baby') || lowerGoal.includes('newborn') || lowerGoal.includes('pregnancy')) {
      return MissionType.BABY_PREPARATION;
    }
    if (lowerGoal.includes('business') || lowerGoal.includes('startup') || lowerGoal.includes('launch')) {
      return MissionType.BUSINESS_LAUNCH;
    }
    if (lowerGoal.includes('festival') || lowerGoal.includes('diwali') || lowerGoal.includes('christmas')) {
      return MissionType.FESTIVAL_PLANNING;
    }

    return MissionType.CUSTOM;
  }

  private calculateTargetDate(type: MissionType): Date {
    const now = new Date();
    const daysMap: Record<MissionType, number> = {
      [MissionType.WEDDING]: 365,
      [MissionType.VACATION]: 90,
      [MissionType.STUDY_ABROAD]: 180,
      [MissionType.FIRST_JOB]: 30,
      [MissionType.HOME_OFFICE]: 14,
      [MissionType.GAMING_SETUP]: 30,
      [MissionType.PHOTOGRAPHY_STUDIO]: 60,
      [MissionType.FITNESS_JOURNEY]: 90,
      [MissionType.HOME_RENOVATION]: 180,
      [MissionType.BABY_PREPARATION]: 270,
      [MissionType.BUSINESS_LAUNCH]: 90,
      [MissionType.FESTIVAL_PLANNING]: 60,
      [MissionType.CUSTOM]: 90,
    };

    const days = daysMap[type] || 90;
    now.setDate(now.getDate() + days);
    return now;
  }
}
