import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityMiddleware } from './security.middleware';

@Module({
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
