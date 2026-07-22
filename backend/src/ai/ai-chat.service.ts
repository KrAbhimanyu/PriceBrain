import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatConversation } from './entities/chat-conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { AiShoppingService } from './ai-shopping.service';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    @InjectRepository(ChatConversation)
    private conversationRepository: Repository<ChatConversation>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
    private aiShoppingService: AiShoppingService,
  ) {}

  // ============ Conversations ============

  async createConversation(userId: string, title?: string, context?: string, type = 'shopping'): Promise<ChatConversation> {
    const conversation = this.conversationRepository.create({
      userId,
      title: title || 'New Chat',
      context,
      type,
    });
    return this.conversationRepository.save(conversation);
  }

  async getConversations(userId: string, limit = 20): Promise<ChatConversation[]> {
    return this.conversationRepository.find({
      where: { userId, isActive: true },
      relations: ['messages'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });
  }

  async getConversation(conversationId: string, userId: string): Promise<ChatConversation | null> {
    return this.conversationRepository.findOne({
      where: { id: conversationId, userId },
      relations: ['messages'],
    });
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    await this.conversationRepository.update(
      { id: conversationId, userId },
      { isActive: false },
    );
  }

  async updateConversationTitle(conversationId: string, userId: string, title: string): Promise<void> {
    await this.conversationRepository.update(
      { id: conversationId, userId },
      { title },
    );
  }

  // ============ Messages ============

  async sendMessage(
    conversationId: string,
    userId: string,
    content: string,
  ): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
    // Get conversation
    const conversation = await this.getConversation(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Save user message
    const userMessage = this.messageRepository.create({
      conversationId,
      role: 'user',
      content,
    });
    await this.messageRepository.save(userMessage);

    // Get conversation history
    const history = await this.getMessageHistory(conversationId);
    const historyForAI = history.map(m => ({ role: m.role, content: m.content }));

    // Generate AI response
    const aiResponse = await this.aiShoppingService.generateChatResponse(content, historyForAI);

    // Save assistant message
    const assistantMessage = this.messageRepository.create({
      conversationId,
      role: 'assistant',
      content: aiResponse.response,
      metadata: {
        action: aiResponse.action as 'search' | 'recommend' | 'compare' | 'analyze',
        products: aiResponse.products,
      },
    });
    await this.messageRepository.save(assistantMessage);

    // Update conversation
    await this.conversationRepository.update(conversationId, {
      updatedAt: new Date(),
    });

    return { userMessage, assistantMessage };
  }

  async getMessageHistory(conversationId: string): Promise<ChatMessage[]> {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async getConversationsWithLastMessage(userId: string, limit = 20): Promise<Array<ChatConversation & { lastMessage: ChatMessage | null }>> {
    const conversations = await this.conversationRepository.find({
      where: { userId, isActive: true },
      order: { updatedAt: 'DESC' },
      take: limit,
    });

    const result = [];
    for (const conv of conversations) {
      const lastMessage = await this.messageRepository.findOne({
        where: { conversationId: conv.id },
        order: { createdAt: 'DESC' },
      });
      result.push({ ...conv, lastMessage });
    }

    return result;
  }

  async clearHistory(conversationId: string, userId: string): Promise<void> {
    await this.messageRepository.delete({ conversationId });
  }
}
