import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { RedisService } from './redis.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        ttl: 60000, // default TTL: 60 seconds
        max: 1000, // max items in cache
      }),
    }),
  ],
  providers: [RedisService, CacheService],
  exports: [NestCacheModule, RedisService, CacheService],
})
export class CacheModule {}
