import { Controller, Get, Patch, Post, Param, Query, UseGuards, Req, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ============ In-App Notifications ============

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.findAll(user.id, page || 1, limit || 20);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    await this.notificationsService.markAsRead(id, user.id);
    return { success: true };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: User) {
    await this.notificationsService.markAllAsRead(user.id);
    return { success: true };
  }

  // ============ Push Notifications ============

  @Get('push/vapid-public-key')
  @Public()
  @ApiOperation({ summary: 'Get VAPID public key for push subscription' })
  async getVapidPublicKey() {
    return {
      publicKey: this.notificationsService.getVapidPublicKey(),
    };
  }

  @Post('push/subscribe')
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subscription: {
          type: 'object',
          properties: {
            endpoint: { type: 'string' },
            keys: {
              type: 'object',
              properties: {
                p256dh: { type: 'string' },
                auth: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  async subscribeToPush(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Body() body: { subscription: { endpoint: string; keys: { p256dh: string; auth: string } } },
  ) {
    const userAgent = (req as Request & { headers: { 'user-agent'?: string } }).headers?.['user-agent'];
    await this.notificationsService.subscribeToPush(user.id, body.subscription, userAgent);
    return { success: true };
  }

  @Delete('push/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        endpoint: { type: 'string' },
      },
    },
  })
  async unsubscribeFromPush(
    @CurrentUser() user: User,
    @Body() body: { endpoint: string },
  ) {
    await this.notificationsService.unsubscribeFromPush(user.id, body.endpoint);
    return { success: true };
  }

  @Get('push/status')
  @ApiOperation({ summary: 'Check push notification subscription status' })
  async getPushStatus(@CurrentUser() user: User) {
    const subscriptions = await this.notificationsService.getActiveSubscriptions(user.id);
    return {
      subscribed: subscriptions.length > 0,
      subscriptionCount: subscriptions.length,
    };
  }
}
