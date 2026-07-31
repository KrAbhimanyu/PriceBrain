import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { KernelService } from './kernel.service';
import { KernelController } from './kernel.controller';
import { Agent } from './entities/agent.entity';
import { AgentInstance } from './entities/agent-instance.entity';
import { KernelState } from './entities/kernel-state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agent, AgentInstance, KernelState]),
    ConfigModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [KernelController],
  providers: [KernelService],
  exports: [KernelService],
})
export class KernelModule {}
