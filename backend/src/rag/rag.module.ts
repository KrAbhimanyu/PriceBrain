import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  VectorStore,
  VectorCollection,
  QueryHistory,
  DocumentChunk,
} from './entities/rag.entity';
import { EmbeddingService } from './services/embedding.service';
import { VectorStoreService } from './services/vector-store.service';
import { RAGOrchestrationService } from './services/rag-orchestration.service';
import { RAGController } from './rag.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([VectorStore, VectorCollection, QueryHistory, DocumentChunk]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [RAGController],
  providers: [EmbeddingService, VectorStoreService, RAGOrchestrationService],
  exports: [EmbeddingService, VectorStoreService, RAGOrchestrationService],
})
export class RAGModule {}
