import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface EmbeddingResult {
  embedding: number[];
  model: string;
}

interface ClassificationResult {
  category: string;
  confidence: number;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly aiServiceUrl: string;
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.aiServiceUrl = this.configService.get('AI_SERVICE_URL', 'http://localhost:8000');
    this.apiKey = this.configService.get('AI_API_KEY', '');
  }

  async getEmbedding(text: string): Promise<EmbeddingResult | null> {
    // In production, this would call an AI service for embeddings
    // For now, we'll return a mock embedding based on text hash
    try {
      // Mock implementation - in production:
      // const response = await firstValueFrom(
      //   this.httpService.post(`${this.aiServiceUrl}/embeddings`, { text }, {
      //     headers: { Authorization: `Bearer ${this.apiKey}` },
      //   })
      // );
      // return response.data;

      // Generate deterministic mock embedding based on text
      const embedding = this.generateMockEmbedding(text);
      return { embedding, model: 'mock-embedder-v1' };
    } catch (error) {
      this.logger.error('Failed to get embedding:', error);
      return null;
    }
  }

  async classifyProduct(name: string, description?: string): Promise<ClassificationResult | null> {
    // In production, this would call an AI service for classification
    try {
      // Mock implementation
      const categories = ['electronics', 'fashion', 'home', 'beauty', 'sports', 'books'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      return { category, confidence: 0.85 + Math.random() * 0.1 };
    } catch (error) {
      this.logger.error('Failed to classify product:', error);
      return null;
    }
  }

  async generateDescription(productName: string, features: string[]): Promise<string | null> {
    // In production, this would use an LLM to generate descriptions
    try {
      // Mock implementation
      return `High-quality ${productName} with advanced features. ` +
        features.slice(0, 3).join('. ') + '. Perfect for everyday use.';
    } catch (error) {
      this.logger.error('Failed to generate description:', error);
      return null;
    }
  }

  async extractProductFeatures(text: string): Promise<string[]> {
    // In production, this would extract features from product descriptions
    try {
      // Mock implementation
      const commonFeatures = [
        'Premium Quality', 'Durable', 'Lightweight', 'Easy to Use',
        'Long Battery Life', 'Fast Charging', 'High Resolution',
        'Water Resistant', 'Compact Design', 'Eco Friendly',
      ];
      return commonFeatures.slice(0, Math.floor(Math.random() * 5) + 2);
    } catch (error) {
      this.logger.error('Failed to extract features:', error);
      return [];
    }
  }

  async detectDuplicates(productNames: string[]): Promise<Array<{ indices: number[]; confidence: number }>> {
    // In production, this would use embeddings to find duplicates
    try {
      const duplicates: Array<{ indices: number[]; confidence: number }> = [];
      
      // Simple mock: group products with similar names
      for (let i = 0; i < productNames.length; i++) {
        for (let j = i + 1; j < productNames.length; j++) {
          const similarity = this.calculateSimilarity(productNames[i], productNames[j]);
          if (similarity > 0.8) {
            duplicates.push({
              indices: [i, j],
              confidence: similarity,
            });
          }
        }
      }
      
      return duplicates;
    } catch (error) {
      this.logger.error('Failed to detect duplicates:', error);
      return [];
    }
  }

  private generateMockEmbedding(text: string): number[] {
    // Generate a deterministic 384-dimensional embedding based on text hash
    const dimension = 384;
    const embedding: number[] = [];
    let hash = 0;
    
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }
    
    for (let i = 0; i < dimension; i++) {
      // Use a combination of hash and position for deterministic results
      const seed = hash + i * 31;
      const value = Math.sin(seed) * 10000;
      embedding.push((value - Math.floor(value)) * 2 - 1); // Normalize to [-1, 1]
    }
    
    // Normalize the embedding
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => val / norm);
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  async generateSearchEmbedding(query: string): Promise<number[] | null> {
    const result = await this.getEmbedding(query);
    return result?.embedding ?? null;
  }
}
