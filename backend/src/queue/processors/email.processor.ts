import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('send-email')
  async handleEmail(job: Job<{
    to: string;
    subject: string;
    template: string;
    data?: any;
  }>) {
    const { to, subject, template, data } = job.data;
    this.logger.log(`Processing email job ${job.id}: ${subject} to ${to}`);

    try {
      // In production, this would:
      // 1. Load email template
      // 2. Render template with data
      // 3. Send via email service (SendGrid, AWS SES, etc.)

      this.logger.log(`Email sent successfully to ${to}: ${subject}`);
      return { success: true, to, subject };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  @Process('send-bulk-email')
  async handleBulkEmail(job: Job<{
    recipients: string[];
    subject: string;
    template: string;
    data?: any;
  }>) {
    const { recipients, subject, template, data } = job.data;
    this.logger.log(`Processing bulk email to ${recipients.length} recipients`);

    try {
      // Send emails in batches to avoid rate limits
      const batchSize = 100;
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        // Send batch...
        this.logger.log(`Sent batch ${Math.floor(i / batchSize) + 1}`);
      }

      return { success: true, recipients: recipients.length };
    } catch (error) {
      this.logger.error('Failed to send bulk email:', error);
      throw error;
    }
  }
}
