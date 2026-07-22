import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { ScrapeProcessor } from './processors/scrape.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { EmailProcessor } from './processors/email.processor';
import { AnalyticsProcessor } from './processors/analytics.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
    BullModule.registerQueue(
      { name: 'scrape' },
      { name: 'notification' },
      { name: 'email' },
      { name: 'analytics' },
      { name: 'ai-matching' },
    ),
  ],
  providers: [
    QueueService,
    ScrapeProcessor,
    NotificationProcessor,
    EmailProcessor,
    AnalyticsProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
