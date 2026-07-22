import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface TemplateData {
  [key: string]: unknown;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get('EMAIL_FROM', 'noreply@pricebrain.com');
    this.fromName = this.configService.get('EMAIL_FROM_NAME', 'PriceBrain');
    this.isProduction = this.configService.get('NODE_ENV') === 'production';

    // Initialize Resend client if API key is available
    const apiKey = this.configService.get('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email service initialized');
    } else {
      this.resend = null as unknown as Resend;
      this.logger.warn('RESEND_API_KEY not configured - emails will be logged only');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      this.logger.log(`Sending email to ${options.to}: ${options.subject}`);

      // In development/staging, just log the email
      if (!this.isProduction || !this.resend) {
        this.logger.debug(`[DEV EMAIL] To: ${options.to}`);
        this.logger.debug(`[DEV EMAIL] Subject: ${options.subject}`);
        this.logger.debug(`[DEV EMAIL] Preview: ${options.html.substring(0, 200)}...`);
        return true;
      }

      // Production: send via Resend
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        this.logger.error(`Failed to send email via Resend: ${error.message}`);
        return false;
      }

      this.logger.log(`Email sent successfully via Resend: ${data?.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const appUrl = this.configService.get('APP_URL', 'http://localhost:3000');
    const subject = 'Welcome to PriceBrain! 🎉';
    const html = this.getTemplate('welcome', { name, email, appUrl });

    return this.sendEmail({ to: email, subject, html });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const appUrl = this.configService.get('APP_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your PriceBrain Password';
    const html = this.getTemplate('password-reset', { email, resetUrl, resetToken, appUrl });

    return this.sendEmail({ to: email, subject, html });
  }

  async sendPriceDropNotification(
    email: string,
    productName: string,
    oldPrice: number,
    newPrice: number,
    productUrl: string,
  ): Promise<boolean> {
    const dropPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    const subject = `💰 Price Drop Alert: ${productName}`;
    const html = this.getTemplate('price-drop', {
      email,
      productName,
      oldPrice: oldPrice.toLocaleString('en-IN'),
      newPrice: newPrice.toLocaleString('en-IN'),
      dropPercent,
      productUrl,
    });

    return this.sendEmail({ to: email, subject, html });
  }

  async sendBackInStockNotification(
    email: string,
    productName: string,
    productUrl: string,
  ): Promise<boolean> {
    const subject = `📦 Back in Stock: ${productName}`;
    const html = this.getTemplate('back-in-stock', { email, productName, productUrl });

    return this.sendEmail({ to: email, subject, html });
  }

  async sendCouponNotification(
    email: string,
    retailer: string,
    couponCode: string,
    discount: string,
    expiryDate: string,
  ): Promise<boolean> {
    const subject = `🎟️ New Coupon: ${discount} off at ${retailer}`;
    const html = this.getTemplate('coupon', {
      email,
      retailer,
      couponCode,
      discount,
      expiryDate,
    });

    return this.sendEmail({ to: email, subject, html });
  }

  async sendNewsletter(email: string, content: { title: string; body: string }): Promise<boolean> {
    const subject = content.title;
    const html = this.getTemplate('newsletter', { email, ...content });

    return this.sendEmail({ to: email, subject, html });
  }

  async sendNotificationEmail(
    email: string,
    title: string,
    message: string,
    actionUrl?: string,
    actionText?: string,
  ): Promise<boolean> {
    const subject = title;
    const html = this.getTemplate('notification', {
      email,
      title,
      message,
      actionUrl,
      actionText,
    });

    return this.sendEmail({ to: email, subject, html });
  }

  private getTemplate(templateName: string, data: TemplateData): string {
    const appUrl = (data.appUrl as string) || this.configService.get('APP_URL', 'http://localhost:3000');

    const templates: Record<string, (d: TemplateData, url: string) => string> = {
      welcome: (d, url) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to PriceBrain</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to PriceBrain! 🎉</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #0F172A;">Hi ${d.name},</p>
            <p style="color: #64748B; line-height: 1.6;">Thank you for joining PriceBrain! We're excited to help you find the best deals across 100+ retailers.</p>
            <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0F172A; margin-top: 0;">What you can do with PriceBrain:</h3>
              <ul style="color: #64748B;">
                <li>Compare prices from 100+ retailers</li>
                <li>Track price history</li>
                <li>Get notified of price drops</li>
                <li>Find exclusive coupons</li>
              </ul>
            </div>
            <a href="${url}" style="display: inline-block; background: #2563EB; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Start Shopping</a>
          </div>
        </body>
        </html>
      `,

      'password-reset': (d, url) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0F172A; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Reset Your Password</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #64748B;">You requested a password reset. Click the button below to set a new password:</p>
            <a href="${d.resetUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
            <p style="color: #94A3B8; font-size: 14px; margin-top: 20px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,

      'price-drop': (d, url) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Price Drop Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💰 Price Drop Alert!</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #0F172A; margin-top: 0;">${d.productName}</h2>
            <div style="display: flex; align-items: center; gap: 20px; margin: 20px 0;">
              <div style="text-align: center;">
                <p style="color: #94A3B8; margin: 0; font-size: 14px;">Was</p>
                <p style="color: #EF4444; text-decoration: line-through; margin: 0; font-size: 24px;">₹${d.oldPrice}</p>
              </div>
              <div style="font-size: 32px; color: #94A3B8;">→</div>
              <div style="text-align: center;">
                <p style="color: #94A3B8; margin: 0; font-size: 14px;">Now</p>
                <p style="color: #22C55E; margin: 0; font-size: 24px; font-weight: bold;">₹${d.newPrice}</p>
              </div>
              <div style="background: #DCFCE7; color: #16A34A; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
                ${d.dropPercent}% OFF
              </div>
            </div>
            <a href="${d.productUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Buy Now</a>
          </div>
        </body>
        </html>
      `,

      'back-in-stock': (d, url) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Back in Stock</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📦 Back in Stock!</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #64748B;">Good news! The product you were waiting for is available again:</p>
            <h2 style="color: #0F172A; margin-top: 0;">${d.productName}</h2>
            <a href="${d.productUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Shop Now</a>
          </div>
        </body>
        </html>
      `,

      coupon: (d, url) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Coupon</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎟️ New Coupon Available!</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #64748B;">Use this exclusive coupon at ${d.retailer}:</p>
            <div style="background: #F8FAFC; border: 2px dashed #CBD5E1; padding: 24px; text-align: center; margin: 20px 0;">
              <p style="color: #8B5CF6; font-size: 32px; font-weight: bold; margin: 0; font-family: monospace;">${d.couponCode}</p>
              <p style="color: #22C55E; font-size: 20px; margin: 10px 0 0 0; font-weight: 600;">${d.discount} OFF</p>
            </div>
            <p style="color: #94A3B8; font-size: 14px;">Valid until: ${d.expiryDate}</p>
          </div>
        </body>
        </html>
      `,

      newsletter: (d, url) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${d.title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0F172A; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">PriceBrain Newsletter</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #0F172A; margin-top: 0;">${d.title}</h2>
            <div style="color: #64748B; line-height: 1.8;">${d.body}</div>
          </div>
          <div style="text-align: center; padding: 20px; color: #94A3B8; font-size: 12px;">
            <p>You're receiving this email because you subscribed to PriceBrain newsletter.</p>
            <p><a href="${url}" style="color: #64748B;">Unsubscribe</a> | <a href="${url}" style="color: #64748B;">View in browser</a></p>
          </div>
        </body>
        </html>
      `,

      notification: (d, url) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${d.title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${d.title}</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="color: #64748B; line-height: 1.8; margin-bottom: 20px;">${d.message}</div>
            ${d.actionUrl ? `<a href="${d.actionUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">${d.actionText || 'View'}</a>` : ''}
          </div>
        </body>
        </html>
      `,
    };

    const template = templates[templateName];
    return template ? template(data, appUrl) : `<p>Email content for ${templateName}</p>`;
  }
}
