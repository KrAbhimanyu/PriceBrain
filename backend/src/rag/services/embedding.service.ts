import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokens: number;
}

export interface BulkEmbeddingResult {
  embeddings: number[][];
  model: string;
  totalTokens: number;
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private openai: OpenAI | null = null;
  private readonly defaultModel = 'text-embedding-3-small';
  private readonly dimensions = 1536;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI embedding service initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not configured - using fallback embeddings');
    }
  }

  async generateEmbedding(text: string, model?: string): Promise<EmbeddingResult | null> {
    const embeddingModel = model || this.defaultModel;

    if (!this.openai) {
      return this.generateFallbackEmbedding(text);
    }

    try {
      const startTime = Date.now();
      const response = await this.openai.embeddings.create({
        model: embeddingModel,
        input: text,
      });

      const embedding = response.data[0].embedding;
      const tokens = response.usage.total_tokens;

      this.logger.debug(`Generated embedding in ${Date.now() - startTime}ms, tokens: ${tokens}`);

      return {
        embedding,
        model: embeddingModel,
        tokens,
      };
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error}`);
      return this.generateFallbackEmbedding(text);
    }
  }

  async generateBulkEmbeddings(texts: string[], model?: string): Promise<BulkEmbeddingResult | null> {
    const embeddingModel = model || this.defaultModel;

    if (!this.openai) {
      const embeddings = texts.map((text) => this.generateFallbackEmbeddingSync(text));
      return {
        embeddings,
        model: 'fallback',
        totalTokens: 0,
      };
    }

    try {
      const startTime = Date.now();
      const response = await this.openai.embeddings.create({
        model: embeddingModel,
        input: texts,
      });

      const embeddings = response.data.map((d) => d.embedding);
      const totalTokens = response.usage.total_tokens;

      this.logger.debug(`Generated ${texts.length} embeddings in ${Date.now() - startTime}ms`);

      return {
        embeddings,
        model: embeddingModel,
        totalTokens,
      };
    } catch (error) {
      this.logger.error(`Failed to generate bulk embeddings: ${error}`);
      return null;
    }
  }

  async generateEmbeddingWithReduction(
    text: string,
    dimensions: number = 384,
  ): Promise<EmbeddingResult | null> {
    if (!this.openai) {
      return this.generateFallbackEmbedding(text);
    }

    try {
      const response = await this.openai.embeddings.create({
        model: this.defaultModel,
        input: text,
      });

      const fullEmbedding = response.data[0].embedding;
      // Simple dimensionality reduction (in production, use PCA or other techniques)
      const reduced = this.reduceDimensions(fullEmbedding, dimensions);

      return {
        embedding: reduced,
        model: `${this.defaultModel}-reduced-${dimensions}`,
        tokens: response.usage.total_tokens,
      };
    } catch (error) {
      this.logger.error(`Failed to generate reduced embedding: ${error}`);
      return this.generateFallbackEmbedding(text);
    }
  }

  private reduceDimensions(embedding: number[], targetDimensions: number): number[] {
    if (embedding.length <= targetDimensions) {
      return embedding;
    }

    // Simple downsampling - take evenly spaced values
    const step = embedding.length / targetDimensions;
    const reduced: number[] = [];

    for (let i = 0; i < targetDimensions; i++) {
      const index = Math.floor(i * step);
      reduced.push(embedding[index]);
    }

    return reduced;
  }

  // Fallback embedding using TF-IDF style approach when no API key
  private generateFallbackEmbedding(text: string): EmbeddingResult {
    const embedding = this.generateFallbackEmbeddingSync(text);
    return {
      embedding,
      model: 'fallback-tfidf',
      tokens: Math.ceil(text.length / 4),
    };
  }

  private generateFallbackEmbeddingSync(text: string): number[] {
    // Simple word frequency based embedding
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(this.dimensions).fill(0);

    // Simple hash-based embedding
    words.forEach((word, index) => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash = hash & hash;
      }

      const position = Math.abs(hash) % this.dimensions;
      embedding[position] += 1 / (index + 1);
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  // Calculate cosine similarity between two embeddings
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embedding dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return similarity;
  }

  // Batch cosine similarity calculation
  cosineSimilarities(queryEmbedding: number[], embeddings: number[][]): number[] {
    return embeddings.map((embedding) => this.cosineSimilarity(queryEmbedding, embedding));
  }
}
