import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutiveService } from './executive.service';
import { ExecutiveController } from './executive.controller';
import { ChiefAIAgent, ExecutiveDecision } from './entities/executive.entity';
import { Organization } from '../enterprise/entities/organization.entity';
import { Department } from '../enterprise/entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChiefAIAgent,
      ExecutiveDecision,
      Organization,
      Department,
    ]),
  ],
  controllers: [ExecutiveController],
  providers: [ExecutiveService],
  exports: [ExecutiveService],
})
export class ExecutiveModule {}
