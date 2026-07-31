import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { Event, EventStatus } from './entities/event.entity';
import { EventType } from './entities/event-type.entity';
import { EventSubscription, EndpointType } from './entities/event-subscription.entity';
import {
  PublishEventDto,
  CreateEventTypeDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  QueryEventsDto,
} from './dto/event-mesh.dto';

export interface EventContext {
  eventId: string;
  eventType: string;
  source: string;
  payload: Record<string, any>;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class EventMeshService {
  private readonly logger = new Logger(EventMeshService.name);
  private eventQueue: Map<string, Event> = new Map();
  private readonly MAX_QUEUE_SIZE = 10000;
  private isProcessing = false;

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(EventType)
    private eventTypeRepository: Repository<EventType>,
    @InjectRepository(EventSubscription)
    private subscriptionRepository: Repository<EventSubscription>,
    private eventEmitter: EventEmitter2,
    private httpService: HttpService,
  ) {
    this.startEventProcessor();
  }

  // ============ EVENT PUBLISHING ============

  async publish(dto: PublishEventDto): Promise<Event> {
    // Validate event type exists
    let eventType = await this.eventTypeRepository.findOne({
      where: { name: dto.eventType },
    });

    if (!eventType) {
      // Auto-register new event types
      eventType = await this.eventTypeRepository.save({
        name: dto.eventType,
        category: 'custom',
        isSystem: false,
      });
      this.logger.log(`Auto-registered new event type: ${dto.eventType}`);
    }

    // Create event
    const event = this.eventRepository.create({
      eventType: dto.eventType,
      source: dto.source,
      sourceId: dto.sourceId,
      correlationId: dto.correlationId,
      causationId: dto.causationId,
      priority: dto.priority || 0,
      payload: dto.payload,
      metadata: dto.metadata || {},
      status: EventStatus.PUBLISHED,
    });

    const saved = await this.eventRepository.save(event);

    // Add to queue for processing
    this.addToQueue(saved);

    // Emit internal event
    this.eventEmitter.emit(`event.${dto.eventType}`, saved);

    this.logger.debug(`Event published: ${dto.eventType} [${saved.id}]`);

    return saved;
  }

  // ============ EVENT QUERYING ============

  async findEvents(query: QueryEventsDto): Promise<Event[]> {
    const qb = this.eventRepository.createQueryBuilder('e');

    if (query.eventType) {
      qb.andWhere('e.eventType = :eventType', { eventType: query.eventType });
    }

    if (query.source) {
      qb.andWhere('e.source = :source', { source: query.source });
    }

    if (query.status) {
      qb.andWhere('e.status = :status', { status: query.status });
    }

    if (query.correlationId) {
      qb.andWhere('e.correlationId = :correlationId', {
        correlationId: query.correlationId,
      });
    }

    if (query.from) {
      qb.andWhere('e.publishedAt >= :from', { from: new Date(query.from) });
    }

    if (query.to) {
      qb.andWhere('e.publishedAt <= :to', { to: new Date(query.to) });
    }

    return qb
      .orderBy('e.publishedAt', 'DESC')
      .take(query.limit || 100)
      .getMany();
  }

  async getEvent(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return event;
  }

  async replayEvent(id: string): Promise<Event> {
    const event = await this.getEvent(id);

    // Reset status
    event.status = EventStatus.PUBLISHED;
    event.retryCount = 0;
    event.errorMessage = null;

    const saved = await this.eventRepository.save(event);
    this.addToQueue(saved);

    return saved;
  }

  // ============ EVENT TYPES ============

  async createEventType(dto: CreateEventTypeDto): Promise<EventType> {
    return this.eventTypeRepository.save(dto);
  }

  async findEventTypes(category?: string): Promise<EventType[]> {
    const where = category ? { category } : {};
    return this.eventTypeRepository.find({ where, order: { name: 'ASC' } });
  }

  // ============ SUBSCRIPTIONS ============

  async createSubscription(userId: string, dto: CreateSubscriptionDto): Promise<EventSubscription> {
    const subscription = this.subscriptionRepository.create({
      ...dto,
      userId,
      isActive: true,
      isSystem: false,
    });
    return this.subscriptionRepository.save(subscription);
  }

  async findSubscriptions(userId?: string, organizationId?: string): Promise<EventSubscription[]> {
    const qb = this.subscriptionRepository.createQueryBuilder('s')
      .where('s.isActive = true');

    if (userId) {
      qb.andWhere('s.userId = :userId', { userId });
    }

    if (organizationId) {
      qb.andWhere('(s.organizationId = :orgId OR s.organizationId IS NULL)', { orgId: organizationId });
    }

    return qb.orderBy('s.createdAt', 'DESC').getMany();
  }

