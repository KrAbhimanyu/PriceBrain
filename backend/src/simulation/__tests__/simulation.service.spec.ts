import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { SimulationService } from '../simulation.service';
import { Simulation, SimulationScenario } from '../entities/simulation.entity';

describe('SimulationService', () => {
  let service: SimulationService;
  let simulationRepo: any;
  let scenarioRepo: any;
  let eventEmitter: any;

  const mockSimulation: Partial<Simulation> = {
    id: 'sim-1',
    organizationId: 'org-1',
    title: 'Business Growth Q3',
    simulationType: 'business_growth',
    status: 'pending',
    parameters: { growthRate: 0.1 },
    confidenceLevel: 95,
  };

  beforeEach(async () => {
    simulationRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    scenarioRepo = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationService,
        {
          provide: getRepositoryToken(Simulation),
          useValue: simulationRepo,
        },
        {
          provide: getRepositoryToken(SimulationScenario),
          useValue: scenarioRepo,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<SimulationService>(SimulationService);
  });

  describe('create', () => {
    it('should create a new simulation', async () => {
      simulationRepo.create.mockReturnValue(mockSimulation);
      simulationRepo.save.mockResolvedValue(mockSimulation);

      const result = await service.create('user-1', {
        organizationId: 'org-1',
        simulationType: 'business_growth',
        title: 'Business Growth Q3',
        parameters: { growthRate: 0.1 },
      });

      expect(result).toBeDefined();
      expect(simulationRepo.create).toHaveBeenCalledWith({
        organizationId: 'org-1',
        simulationType: 'business_growth',
        title: 'Business Growth Q3',
        parameters: { growthRate: 0.1 },
        createdBy: 'user-1',
        status: 'pending',
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('simulation.created', expect.any(Object));
    });

    it('should emit event on creation', async () => {
      simulationRepo.create.mockReturnValue(mockSimulation);
      simulationRepo.save.mockResolvedValue(mockSimulation);

      await service.create('user-1', {
        organizationId: 'org-1',
        simulationType: 'business_growth',
        title: 'Test Simulation',
        parameters: {},
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'simulation.created',
        expect.objectContaining({
          simulationId: 'sim-1',
          organizationId: 'org-1',
          simulationType: 'business_growth',
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return simulation by id', async () => {
      simulationRepo.findOne.mockResolvedValue(mockSimulation);

      const result = await service.findById('sim-1');

      expect(result).toEqual(mockSimulation);
      expect(simulationRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'sim-1' },
        relations: ['creator'],
      });
    });

    it('should throw NotFoundException if simulation not found', async () => {
      simulationRepo.findOne.mockResolvedValue(null);

      await expect(service.findById('sim-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('runSimulation', () => {
    it('should run a pending simulation and complete it', async () => {
      simulationRepo.findOne.mockResolvedValue({ ...mockSimulation, status: 'pending' });
      simulationRepo.save.mockImplementation((entity) => entity);

      const result = await service.runSimulation('sim-1');

      expect(result.status).toBe('completed');
      expect(result.results).toBeDefined();
      expect(result.successProbability).toBeDefined();
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(eventEmitter.emit).toHaveBeenCalledWith('simulation.completed', expect.any(Object));
    });

    it('should throw error if simulation is not pending', async () => {
      simulationRepo.findOne.mockResolvedValue({ ...mockSimulation, status: 'running' });

      await expect(service.runSimulation('sim-1')).rejects.toThrow(
        'Can only run pending simulations',
      );
    });
  });

  describe('approve', () => {
    it('should approve a simulation', async () => {
      simulationRepo.findOne.mockResolvedValue(mockSimulation);
      simulationRepo.save.mockImplementation((entity) => entity);

      const result = await service.approve('sim-1', 'user-1');

      expect(result.approvedBy).toBe('user-1');
    });
  });

  describe('addScenario', () => {
    it('should add a scenario to simulation', async () => {
      const mockScenario: Partial<SimulationScenario> = {
        id: 'scenario-1',
        simulationId: 'sim-1',
        name: 'Conservative Growth',
        scenarioData: { growthRate: 0.05 },
      };

      simulationRepo.findOne.mockResolvedValue(mockSimulation);
      scenarioRepo.create.mockReturnValue(mockScenario);
      scenarioRepo.save.mockResolvedValue(mockScenario);

      const result = await service.addScenario('sim-1', {
        name: 'Conservative Growth',
        scenarioData: { growthRate: 0.05 },
      });

      expect(result).toBeDefined();
      expect(scenarioRepo.create).toHaveBeenCalledWith({
        simulationId: 'sim-1',
        name: 'Conservative Growth',
        scenarioData: { growthRate: 0.05 },
      });
    });
  });

  describe('update', () => {
    it('should update simulation fields', async () => {
      simulationRepo.findOne.mockResolvedValue({ ...mockSimulation, title: 'Old Title' });
      simulationRepo.save.mockImplementation((entity) => entity);

      const result = await service.update('sim-1', { title: 'New Title' });

      expect(result.title).toBe('New Title');
    });
  });
});
