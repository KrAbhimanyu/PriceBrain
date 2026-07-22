import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../../cache/cache.service';

interface CachedRequest {
  method: string;
  url: string;
  query: Record<string, any>;
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private cacheService: CacheService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<CachedRequest>();
    const { method, url, query } = request;

    // Only cache GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    // Generate cache key from URL and query
    const cacheKey = `http:${method}:${url}:${JSON.stringify(query)}`;

    // Check cache
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    // Handle the request and cache the response
    return next.handle().pipe(
      tap(async (data) => {
        // Cache successful responses for 5 minutes
        if (data && !data.error) {
          await this.cacheService.set(cacheKey, data, 300);
        }
      }),
    );
  }
}
