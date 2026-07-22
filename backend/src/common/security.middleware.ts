import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from './security.service';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Security');

  constructor(private securityService: SecurityService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      this.sanitizeObject(req.body);
    }

    // Log security-relevant events
    this.logSecurityEvent(req);

    // Set security headers manually (Helmet handles most)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
  }

  private sanitizeObject(obj: Record<string, any>): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = this.securityService.sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitizeObject(obj[key]);
      }
    }
  }

  private logSecurityEvent(req: Request): void {
    const { method, ip, path } = req;
    const userAgent = req.get('user-agent') || 'unknown';

    // Log suspicious patterns
    const suspiciousPatterns = [
      /\.\./, // Path traversal
      /<script/i, // XSS
      /union.*select/i, // SQL injection
      /eval\s*\(/i, // Code injection
      /base64_decode/i, // Obfuscation
    ];

    const bodyStr = JSON.stringify(req.body) || '';
    const queryStr = JSON.stringify(req.query) || '';

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(bodyStr) || pattern.test(queryStr) || pattern.test(path)) {
        this.logger.warn(`Suspicious request detected: ${method} ${path}`, {
          ip,
          userAgent,
          pattern: pattern.source,
        });
        break;
      }
    }
  }
}
