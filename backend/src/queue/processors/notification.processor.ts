import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  @Process('send-notification')
  async handleNotification(job: Job<{
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }>) {
    const { userId, type, title, message, data } = job.data;
    this.logger.log(`Processing notification for user ${userId}: ${title}`);

    try {
      // In production, this would:
      // 1. Look up user's notification preferences
      // 2. Save notification to database
      // 3. If user is online, push via WebSocket
      // 4. Queue email if preference is set

      this.logger.log(`Notification sent to user ${userId}: ${title}`);
      return { success: true, userId, type };
    } catch (error) {
      this.logger.error(`Failed to send notification to ${userId}:`, error);
      throw error;
    }
  }
}
