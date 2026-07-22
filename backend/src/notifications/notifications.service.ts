import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { Notification } from './entities/notification.entity';
import { PushSubscription } from './entities/push-subscription.entity';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly vapidPublicKey: string;
  private readonly vapidPrivateKey: string;
  private readonly isProduction: boolean;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(PushSubscription)
    private pushSubscriptionsRepository: Repository<PushSubscription>,
    private configService: ConfigService,
  ) {
    this.vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY', '');
    this.vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY', '');
    this.isProduction = this.configService.get('NODE_ENV') === 'production';

    // Initialize web-push with VAPID keys if available
    if (this.vapidPublicKey && this.vapidPrivateKey) {
      webpush.setVapidDetails(
        `mailto:${this.configService.get('VAPID_EMAIL', 'noreply@pricebrain.com')}`,
        this.vapidPublicKey,
        this.vapidPrivateKey,
      );
      this.logger.log('Web-push initialized with VAPID keys');
    } else {
      this.logger.warn('VAPID keys not configured - push notifications will be logged only');
    }
  }

  // ============ In-App Notifications ============

  async findAll(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.notificationsRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationsRepository.update({ id, userId }, { isRead: true });
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.update({ userId }, { isRead: true });
  }

  async create(userId: string, data: Partial<Notification>) {
    const notification = this.notificationsRepository.create({ ...data, userId });
    return this.notificationsRepository.save(notification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
  }

  // ============ Push Notification Subscriptions ============

  async subscribeToPush(
    userId: string,
    subscription: PushSubscriptionData,
    userAgent?: string,
  ) {
    // Check if subscription already exists
    const existing = await this.pushSubscriptionsRepository.findOne({
      where: { userId, endpoint: subscription.endpoint },
    });

    if (existing) {
      // Update existing subscription
      existing.p256dh = subscription.keys.p256dh;
      existing.auth = subscription.keys.auth;
      existing.isActive = true;
      existing.userAgent = userAgent || null;
      return this.pushSubscriptionsRepository.save(existing);
    }

    // Create new subscription
    const newSubscription = this.pushSubscriptionsRepository.create({
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent || null,
      isActive: true,
    });

    return this.pushSubscriptionsRepository.save(newSubscription);
  }

  async unsubscribeFromPush(userId: string, endpoint: string) {
    await this.pushSubscriptionsRepository.update(
      { userId, endpoint },
      { isActive: false },
    );
  }

  async getActiveSubscriptions(userId: string): Promise<PushSubscription[]> {
    return this.pushSubscriptionsRepository.find({
      where: { userId, isActive: true },
    });
  }

  // ============ Push Notification Sending ============

  async sendPushNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: Record<string, unknown>;
    },
  ) {
    const subscriptions = await this.getActiveSubscriptions(userId);

    if (subscriptions.length === 0) {
      this.logger.debug(`No active push subscriptions for user ${userId}`);
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: notification.badge || '/icons/badge-72x72.png',
      tag: notification.tag || 'pricebrain-notification',
      data: notification.data,
    });

    for (const sub of subscriptions) {
      try {
        if (!this.isProduction || !this.vapidPublicKey) {
          // Log in development
          this.logger.debug(`[DEV PUSH] to ${sub.endpoint}: ${notification.title}`);
          success++;
          continue;
        }

        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
        success++;
        this.logger.debug(`Push sent successfully to ${sub.endpoint}`);
      } catch (error: unknown) {
        const err = error as { statusCode?: number };
        this.logger.error(`Failed to send push to ${sub.endpoint}: ${err?.statusCode || error}`);

        // Remove invalid subscriptions
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await this.pushSubscriptionsRepository.update(
            { id: sub.id },
            { isActive: false },
          );
          this.logger.debug(`Deactivated invalid subscription ${sub.id}`);
        }
        failed++;
      }
    }

    return { success, failed };
  }

  // ============ Convenience Methods for Specific Notifications ============

  async notifyPriceDrop(
    userId: string,
    product: { name: string; slug: string; imageUrl?: string },
    oldPrice: number,
    newPrice: number,
  ) {
    const dropPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

    // Create in-app notification
    await this.create(userId, {
      title: '💰 Price Drop Alert!',
      message: `${product.name} dropped by ${dropPercent}%! Was ₹${oldPrice.toLocaleString()}, now ₹${newPrice.toLocaleString()}`,
      type: 'price_drop',
      link: `/product/${product.slug}`,
    });

    // Send push notification
    return this.sendPushNotification(userId, {
      title: '💰 Price Drop Alert!',
      body: `${product.name} is now ₹${newPrice.toLocaleString()} (-${dropPercent}%)`,
      icon: product.imageUrl,
      tag: 'price-drop',
      data: { type: 'price_drop', productSlug: product.slug },
    });
  }

  async notifyWishlistItemBackInStock(
    userId: string,
    product: { name: string; slug: string; imageUrl?: string },
  ) {
    // Create in-app notification
    await this.create(userId, {
      title: '📦 Back in Stock!',
      message: `${product.name} is available again!`,
      type: 'back_in_stock',
      link: `/product/${product.slug}`,
    });

    // Send push notification
    return this.sendPushNotification(userId, {
      title: '📦 Back in Stock!',
      body: `${product.name} is available again. Don't miss out!`,
      icon: product.imageUrl,
      tag: 'back-in-stock',
      data: { type: 'back_in_stock', productSlug: product.slug },
    });
  }

  async notifyNewDeal(
    userId: string,
    deal: { title: string; description?: string; link: string; retailerName?: string },
  ) {
    // Create in-app notification
    await this.create(userId, {
      title: `🎉 New Deal: ${deal.retailerName || 'Hot Deal'}`,
      message: deal.title + (deal.description ? `: ${deal.description}` : ''),
      type: 'deal',
      link: deal.link,
    });

    // Send push notification
    return this.sendPushNotification(userId, {
      title: `🎉 New Deal${deal.retailerName ? ` from ${deal.retailerName}` : ''}!`,
      body: deal.title,
      tag: 'deal',
      data: { type: 'deal', link: deal.link },
    });
  }

  // ============ VAPID Keys ============

  getVapidPublicKey(): string {
    return this.vapidPublicKey;
  }
}
