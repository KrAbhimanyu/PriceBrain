import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecisionService } from './decision.service';
import { DecisionController } from './decision.controller';
import { AiDecisionLog } from './entities/ai-decision.entity';
import { AgentMetric } from './entities/agent-metric.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiDecisionLog, AgentMetric])],
  controllers: [DecisionController],
  providers: [DecisionService],
  exports: [DecisionService],
})
export class DecisionModule {}
