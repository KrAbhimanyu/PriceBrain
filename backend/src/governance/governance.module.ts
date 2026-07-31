import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GovernancePolicy, GovernanceAudit, GovernanceReport } from './entities/governance.entity';
import { GovernanceService } from './governance.service';
import { GovernanceController } from './governance.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([GovernancePolicy, GovernanceAudit, GovernanceReport]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [GovernanceController],
  providers: [GovernanceService],
  exports: [GovernanceService],
})
export class GovernanceModule {}
