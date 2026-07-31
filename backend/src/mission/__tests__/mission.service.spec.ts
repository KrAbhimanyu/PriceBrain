import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MissionService } from '../mission.service';
import { Mission, MissionTask } from '../entities/mission.entity';

describe('MissionService', () => {
  let service: MissionService;
  let missionRepo: any;
  let taskRepo: any;
  let eventEmitter: any;

  const mockMission: Partial<Mission> = {
    id: 'mission-1',
    userId: 'user-1',
    title: 'Wedding Shopping',
    description: 'Complete wedding shopping',
    type: 'wedding',
    status: 'active',
    priority: 'high',
    targetBudget: 500000,
    currentSpent: 250000,
    progress: 45,
  };

  const mockTask: Partial<MissionTask> = {
    id: 'task-1',
    missionId: 'mission-1',
    title: 'Find venue',
    status: 'pending',
    priority: 'high',
  };

  beforeEach(async () => {
    missionRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getOne: jest.fn().mockResolvedValue(null),
      })),
    };

    taskRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionService,
        { provide: getRepositoryToken(Mission), useValue: missionRepo },
        { provide: getRepositoryToken(MissionTask), useValue: taskRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<MissionService>(MissionService);
  });

  describe('Mission CRUD', () => {
    it('should create a mission', async () => {
      missionRepo.create.mockReturnValue(mockMission);
      missionRepo.save.mockResolvedValue(mockMission);

      const result = await service.createMission({
        userId: 'user-1',
        title: 'Wedding Shopping',
        type: 'wedding',
        priority: 'high',
        targetBudget: 500000,
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Wedding Shopping');
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should find mission by id', async () => {
      missionRepo.findOne.mockResolvedValue(mockMission);

      const result = await service.findMission('mission-1');

      expect(result).toEqual(mockMission);
    });

    it('should throw NotFoundException if mission not found', async () => {
      missionRepo.findOne.mockResolvedValue(null);

      await expect(service.findMission('mission-999')).rejects.toThrow(NotFoundException);
    });

    it('should find missions by user', async () => {
      missionRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMission]),
      });

      const result = await service.findMissionsByUser('user-1');

      expect(result.length).toBe(1);
    });

    it('should update mission', async () => {
      missionRepo.findOne.mockResolvedValue(mockMission);
      missionRepo.save.mockImplementation((entity) => entity);

      const result = await service.updateMission('mission-1', { title: 'Updated Mission' });

      expect(result.title).toBe('Updated Mission');
    });

    it('should delete mission', async () => {
      missionRepo.findOne.mockResolvedValue(mockMission);
      missionRepo.delete.mockResolvedValue(undefined);

      await service.deleteMission('mission-1');

      expect(missionRepo.delete).toHaveBeenCalledWith('mission-1');
    });
  });

  describe('Mission Status', () => {
    it('should activate mission', async () => {
      missionRepo.findOne.mockResolvedValue({ ...mockMission, status: 'planning' });
      missionRepo.save.mockImplementation((entity) => entity);

      const result = await service.activateMission('mission-1');

      expect(result.status).toBe('active');
      expect(eventEmitter.emit).toHaveBeenCalledWith('mission.activated', expect.any(Object));
    });

    it('should pause mission', async () => {
      missionRepo.findOne.mockResolvedValue({ ...mockMission, status: 'active' });
      missionRepo.save.mockImplementation((entity) => entity);

      const result = await service.pauseMission('mission-1');

      expect(result.status).toBe('paused');
    });

    it('should complete mission', async () => {
      missionRepo.findOne.mockResolvedValue({ ...mockMission, status: 'active', progress: 100 });
      missionRepo.save.mockImplementation((entity) => entity);

      const result = await service.completeMission('mission-1');

      expect(result.status).toBe('completed');
      expect(result.completedAt).toBeDefined();
    });

    it('should cancel mission', async () => {
      missionRepo.findOne.mockResolvedValue({ ...mockMission, status: 'active' });
      missionRepo.save.mockImplementation((entity) => entity);

      const result = await service.cancelMission('mission-1', 'Changed my mind');

      expect(result.status).toBe('cancelled');
      expect(result.cancelReason).toBe('Changed my mind');
    });
  });

  describe('Mission Tasks', () => {
    it('should add task to mission', async () => {
      missionRepo.findOne.mockResolvedValue(mockMission);
      taskRepo.create.mockReturnValue(mockTask);
      taskRepo.save.mockResolvedValue(mockTask);

      const result = await service.addTask('mission-1', {
        title: 'Find venue',
        priority: 'high',
      });

      expect(result).toBeDefined();
      expect(taskRepo.create).toHaveBeenCalled();
    });

    it('should update task', async () => {
      missionRepo.findOne.mockResolvedValue(mockMission);
      taskRepo.findOne.mockResolvedValue(mockTask);
      taskRepo.save.mockImplementation((entity) => entity);

      const result = await service.updateTask('task-1', { status: 'completed' });

      expect(result.status).toBe('completed');
    });

    it('should delete task', async () => {
      taskRepo.findOne.mockResolvedValue(mockTask);
      taskRepo.delete.mockResolvedValue(undefined);

      await service.deleteTask('task-1');

      expect(taskRepo.delete).toHaveBeenCalledWith('task-1');
    });

    it('should reorder tasks', async () => {
      const tasks = [
        { ...mockTask, id: 'task-1', order: 1 },
        { ...mockTask, id: 'task-2', order: 2 },
      ];
      taskRepo.find.mockResolvedValue(tasks);
      taskRepo.save.mockImplementation((entity) => entity);

      await service.reorderTasks('mission-1', ['task-2', 'task-1']);

      expect(taskRepo.save).toHaveBeenCalled();
    });
  });

  describe('Mission Progress', () => {
    it('should update mission progress', async () => {
      missionRepo.findOne.mockResolvedValue(mockMission);
      missionRepo.save.mockImplementation((entity) => entity);

      const result = await service.updateProgress('mission-1', 50);

      expect(result.progress).toBe(50);
    });

    it('should track spending', async () => {
      missionRepo.findOne.mockResolvedValue({ ...mockMission, currentSpent: 250000 });
      missionRepo.save.mockImplementation((entity) => entity);

      const result = await service.trackSpending('mission-1', 50000);

      expect(result.currentSpent).toBe(300000);
    });

    it('should warn when exceeding budget', async () => {
      missionRepo.findOne.mockResolvedValue({ ...mockMission, currentSpent: 450000, targetBudget: 500000 });
      missionRepo.save.mockImplementation((entity) => entity);

      const result = await service.trackSpending('mission-1', 60000);

      expect(result.currentSpent).toBe(510000);
      expect(eventEmitter.emit).toHaveBeenCalledWith('mission.budget_warning', expect.any(Object));
    });
  });

  describe('Dashboard', () => {
    it('should get mission dashboard', async () => {
      missionRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMission]),
      });

      const result = await service.getMissionDashboard('user-1');

      expect(result).toBeDefined();
      expect(result.totalMissions).toBeGreaterThanOrEqual(0);
    });
  });
});
