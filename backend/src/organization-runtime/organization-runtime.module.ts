import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  Organization,
  OrganizationMember,
  OrganizationAIInstance,
  OrganizationWorkflow,
} from './entities/organization-runtime.entity';
import { OrganizationRuntimeService } from './organization-runtime.service';
import { OrganizationRuntimeController } from './organization-runtime.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationMember,
      OrganizationAIInstance,
      OrganizationWorkflow,
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [OrganizationRuntimeController],
  providers: [OrganizationRuntimeService],
  exports: [OrganizationRuntimeService],
})
export class OrganizationRuntimeModule {}
