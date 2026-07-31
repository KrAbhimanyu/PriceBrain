import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EnterpriseMemory, MemoryAssociation } from './entities/memory.entity';
import { EnterpriseMemoryService } from './enterprise-memory.service';
import { EnterpriseMemoryController } from './enterprise-memory.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnterpriseMemory, MemoryAssociation]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [EnterpriseMemoryController],
  providers: [EnterpriseMemoryService],
  exports: [EnterpriseMemoryService],
})
export class EnterpriseMemoryModule {}
