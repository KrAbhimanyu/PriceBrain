import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class RateLimitService implements OnModuleInit {
  private readonly windowMs = 60000; // 1 minute window
  private readonly limits: Record<string, { limit: number; window: number }> = {
    default: { limit: 100, window: this.windowMs },
    auth: { limit: 10, window: this.windowMs },
    search: { limit: 30, window: this.windowMs },
    api: { limit: 1000, window: this.windowMs },
  };

  constructor(private redisService: RedisService) {}

  async checkRateLimit(key: string, type: string = 'default'): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const config = this.limits[type] || this.limits.default;
    const now = Date.now();
    const windowStart = now - config.window;
    const redisKey = `ratelimit:${type}:${key}`;

    try {
      // Remove old entries
      await this.redisService.delPattern(`${redisKey}:*`);

      // Get current count
      const count = await this.redisService.get<number>(redisKey) || 0;
      const remaining = Math.max(0, config.limit - count - 1);
      const resetTime = now + config.window;

      if (count >= config.limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
        };
      }

      // Increment counter
      await this.redisService.set(redisKey, count + 1, Math.ceil(config.window / 1000));

      return {
        allowed: true,
        remaining,
        resetTime,
      };
    } catch {
      // If Redis fails, allow the request
      return {
        allowed: true,
        remaining: config.limit,
        resetTime: now + config.window,
      };
    }
  }

  async resetRateLimit(key: string, type: string = 'default'): Promise<void> {
    const redisKey = `ratelimit:${type}:${key}`;
    await this.redisService.del(redisKey);
  }

  onModuleInit() {
    // Initialize rate limit keys
  }
}