  async updateSubscription(id: string, userId: string, dto: UpdateSubscriptionDto): Promise<EventSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id, userId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }

    Object.assign(subscription, dto);
    return this.subscriptionRepository.save(subscription);
  }

  async deleteSubscription(id: string, userId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id, userId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }

    await this.subscriptionRepository.remove(subscription);
  }

  async toggleSubscription(id: string, userId: string): Promise<EventSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id, userId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }

    subscription.isActive = !subscription.isActive;
    return this.subscriptionRepository.save(subscription);
  }

  // ============ EVENT PROCESSING ============

  private addToQueue(event: Event): void {
    if (this.eventQueue.size >= this.MAX_QUEUE_SIZE) {
      // Remove oldest event
      const firstKey = this.eventQueue.keys().next().value;
      if (firstKey) {
        this.eventQueue.delete(firstKey);
      }
    }

    // Sort by priority
    const events = Array.from(this.eventQueue.values());
    events.push(event);
    events.sort((a, b) => b.priority - a.priority || 
      a.publishedAt.getTime() - b.publishedAt.getTime());

    this.eventQueue.clear();
    for (const e of events) {
      this.eventQueue.set(e.id, e);
    }
  }

  private startEventProcessor(): void {
    setInterval(async () => {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        await this.processQueue();
      } finally {
        this.isProcessing = false;
      }
    }, 100); // Process every 100ms
  }

  private async processQueue(): Promise<void> {
    const events = Array.from(this.eventQueue.values()).slice(0, 100);

    for (const event of events) {
      try {
        await this.processEvent(event);
        this.eventQueue.delete(event.id);
      } catch (error) {
        this.logger.error(`Event processing failed: ${error.message}`);
        await this.handleFailedEvent(event, error.message);
        this.eventQueue.delete(event.id);
      }
    }
  }

  private async processEvent(event: Event): Promise<void> {
    // Update status to processing
    await this.eventRepository.update(event.id, {
      status: EventStatus.PROCESSING,
    });

    // Find matching subscriptions
    const subscriptions = await this.findMatchingSubscriptions(event);

    // Deliver to each subscription
    const deliveryPromises = subscriptions.map((sub) =>
      this.deliverEvent(sub, event),
    );

    await Promise.allSettled(deliveryPromises);

    // Mark as processed
    await this.eventRepository.update(event.id, {
      status: EventStatus.PROCESSED,
      processedAt: new Date(),
    });
  }

  private async findMatchingSubscriptions(event: Event): Promise<EventSubscription[]> {
    const allSubscriptions = await this.subscriptionRepository.find({
      where: { isActive: true },
    });

    return allSubscriptions.filter((sub) => {
      // Check if event type matches
      if (sub.eventTypes.length > 0 && !sub.eventTypes.includes(event.eventType)) {
        return false;
      }

      // Check wildcard pattern
      if (sub.eventPattern === '*') {
        return true;
      }

      // Check pattern match
      const pattern = sub.eventPattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(event.eventType);
    });
  }

  private async deliverEvent(subscription: EventSubscription, event: Event): Promise<void> {
    switch (subscription.endpointType) {
      case EndpointType.WEBHOOK:
        await this.deliverWebhook(subscription, event);
        break;
      case EndpointType.EMAIL:
        await this.deliverEmail(subscription, event);
        break;
      case EndpointType.QUEUE:
        // Add to message queue (implementation depends on queue system)
        this.logger.log(`Queued event ${event.id} for subscription ${subscription.id}`);
        break;
      case EndpointType.FUNCTION:
        // Invoke serverless function
        this.logger.log(`Invoking function for event ${event.id}`);
        break;
    }
  }

  private async deliverWebhook(subscription: EventSubscription, event: Event): Promise<void> {
    if (!subscription.endpointUrl) return;

    try {
      await this.httpService.post(subscription.endpointUrl, {
        event,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Event-ID': event.id,
          'X-Event-Type': event.eventType,
          ...subscription.headers,
        },
      }).toPromise();

      this.logger.debug(`Webhook delivered: ${subscription.endpointUrl}`);
    } catch (error) {
      this.logger.error(`Webhook delivery failed: ${error.message}`);
      throw error;
    }
  }

  private async deliverEmail(subscription: EventSubscription, event: Event): Promise<void> {
    // Would integrate with email service
    this.logger.log(`Email notification for event ${event.id}`);
  }

  private async handleFailedEvent(event: Event, error: string): Promise<void> {
    const newRetryCount = event.retryCount + 1;

    if (newRetryCount < event.maxRetries) {
      // Retry later
      await this.eventRepository.update(event.id, {
        retryCount: newRetryCount,
        errorMessage: error,
      });
      this.addToQueue({ ...event, retryCount: newRetryCount });
    } else {
      // Move to dead letter
      await this.eventRepository.update(event.id, {
        status: EventStatus.DEAD_LETTER,
        retryCount: newRetryCount,
        errorMessage: error,
      });
      this.logger.warn(`Event ${event.id} moved to dead letter queue`);
    }
  }

  // ============ STATISTICS ============

  async getEventStats(days = 7): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    avgProcessingTime: number;
  }> {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const events = await this.eventRepository.find({
      where: {
        publishedAt: MoreThan(from),
      },
    });

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalProcessingTime = 0;
    let processedCount = 0;

    for (const event of events) {
      byType[event.eventType] = (byType[event.eventType] || 0) + 1;
      byStatus[event.status] = (byStatus[event.status] || 0) + 1;

      if (event.processedAt) {
        totalProcessingTime += 
          event.processedAt.getTime() - event.publishedAt.getTime();
        processedCount++;
      }
    }

    return {
      total: events.length,
      byType,
      byStatus,
      avgProcessingTime: processedCount > 0 ? totalProcessingTime / processedCount : 0,
    };
  }

  // ============ CLEANUP ============

  async cleanupOldEvents(daysToKeep = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    const result = await this.eventRepository.delete({
      publishedAt: LessThan(cutoff),
      status: EventStatus.PROCESSED,
    });

    this.logger.log(`Cleaned up ${result.affected} old events`);
    return result.affected || 0;
  }
}
