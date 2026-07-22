import { Injectable } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityService {
  private readonly allowedOrigins: string[];

  constructor(private configService: ConfigService) {
    this.allowedOrigins = (this.configService.get<string>('CORS_ORIGINS') || 'http://localhost:3000')
      .split(',')
      .map((origin: string) => origin.trim());
  }

  getHelmet() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          scriptSrc: ["'self'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
          connectSrc: ["'self'", "https://api.pricebrain.com", "wss:"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    });
  }

  getCorsOptions() {
    return {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || this.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept-Language'],
      exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
      credentials: true,
      maxAge: 86400, // 24 hours
    };
  }

  sanitizeInput(input: string): string {
    if (!input) return '';
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .trim();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  hashSensitiveData(data: string): string {
    // Simple hash for logging purposes (not for passwords)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `***${hash.toString(16).slice(-4)}`;
  }
}
