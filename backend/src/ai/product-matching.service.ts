import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { RetailerPrice } from '../products/entities/retailer-price.entity';
import { AIService } from './ai.service';
import { CacheService } from '../cache/cache.service';

interface MatchResult {
  sourceProductId: string;
  matchedProductId: string | null;
  confidence: number;
  matchType: 'exact' | 'high' | 'medium' | 'low' | 'none';
  reasoning: string;
}

interface ProductMatch {
  product1: string;
  product2: string;
  confidence: number;
  matchedAt: Date;
}

@Injectable()
export class ProductMatchingService {
  private readonly logger = new Logger(ProductMatchingService.name);
  private readonly MATCH_THRESHOLDS = {
    exact: 0.95,
    high: 0.85,
    medium: 0.70,
    low: 0.50,
  };

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(RetailerPrice)
    private retailerPriceRepository: Repository<RetailerPrice>,
    private aiService: AIService,
    private cacheService: CacheService,
  ) {}

  async matchProducts(sourceProductId: string): Promise<MatchResult> {
    const sourceProduct = await this.productRepository.findOne({
      where: { id: sourceProductId },
      relations: ['brand', 'category'],
    });

    if (!sourceProduct) {
      return {
        sourceProductId,
        matchedProductId: null,
        confidence: 0,
        matchType: 'none',
        reasoning: 'Source product not found',
      };
    }

    // First try exact matching by brand and similar names
    const exactMatch = await this.findExactMatch(sourceProduct);
    if (exactMatch) {
      return exactMatch;
    }

    // Then try fuzzy matching using text similarity
    const fuzzyMatch = await this.findFuzzyMatch(sourceProduct);
    if (fuzzyMatch) {
      return fuzzyMatch;
    }

    // Finally try AI-based semantic matching
    const aiMatch = await this.findAIMatch(sourceProduct);
    if (aiMatch) {
      return aiMatch;
    }

    return {
      sourceProductId,
      matchedProductId: null,
      confidence: 0,
      matchType: 'none',
      reasoning: 'No matching product found',
    };
  }

  private async findExactMatch(product: Product): Promise<MatchResult | null> {
    // Match by brand + very similar name (case insensitive)
    const normalizedName = this.normalizeProductName(product.name);

    const matches = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.id != :id', { id: product.id })
      .andWhere('product.brandId = :brandId', { brandId: product.brandId })
      .getMany();

    for (const match of matches) {
      const matchNormalizedName = this.normalizeProductName(match.name);
      if (normalizedName === matchNormalizedName) {
        return {
          sourceProductId: product.id,
          matchedProductId: match.id,
          confidence: 0.98,
          matchType: 'exact',
          reasoning: 'Exact match on brand and normalized product name',
        };
      }
    }

    return null;
  }

  private async findFuzzyMatch(product: Product): Promise<MatchResult | null> {
    // Use simple string similarity for fuzzy matching
    const normalizedName = this.normalizeProductName(product.name);
    const brandName = product.brand?.name?.toLowerCase() || '';

    // Search for products with similar names
    const searchTerms = normalizedName.split(' ').slice(0, 3).join(' ');

    const candidates = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.id != :id', { id: product.id })
      .andWhere('LOWER(product.name) LIKE LOWER(:term)', { term: `%${searchTerms}%` })
      .getMany();

    let bestMatch: { product: Product; similarity: number } | null = null;

    for (const candidate of candidates) {
      const candidateName = this.normalizeProductName(candidate.name);
      const similarity = this.calculateSimilarity(normalizedName, candidateName);

      if (similarity > this.MATCH_THRESHOLDS.medium) {
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { product: candidate, similarity };
        }
      }
    }

    if (bestMatch) {
      const matchType = this.getMatchType(bestMatch.similarity);
      return {
        sourceProductId: product.id,
        matchedProductId: bestMatch.product.id,
        confidence: bestMatch.similarity,
        matchType,
        reasoning: `Fuzzy match with ${(bestMatch.similarity * 100).toFixed(0)}% name similarity`,
      };
    }

    return null;
  }

  private async findAIMatch(product: Product): Promise<MatchResult | null> {
    try {
      // Generate embedding for the source product
      const sourceEmbedding = await this.aiService.getEmbedding(product.name);
      if (!sourceEmbedding) {
        return null;
      }

      // Get candidate products (limit to avoid performance issues)
      const candidates = await this.productRepository.find({
        where: { isActive: true },
        relations: ['brand'],
        take: 100,
      });

      let bestMatch: { product: Product; similarity: number } | null = null;

      for (const candidate of candidates) {
        if (candidate.id === product.id) continue;

        // Generate embedding for candidate
        const candidateEmbedding = await this.aiService.getEmbedding(candidate.name);
        if (!candidateEmbedding) continue;

        // Calculate cosine similarity
        const similarity = this.cosineSimilarity(sourceEmbedding.embedding, candidateEmbedding.embedding);

        if (similarity > this.MATCH_THRESHOLDS.low) {
          if (!bestMatch || similarity > bestMatch.similarity) {
            bestMatch = { product: candidate, similarity };
          }
        }
      }

      if (bestMatch && bestMatch.similarity > this.MATCH_THRESHOLDS.medium) {
        const matchType = this.getMatchType(bestMatch.similarity);
        return {
          sourceProductId: product.id,
          matchedProductId: bestMatch.product.id,
          confidence: bestMatch.similarity,
          matchType,
          reasoning: `AI semantic match with ${(bestMatch.similarity * 100).toFixed(0)}% confidence`,
        };
      }
    } catch (error) {
      this.logger.error('AI matching failed:', error);
    }

    return null;
  }

  async batchMatchProducts(productIds: string[]): Promise<MatchResult[]> {
    const results: MatchResult[] = [];

    for (const productId of productIds) {
      const result = await this.matchProducts(productId);
      results.push(result);

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  async findDuplicates(): Promise<Array<{ products: string[]; confidence: number }>> {
    // Find all potential duplicate products
    const products = await this.productRepository.find({
      where: { isActive: true },
      relations: ['brand'],
    });

    const duplicates: Array<{ products: string[]; confidence: number }> = [];
    const processed = new Set<string>();

    for (const product of products) {
      for (const other of products) {
        if (product.id === other.id || processed.has(`${product.id}-${other.id}`)) continue;

        const similarity = this.calculateSimilarity(
          this.normalizeProductName(product.name),
          this.normalizeProductName(other.name),
        );

        if (similarity > this.MATCH_THRESHOLDS.high) {
          duplicates.push({
            products: [product.id, other.id],
            confidence: similarity,
          });
          processed.add(`${product.id}-${other.id}`);
          processed.add(`${other.id}-${product.id}`);
        }
      }
    }

    return duplicates;
  }

  private normalizeProductName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(' '));
    const words2 = new Set(text2.split(' '));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  private getMatchType(confidence: number): 'exact' | 'high' | 'medium' | 'low' | 'none' {
    if (confidence >= this.MATCH_THRESHOLDS.exact) return 'exact';
    if (confidence >= this.MATCH_THRESHOLDS.high) return 'high';
    if (confidence >= this.MATCH_THRESHOLDS.medium) return 'medium';
    if (confidence >= this.MATCH_THRESHOLDS.low) return 'low';
    return 'none';
  }
}
