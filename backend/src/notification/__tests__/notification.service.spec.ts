import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from '../notification.service';
import { Notification, NotificationTemplate, NotificationPreference } from '../entities/notification.entity';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepo: any;
  let templateRepo: any;
  let preferenceRepo: any;
  let eventEmitter: any;

  const mockNotification: Partial<Notification> = {
    id: 'notif-1',
    userId: 'user-1',
    type: 'price_alert',
    title: 'Price Drop Alert',
    message: 'iPhone price dropped by 20%',
    channel: 'email',
    status: 'pending',
    priority: 'high',
  };

  const mockTemplate: Partial<NotificationTemplate> = {
    id: 'template-1',
    name: 'Price Drop Alert',
    type: 'price_alert',
    subject: 'Price dropped for {{product}}',
    body: 'The price of {{product}} has dropped from {{oldPrice}} to {{newPrice}}',
    channel: 'email',
    isActive: true,
  };

  const mockPreference: Partial<NotificationPreference> = {
    id: 'pref-1',
    userId: 'user-1',
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
  };

  beforeEach(async () => {
    notificationRepo = {
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

    templateRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    preferenceRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(Notification), useValue: notificationRepo },
        { provide: getRepositoryToken(NotificationTemplate), useValue: templateRepo },
        { provide: getRepositoryToken(NotificationPreference), useValue: preferenceRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe('Notification Management', () => {
    it('should create notification', async () => {
      notificationRepo.create.mockReturnValue(mockNotification);
      notificationRepo.save.mockResolvedValue(mockNotification);

      const result = await service.createNotification({
        userId: 'user-1',
        type: 'price_alert',
        title: 'Price Drop Alert',
        message: 'iPhone price dropped by 20%',
        channel: 'email',
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Price Drop Alert');
    });

    it('should find notification by id', async () => {
      notificationRepo.findOne.mockResolvedValue(mockNotification);

      const result = await service.findNotification('notif-1');

      expect(result).toEqual(mockNotification);
    });

    it('should send notification', async () => {
      notificationRepo.findOne.mockResolvedValue({ ...mockNotification, status: 'pending' });
      notificationRepo.save.mockImplementation((entity) => entity);

      const result = await service.sendNotification('notif-1');

      expect(result.status).toBe('sent');
      expect(result.sentAt).toBeDefined();
    });

    it('should mark notification as read', async () => {
      notificationRepo.findOne.mockResolvedValue({ ...mockNotification, status: 'sent' });
      notificationRepo.save.mockImplementation((entity) => entity);

      const result = await service.markAsRead('notif-1');

      expect(result.readAt).toBeDefined();
    });

    it('should delete notification', async () => {
      notificationRepo.findOne.mockResolvedValue(mockNotification);
      notificationRepo.delete.mockResolvedValue(undefined);

      await service.deleteNotification('notif-1');

      expect(notificationRepo.delete).toHaveBeenCalled();
    });
  });

  describe('User Notifications', () => {
    it('should get user notifications', async () => {
      notificationRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockNotification]),
      });

      const result = await service.getUserNotifications('user-1');

      expect(result.length).toBe(1);
    });

    it('should get unread count', async () => {
      notificationRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
      });

      const result = await service.getUnreadCount('user-1');

      expect(result).toBe(5);
    });

    it('should mark all as read', async () => {
      notificationRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockNotification]),
      });
      notificationRepo.save.mockImplementation((entity) => entity);

      await service.markAllAsRead('user-1');

      expect(notificationRepo.save).toHaveBeenCalled();
    });
  });

  describe('Templates', () => {
    it('should create template', async () => {
      templateRepo.create.mockReturnValue(mockTemplate);
      templateRepo.save.mockResolvedValue(mockTemplate);

      const result = await service.createTemplate({
        name: 'Price Drop Alert',
        type: 'price_alert',
        subject: 'Price dropped',
        body: 'Price has dropped',
        channel: 'email',
      });

      expect(result).toBeDefined();
    });

    it('should render template', async () => {
      templateRepo.findOne.mockResolvedValue(mockTemplate);

      const result = await service.renderTemplate('template-1', {
        product: 'iPhone',
        oldPrice: '₹100000',
        newPrice: '₹80000',
      });

      expect(result.subject).toBe('Price dropped for iPhone');
      expect(result.body).toContain('iPhone');
    });
  });

  describe('Preferences', () => {
    it('should update preferences', async () => {
      preferenceRepo.findOne.mockResolvedValue({ ...mockPreference });
      preferenceRepo.save.mockImplementation((entity) => entity);

      const result = await service.updatePreferences('user-1', {
        emailEnabled: false,
      });

      expect(result.emailEnabled).toBe(false);
    });
  });

  describe('Broadcast', () => {
    it('should broadcast to multiple users', async () => {
      notificationRepo.create.mockReturnValue(mockNotification);
      notificationRepo.save.mockResolvedValue(mockNotification);

      const result = await service.broadcast({
        type: 'system_announcement',
        title: 'Maintenance Notice',
        message: 'System will be down for maintenance',
        channel: 'email',
        userIds: ['user-1', 'user-2'],
      });

      expect(result.sent).toBe(2);
    });
  });
});
