import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VectorStoreService, SearchResult } from './vector-store.service';
import { EmbeddingService } from './embedding.service';
import { VectorType } from '../entities/rag.entity';
import { RAGQueryDto, RAGResponseDto } from '../dto/rag.dto';

@Injectable()
export class RAGOrchestrationService {
  private readonly logger = new Logger(RAGOrchestrationService.name);
  private openai: OpenAI | null = null;
  private readonly defaultModel = 'gpt-4o-mini';
  private readonly maxContextLength = 8000;

  constructor(
    private configService: ConfigService,
    private vectorStoreService: VectorStoreService,
    private embeddingService: EmbeddingService,
    private eventEmitter: EventEmitter2,
  ) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('RAG Orchestration initialized with OpenAI');
    }
  }

  async query(dto: RAGQueryDto): Promise<RAGResponseDto> {
    const startTime = Date.now();
    const {
      query,
      collection,
      userId,
      context,
      maxContextLength = this.maxContextLength,
      model,
    } = dto;

    let embeddingTime = 0;
    let retrievalTime = 0;
    let generationTime = 0;
    let tokensUsed = 0;
    let retrievedDocs: SearchResult[] = [];

    try {
      // Step 1: Retrieve relevant documents
      const retrievalStart = Date.now();
      retrievedDocs = await this.vectorStoreService.semanticSearch({
        query,
        entityTypes: collection ? undefined : [VectorType.PRODUCT, VectorType.KNOWLEDGE, VectorType.REVIEW],
        limit: 5,
        minSimilarity: 0.7,
        userId,
        collection,
      });
      retrievalTime = Date.now() - retrievalStart;

      // Step 2: Build context from retrieved documents
      const contextText = this.buildContext(retrievedDocs, maxContextLength);

      // Step 3: Build system prompt with context
      const systemPrompt = this.buildSystemPrompt(contextText, context);

      // Step 4: Generate response
      const generationStart = Date.now();
      const response = await this.generateResponse(query, systemPrompt, model);
      generationTime = Date.now() - generationStart;
      tokensUsed = response.tokensUsed || 0;

      // Step 5: Save query history
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      if (queryEmbedding) {
        await this.vectorStoreService.saveQuery(
          query,
          queryEmbedding.embedding,
          userId,
          retrievedDocs.map((d) => d.id),
          { response: response.answer, sources: retrievedDocs.length },
          Date.now() - startTime,
        );
      }

      // Emit analytics event
      this.eventEmitter.emit('rag.query', {
        query,
        response: response.answer,
        sourcesRetrieved: retrievedDocs.length,
        avgRelevanceScore: retrievedDocs.length > 0
          ? retrievedDocs.reduce((sum, d) => sum + d.score, 0) / retrievedDocs.length
          : 0,
        responseTimeMs: Date.now() - startTime,
        tokensUsed,
        embeddingTimeMs: embeddingTime,
        retrievalTimeMs: retrievalTime,
        generationTimeMs: generationTime,
        userId,
      });

      return {
        ...response,
        sources: retrievedDocs.map((d) => ({
          id: d.id,
          content: d.content.substring(0, 200) + (d.content.length > 200 ? '...' : ''),
          score: d.score,
          metadata: d.metadata,
        })),
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`RAG query failed: ${error}`);
      
      // Emit failed query event
      this.eventEmitter.emit('rag.query', {
        query,
        response: 'Error',
        sourcesRetrieved: retrievedDocs.length,
        avgRelevanceScore: 0,
        responseTimeMs: Date.now() - startTime,
        tokensUsed: 0,
        embeddingTimeMs: 0,
        retrievalTimeMs: 0,
        generationTimeMs: 0,
        userId,
      });
      
      return {
        answer: 'I apologize, but I encountered an error processing your request. Please try again.',
        sources: [],
        metadata: { error: true },
        responseTime: Date.now() - startTime,
      };
    }
  }

  async queryWithProducts(
    query: string,
    products: Array<{ id: string; name: string; description: string; price: number }>,
    userId?: string,
  ): Promise<RAGResponseDto> {
    const startTime = Date.now();

    try {
      // Step 1: Index products temporarily for this query
      const productVectors = await this.vectorStoreService.createBulkVectors(
        products.map((p) => ({
          entityType: VectorType.PRODUCT,
          entityId: p.id,
          content: `${p.name}. ${p.description}. Price: ₹${p.price}`,
          metadata: JSON.stringify({ price: p.price, name: p.name }),
          userId,
        })),
      );

      // Step 2: Search within indexed products
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      if (!queryEmbedding) {
        throw new Error('Failed to generate query embedding');
      }

      // Step 3: Build context from products
      const contextText = this.buildProductContext(products);

      // Step 4: Generate response
      const systemPrompt = this.buildProductSystemPrompt(contextText);
      const response = await this.generateResponse(query, systemPrompt);

      return {
        ...response,
        sources: products.map((p) => ({
          id: p.id,
          content: `${p.name} - ₹${p.price}`,
          score: 1,
          metadata: { price: p.price },
        })),
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Product query failed: ${error}`);
      return {
        answer: 'I apologize, but I encountered an error processing your request.',
        sources: [],
        responseTime: Date.now() - startTime,
      };
    }
  }

  async compareProducts(
    products: Array<{ id: string; name: string; specs: Record<string, any>; price: number }>,
  ): Promise<RAGResponseDto> {
    const startTime = Date.now();

    try {
      // Build comparison context
      let context = '## Product Comparison\n\n';
      products.forEach((p, i) => {
        context += `### Product ${i + 1}: ${p.name}\n`;
        context += `- Price: ₹${p.price}\n`;
        context += `- Specifications:\n`;
        Object.entries(p.specs).forEach(([key, value]) => {
          context += `  - ${key}: ${value}\n`;
        });
        context += '\n';
      });

      const systemPrompt = `You are a helpful shopping assistant specializing in product comparisons.
Analyze the products below and provide a detailed comparison with:
1. Key differences
2. Pros and cons of each
3. Best use cases
4. Value for money assessment
5. A clear recommendation

Format your response with markdown headers and bullet points for readability.`;

      const response = await this.generateResponse(
        `Compare these products and help me decide which one to buy: ${products.map((p) => p.name).join(' vs ')}`,
        systemPrompt,
      );

      return {
        ...response,
        sources: products.map((p) => ({
          id: p.id,
          content: `${p.name} - ₹${p.price}`,
          score: 1,
          metadata: { specs: p.specs },
        })),
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Product comparison failed: ${error}`);
      return {
        answer: 'I apologize, but I encountered an error comparing products.',
        sources: [],
        responseTime: Date.now() - startTime,
      };
    }
  }

  async recommendProducts(
    userPreferences: {
      budget?: number;
      useCase?: string;
      requirements?: string[];
    },
    availableProducts: Array<{ id: string; name: string; description: string; price: number; rating: number }>,
  ): Promise<RAGResponseDto> {
    const startTime = Date.now();

    try {
      // Build recommendation context
      let context = '## Available Products\n\n';
      availableProducts.forEach((p, i) => {
        context += `### Product ${i + 1}: ${p.name}\n`;
        context += `- Price: ₹${p.price}\n`;
        context += `- Rating: ${p.rating}⭐\n`;
        context += `- Description: ${p.description}\n\n`;
      });

      context += `\n## User Preferences:\n`;
      if (userPreferences.budget) context += `- Budget: ₹${userPreferences.budget}\n`;
      if (userPreferences.useCase) context += `- Use Case: ${userPreferences.useCase}\n`;
      if (userPreferences.requirements) {
        context += `- Requirements: ${userPreferences.requirements.join(', ')}\n`;
      }

      const systemPrompt = `You are a knowledgeable shopping advisor helping users find the best products.
Based on the user's preferences and available products, recommend the top 3 products that best match their needs.

For each recommendation, explain:
1. Why this product matches their needs
2. Key benefits
3. Any potential drawbacks
4. Value for money

Be specific and use actual product names and prices from the provided list.`;

      const response = await this.generateResponse(
        `Recommend the best products based on my preferences: Budget ₹${userPreferences.budget || 'any'}, Use case: ${userPreferences.useCase || 'general'}`,
        systemPrompt,
      );

      return {
        ...response,
        sources: availableProducts.map((p) => ({
          id: p.id,
          content: `${p.name} - ₹${p.price} (${p.rating}⭐)`,
          score: 1,
        })),
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Product recommendation failed: ${error}`);
      return {
        answer: 'I apologize, but I encountered an error generating recommendations.',
        sources: [],
        responseTime: Date.now() - startTime,
      };
    }
  }

  private buildContext(documents: SearchResult[], maxLength: number): string {
    let context = '';
    let totalLength = 0;

    for (const doc of documents) {
      const docText = `\n## ${doc.entityType}\n${doc.content}\n`;
      if (totalLength + docText.length > maxLength) {
        break;
      }
      context += docText;
      totalLength += docText.length;
    }

    return context || 'No relevant documents found.';
  }

  private buildProductContext(products: Array<{ name: string; description: string; price: number }>): string {
    let context = '## Available Products\n\n';

    products.forEach((p, i) => {
      context += `### ${i + 1}. ${p.name}\n`;
      context += `   - Price: ₹${p.price}\n`;
      context += `   - ${p.description}\n\n`;
    });

    return context;
  }

  private buildSystemPrompt(contextText: string, additionalContext?: Record<string, any>): string {
    let prompt = `You are PriceBrain, an intelligent shopping assistant for an Indian e-commerce platform.

## Context Information
${contextText}

## Instructions
- Use the context above to answer questions accurately
- Include specific product names and prices when available
- Suggest relevant Indian e-commerce websites (Amazon, Flipkart, etc.) when appropriate
- Keep responses concise but informative
- Format responses with bullet points and headers for readability
`;

    if (additionalContext) {
      prompt += `\n## Additional Context\n`;
      if (additionalContext.userPreferences) {
        prompt += `- User Budget: ₹${additionalContext.userPreferences.budget || 'not specified'}\n`;
        prompt += `- User Preferences: ${additionalContext.userPreferences.interests?.join(', ') || 'general'}\n`;
      }
    }

    return prompt;
  }

  private buildProductSystemPrompt(context: string): string {
    return `You are a helpful shopping assistant specializing in Indian e-commerce products.

${context}

## Instructions
- Answer questions based on the products provided above
- Include prices in INR (₹) format
- Be specific about product features and specifications
- Recommend products that offer the best value for money
- Format responses with clear sections and bullet points
`;
  }

  private async generateResponse(
    userQuery: string,
    systemPrompt: string,
    model?: string,
  ): Promise<{ answer: string; tokensUsed?: number }> {
    if (!this.openai) {
      // Fallback response without LLM
      return {
        answer: `Based on your query "${userQuery}", I found several relevant results. Please configure OPENAI_API_KEY for AI-powered responses.`,
      };
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: model || this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        answer: completion.choices[0]?.message?.content || 'I could not generate a response.',
        tokensUsed: completion.usage?.total_tokens,
      };
    } catch (error) {
      this.logger.error(`OpenAI completion failed: ${error}`);
      return {
        answer: 'I apologize, but I encountered an error generating a response. Please try again.',
      };
    }
  }
}
