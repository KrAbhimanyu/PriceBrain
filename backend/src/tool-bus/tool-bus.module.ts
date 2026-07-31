import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolBusService } from './tool-bus.service';
import { ToolBusController } from './tool-bus.controller';
import { Tool } from './entities/tool.entity';
import { ToolInvocation } from './entities/tool-invocation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tool, ToolInvocation])],
  controllers: [ToolBusController],
  providers: [ToolBusService],
  exports: [ToolBusService],
})
export class ToolBusModule {}
