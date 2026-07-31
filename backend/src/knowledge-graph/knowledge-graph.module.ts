import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  KnowledgeGraphEntity,
  KnowledgeGraphRelation,
  KnowledgeGraphQuery,
} from './entities/knowledge-graph.entity';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { KnowledgeGraphController } from './knowledge-graph.controller';
import { RAGModule } from '../rag/rag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KnowledgeGraphEntity, KnowledgeGraphRelation, KnowledgeGraphQuery]),
    EventEmitterModule.forRoot(),
    RAGModule,
  ],
  controllers: [KnowledgeGraphController],
  providers: [KnowledgeGraphService],
  exports: [KnowledgeGraphService],
})
export class KnowledgeGraphModule {}
