import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { AskBrainController } from './askbrain.controller';
import { AskBrainCoreService } from './services/askbrain-core.service';
import {
  AskBrainUserContext,
  AskBrainUserProfile,
} from './entities/user-context.entity';
import {
  AskBrainRecommendation,
  AskBrainOutfitRecommendation,
  AskBrainPriceHistory,
  AskBrainFakeReview,
} from './entities/shopping-intelligence.entity';
import {
  AskBrainMission,
  AskBrainMissionTask,
  AskBrainLifeTimeline,
  AskBrainDigitalWardrobe,
  AskBrainAIMemory,
} from './entities/life-intelligence.entity';
import { RAGModule } from '../rag/rag.module';
import { KnowledgeGraphModule } from '../knowledge-graph/knowledge-graph.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AskBrainUserContext,
      AskBrainUserProfile,
      AskBrainRecommendation,
      AskBrainOutfitRecommendation,
      AskBrainPriceHistory,
      AskBrainFakeReview,
      AskBrainMission,
      AskBrainMissionTask,
      AskBrainLifeTimeline,
      AskBrainDigitalWardrobe,
      AskBrainAIMemory,
    ]),
    EventEmitterModule.forRoot(),
    ConfigModule,
    RAGModule,
    KnowledgeGraphModule,
  ],
  controllers: [AskBrainController],
  providers: [AskBrainCoreService],
  exports: [AskBrainCoreService],
})
export class AskBrainModule {}
