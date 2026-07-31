import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { Mission } from './entities/mission.entity';
import { MissionTask } from './entities/mission-task.entity';
import { MissionBudgetAllocation } from './entities/mission-budget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, MissionTask, MissionBudgetAllocation])],
  controllers: [MissionsController],
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}
