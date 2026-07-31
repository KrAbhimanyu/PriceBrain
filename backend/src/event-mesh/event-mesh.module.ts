import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { EventMeshService } from './event-mesh.service';
import { EventMeshController } from './event-mesh.controller';
import { Event } from './entities/event.entity';
import { EventType } from './entities/event-type.entity';
import { EventSubscription } from './entities/event-subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventType, EventSubscription]),
    HttpModule,
  ],
  controllers: [EventMeshController],
  providers: [EventMeshService],
  exports: [EventMeshService],
})
export class EventMeshModule {}
