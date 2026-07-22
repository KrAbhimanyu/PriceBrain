import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

interface ScrapeJob {
  retailer: string;
  productUrl?: string;
  category?: string;
  priority?: 'high' | 'normal' | 'low';
}

interface NotificationJob {
  userId: string;
  type: 'price_drop' | 'back_in_stock' | 'coupon' | 'deal';
  title: string;
  message: string;
  data?: any;
}

interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data?: any;
}

interface AnalyticsJob {
  type: 'search' | 'click' | 'page_view' | 'conversion';
  userId?: string;
  productId?: string;
  data?: any;
}

interface AIMatchJob {
  productId: string;
  priority?: 'high' | 'normal';
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('scrape') private scrapeQueue: Queue<ScrapeJob>,
    @InjectQueue('notification') private notificationQueue: Queue<NotificationJob>,
    @InjectQueue('email') private emailQueue: Queue<EmailJob>,
    @InjectQueue('analytics') private analyticsQueue: Queue<AnalyticsJob>,
    @InjectQueue('ai-matching') private aiMatchQueue: Queue<AIMatchJob>,
  ) {}

  // Scrape Queue Methods
  async addScrapeJob(job: ScrapeJob): Promise<string> {
    const priority = job.priority === 'high' ? 1 : job.priority === 'low' ? 10 : 5;
    const result = await this.scrapeQueue.add(job, { priority });
    this.logger.log(`Added scrape job: ${result.id}`);
    return result.id as string;
  }

  async addBulkScrapeJobs(jobs: ScrapeJob[]): Promise<string[]> {
    const results = await this.scrapeQueue.addBulk(
      jobs.map((job) => ({
        data: job,
        opts: {
          priority: job.priority === 'high' ? 1 : job.priority === 'low' ? 10 : 5,
        },
      })),
    );
    this.logger.log(`Added ${jobs.length} scrape jobs`);
    return results.map((r) => r.id as string);
  }

  // Notification Queue Methods
  async addNotificationJob(job: NotificationJob): Promise<string> {
    const result = await this.notificationQueue.add(job, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    });
    this.logger.log(`Added notification job: ${result.id}`);
    return result.id as string;
  }

  // Email Queue Methods
  async addEmailJob(job: EmailJob): Promise<string> {
    const result = await this.emailQueue.add(job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    this.logger.log(`Added email job: ${result.id}`);
    return result.id as string;
  }

  // Analytics Queue Methods
  async addAnalyticsJob(job: AnalyticsJob): Promise<string> {
    const result = await this.analyticsQueue.add(job, {
      removeOnComplete: true,
    });
    return result.id as string;
  }

  // AI Matching Queue Methods
  async addAIMatchJob(job: AIMatchJob): Promise<string> {
    const result = await this.aiMatchQueue.add(job, {
      priority: job.priority === 'high' ? 1 : 5,
    });
    this.logger.log(`Added AI match job: ${result.id}`);
    return result.id as string;
  }

  // Batch Processing
  async scheduleBulkScrape(retailer: string, urls: string[]): Promise<string[]> {
    const jobs: ScrapeJob[] = urls.map((url) => ({
      retailer,
      productUrl: url,
      priority: 'normal',
    }));
    return this.addBulkScrapeJobs(jobs);
  }

  // Price Alert Notifications
  async notifyPriceDrop(
    userId: string,
    productId: string,
    productName: string,
    oldPrice: number,
    newPrice: number,
  ): Promise<void> {
    const drop = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    await this.addNotificationJob({
      userId,
      type: 'price_drop',
      title: `Price Drop: ${productName}`,
      message: `Good news! ${productName} dropped by ${drop}% from ₹${oldPrice.toLocaleString()} to ₹${newPrice.toLocaleString()}`,
      data: { productId, oldPrice, newPrice, drop },
    });
  }

  async notifyBackInStock(
    userId: string,
    productId: string,
    productName: string,
  ): Promise<void> {
    await this.addNotificationJob({
      userId,
      type: 'back_in_stock',
      title: `Back in Stock: ${productName}`,
      message: `${productName} is now available! Don't miss out.`,
      data: { productId },
    });
  }

  async notifyNewCoupon(
    userId: string,
    couponCode: string,
    retailer: string,
    discount: string,
  ): Promise<void> {
    await this.addNotificationJob({
      userId,
      type: 'coupon',
      title: `New Coupon: ${couponCode}`,
      message: `${retailer} has a new ${discount} coupon: ${couponCode}`,
      data: { couponCode, retailer, discount },
    });
  }

  // Analytics Tracking
  async trackSearch(userId: string | undefined, query: string): Promise<void> {
    await this.addAnalyticsJob({
      type: 'search',
      userId,
      data: { query },
    });
  }

  async trackClick(
    userId: string | undefined,
    productId: string,
    retailer: string,
  ): Promise<void> {
    await this.addAnalyticsJob({
      type: 'click',
      userId,
      productId,
      data: { retailer },
    });
  }

  async trackConversion(
    userId: string | undefined,
    productId: string,
    revenue: number,
  ): Promise<void> {
    await this.addAnalyticsJob({
      type: 'conversion',
      userId,
      productId,
      data: { revenue },
    });
  }

  // Queue Statistics
  async getQueueStats(): Promise<{
    scrape: any;
    notification: any;
    email: any;
    analytics: any;
    'ai-matching': any;
  }> {
    const [scrape, notification, email, analytics, aiMatching] = await Promise.all([
      this.scrapeQueue.getJobCounts(),
      this.notificationQueue.getJobCounts(),
      this.emailQueue.getJobCounts(),
      this.analyticsQueue.getJobCounts(),
      this.aiMatchQueue.getJobCounts(),
    ]);

    return { scrape, notification, email, analytics, 'ai-matching': aiMatching };
  }
}
