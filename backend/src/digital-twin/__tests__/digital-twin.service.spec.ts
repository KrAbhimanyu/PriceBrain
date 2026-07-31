import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { DigitalTwinService } from '../digital-twin.service';
import { DigitalTwin, TwinComponent, TwinSnapshot } from '../entities/digital-twin.entity';

describe('DigitalTwinService', () => {
  let service: DigitalTwinService;
  let twinRepo: any;
  let componentRepo: any;
  let snapshotRepo: any;
  let eventEmitter: any;

  const mockTwin: Partial<DigitalTwin> = {
    id: 'twin-1',
    organizationId: 'org-1',
    name: 'TechCorp Digital Twin',
    syncStatus: 'synced',
    healthScore: 87,
    riskScore: 23,
    performanceScore: 91,
    modelState: {},
    metrics: {},
    configurations: {},
  };

  const mockComponents: Partial<TwinComponent>[] = [
    {
      id: 'comp-1',
      twinId: 'twin-1',
      componentType: 'department',
      componentId: 'dept-1',
      healthStatus: 'healthy',
      state: {},
      metrics: {},
    },
    {
      id: 'comp-2',
      twinId: 'twin-1',
      componentType: 'department',
      componentId: 'dept-2',
      healthStatus: 'degraded',
      state: {},
      metrics: {},
    },
  ];

  beforeEach(async () => {
    twinRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    componentRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      upsert: jest.fn(),
    };

    snapshotRepo = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigitalTwinService,
        {
          provide: getRepositoryToken(DigitalTwin),
          useValue: twinRepo,
        },
        {
          provide: getRepositoryToken(TwinComponent),
          useValue: componentRepo,
        },
        {
          provide: getRepositoryToken(TwinSnapshot),
          useValue: snapshotRepo,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<DigitalTwinService>(DigitalTwinService);
  });

  describe('create', () => {
    it('should create a new digital twin', async () => {
      twinRepo.create.mockReturnValue(mockTwin);
      twinRepo.save.mockResolvedValue(mockTwin);

      const result = await service.create({
        organizationId: 'org-1',
        name: 'TechCorp Digital Twin',
      });

      expect(result).toBeDefined();
      expect(result.syncStatus).toBe('synced');
      expect(result.healthScore).toBeDefined();
      expect(twinRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org-1',
          name: 'TechCorp Digital Twin',
        }),
      );
    });

    it('should initialize default model state', async () => {
      twinRepo.create.mockImplementation((dto) => ({ ...dto }));
      twinRepo.save.mockImplementation((entity) => entity);

      await service.create({
        organizationId: 'org-1',
        name: 'Test Twin',
      });

      const createCall = twinRepo.create.mock.calls[0][0];
      expect(createCall.modelState).toHaveProperty('businessStructure');
      expect(createCall.modelState).toHaveProperty('resources');
      expect(createCall.modelState).toHaveProperty('budgets');
      expect(createCall.modelState).toHaveProperty('projects');
    });
  });

  describe('findByOrganization', () => {
    it('should return digital twin for organization', async () => {
      twinRepo.findOne.mockResolvedValue(mockTwin);

      const result = await service.findByOrganization('org-1');

      expect(result).toEqual(mockTwin);
      expect(twinRepo.findOne).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        relations: ['organization'],
      });
    });

    it('should throw NotFoundException if twin not found', async () => {
      twinRepo.findOne.mockResolvedValue(null);

      await expect(service.findByOrganization('org-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('sync', () => {
    it('should sync components and update twin status', async () => {
      twinRepo.findOne.mockResolvedValue({ ...mockTwin, modelState: {} });
      twinRepo.save.mockImplementation((entity) => entity);
      componentRepo.find.mockResolvedValue(mockComponents);
      componentRepo.upsert.mockResolvedValue(undefined);

      const result = await service.sync('org-1', {
        components: [
          {
            componentType: 'department',
            componentId: 'dept-1',
            state: { name: 'Engineering', members: 15 },
            metrics: { health: 92 },
          },
        ],
      });

      expect(result.syncStatus).toBe('synced');
      expect(result.lastSyncAt).toBeInstanceOf(Date);
      expect(componentRepo.upsert).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('digital_twin.synced', expect.any(Object));
    });
  });

  describe('getComponents', () => {
    it('should return all components for twin', async () => {
      twinRepo.findOne.mockResolvedValue(mockTwin);
      componentRepo.find.mockResolvedValue(mockComponents);

      const result = await service.getComponents('org-1');

      expect(result).toEqual(mockComponents);
      expect(componentRepo.find).toHaveBeenCalledWith({
        where: { twinId: 'twin-1' },
      });
    });
  });

  describe('updateComponent', () => {
    it('should update existing component', async () => {
      const existingComponent = { ...mockComponents[0] };
      twinRepo.findOne.mockResolvedValue(mockTwin);
      componentRepo.findOne.mockResolvedValue(existingComponent);
      componentRepo.save.mockImplementation((entity) => entity);
      componentRepo.find.mockResolvedValue([existingComponent]);

      const result = await service.updateComponent(
        'org-1',
        'department',
        'dept-1',
        { state: { name: 'Updated' }, healthStatus: 'healthy' },
      );

      expect(result.healthStatus).toBe('healthy');
      expect(twinRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if component not found', async () => {
      twinRepo.findOne.mockResolvedValue(mockTwin);
      componentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateComponent('org-1', 'department', 'dept-999', { state: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSnapshot', () => {
    it('should create a snapshot of current twin state', async () => {
      const mockSnapshot: Partial<TwinSnapshot> = {
        id: 'snap-1',
        twinId: 'twin-1',
        snapshotData: {},
        healthScore: 87,
        riskScore: 23,
      };

      twinRepo.findOne.mockResolvedValue(mockTwin);
      componentRepo.find.mockResolvedValue(mockComponents);
      snapshotRepo.create.mockReturnValue(mockSnapshot);
      snapshotRepo.save.mockResolvedValue(mockSnapshot);

      const result = await service.createSnapshot('org-1');

      expect(result).toBeDefined();
      expect(result.healthScore).toBe(87);
      expect(snapshotRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          twinId: 'twin-1',
          snapshotData: expect.any(Object),
        }),
      );
    });
  });

  describe('getDigitalTwinStatus', () => {
    it('should return comprehensive twin status', async () => {
      twinRepo.findOne.mockResolvedValue(mockTwin);
      componentRepo.find.mockResolvedValue(mockComponents);

      const result = await service.getDigitalTwinStatus('org-1');

      expect(result.id).toBe('twin-1');
      expect(result.name).toBe('TechCorp Digital Twin');
      expect(result.healthScore).toBe(87);
      expect(result.riskScore).toBe(23);
      expect(result.components.total).toBe(2);
      expect(result.components.byType).toEqual({ department: 2 });
    });
  });
});
