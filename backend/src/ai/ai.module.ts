import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiShoppingService } from './ai-shopping.service';
import { AiChatService } from './ai-chat.service';
import { AiController } from './ai.controller';
import { ChatConversation } from './entities/chat-conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Product } from '../products/entities/product.entity';
import { RetailerPrice } from '../products/entities/retailer-price.entity';
import { ScraperModule } from '../scraper/scraper.module';
import { RAGModule } from '../rag/rag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatConversation, ChatMessage, Product, RetailerPrice]),
    ScraperModule,
    RAGModule,
  ],
  controllers: [AiController],
  providers: [AiShoppingService, AiChatService],
  exports: [AiShoppingService, AiChatService],
})
export class AiModule {}
