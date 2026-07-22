import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { Product } from '../products/entities/product.entity';
import { RetailerPrice } from '../products/entities/retailer-price.entity';
import { ScraperService } from '../scraper/scraper.service';

export interface SearchResult {
  query: string;
  products: Product[];
  summary: string;
}

export interface ProductComparison {
  products: Product[];
  comparison: {
    field: string;
    values: Record<string, string | number>;
    winner?: string;
  }[];
  prosCons: {
    productId: string;
    pros: string[];
    cons: string[];
  }[];
}

export interface ProductRecommendation {
  product: Product;
  score: number;
  reasons: string[];
}

export interface BuyRecommendation {
  recommendation: 'buy_now' | 'wait' | 'consider';
  confidence: number;
  reasoning: string;
  pricePrediction?: {
    expectedDrop?: number;
    timeframe?: string;
  };
}

@Injectable()
export class AiShoppingService {
  private readonly logger = new Logger(AiShoppingService.name);
  private openai: OpenAI | null = null;
  private readonly model: string;
  private readonly isEnabled: boolean;

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(RetailerPrice)
    private retailerPriceRepository: Repository<RetailerPrice>,
    private scraperService: ScraperService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    this.model = this.configService.get('OPENAI_MODEL', 'gpt-4o-mini');
    this.isEnabled = !!apiKey;

    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not configured - using mock responses');
    }
  }

  // ============ Natural Language Search ============

  async searchProducts(query: string, userId?: string): Promise<SearchResult> {
    // Extract intent and entities from natural language
    const intent = await this.extractIntent(query);
    this.logger.log(`Search intent: ${intent.intent}, entities: ${JSON.stringify(intent.entities)}`);

    // Build query
    const dbQuery = this.buildSearchQuery(intent);
    
    // Search products
    let products = await this.productRepository.find({
      where: dbQuery,
      relations: ['retailerPrices', 'brand', 'category'],
      take: 20,
      order: { isFeatured: 'DESC', updatedAt: 'DESC' },
    });

    // If no results, search by name
    if (products.length === 0) {
      products = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.retailerPrices', 'rp')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.category', 'category')
        .where('LOWER(product.name) LIKE LOWER(:name)', { name: `%${intent.rawQuery}%` })
        .take(20)
        .getMany();
    }

    // Generate AI summary if enabled
    let summary = '';
    if (this.openai && products.length > 0) {
      summary = await this.generateSearchSummary(query, products);
    } else {
      summary = `Found ${products.length} products matching "${intent.rawQuery}"`;
    }

    return { query: intent.rawQuery, products, summary };
  }

  private async extractIntent(query: string): Promise<{ intent: string; entities: Record<string, string>; rawQuery: string }> {
    if (!this.openai) {
      return { intent: 'search', entities: {}, rawQuery: query };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a shopping assistant. Extract intent from user queries. 
Return JSON with: intent (search|compare|recommend|analyze), entities (category, brand, price_range, features), rawQuery (cleaned search query).
Examples:
- "best phones under 30k" -> {"intent":"search","entities":{"category":"phone","price_range":"under 30000"},"rawQuery":"phones"}`,
          },
          { role: 'user', content: query },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      return content ? JSON.parse(content) : { intent: 'search', entities: {}, rawQuery: query };
    } catch (error) {
      this.logger.error('Intent extraction failed:', error);
      return { intent: 'search', entities: {}, rawQuery: query };
    }
  }

  private buildSearchQuery(intent: { entities: Record<string, string> }): Record<string, unknown> {
    const query: Record<string, unknown> = { isActive: true };
    
    if (intent.entities.category) {
      query.categoryId = intent.entities.category;
    }
    if (intent.entities.brand) {
      query.brandId = intent.entities.brand;
    }
    
    return query;
  }

  private async generateSearchSummary(query: string, products: Product[]): Promise<string> {
    if (!this.openai) return `Found ${products.length} products`;

    try {
      const productList = products.slice(0, 5).map(p => 
        `- ${p.name}: ₹${p.lowestPrice} - ₹${p.highestPrice}`
      ).join('\n');

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful shopping assistant. Summarize search results in 1-2 sentences.',
          },
          {
            role: 'user',
            content: `User searched for "${query}". Products found:\n${productList}\n\nGive a brief summary.`,
          },
        ],
      });

      return response.choices[0]?.message?.content || `Found ${products.length} products`;
    } catch {
      return `Found ${products.length} products matching "${query}"`;
    }
  }

  // ============ Product Comparison ============

  async compareProducts(productIds: string[]): Promise<ProductComparison> {
    const products = await this.productRepository.find({
      where: productIds.map(id => ({ id })) as any,
      relations: ['retailerPrices', 'brand', 'category'],
    });

    if (products.length < 2) {
      throw new Error('At least 2 products required for comparison');
    }

    // Generate comparison fields
    const comparison = this.generateComparisonFields(products);

    // Generate pros and cons
    const prosCons = this.openai 
      ? await this.generateProsCons(products)
      : products.map(p => ({ productId: p.id, pros: ['Good value'], cons: ['Limited options'] }));

    return { products, comparison, prosCons };
  }

  private generateComparisonFields(products: Product[]) {
    const fields: ProductComparison['comparison'] = [];

    // Price comparison
    const prices = products.map(p => ({
      id: p.id,
      value: Number(p.lowestPrice),
      formatted: `₹${Number(p.lowestPrice).toLocaleString('en-IN')}`,
    }));
    const minPrice = Math.min(...prices.map(p => p.value));
    fields.push({
      field: 'Price',
      values: Object.fromEntries(prices.map(p => [p.id, p.formatted])),
      winner: prices.find(p => p.value === minPrice)?.id,
    });

    // Rating comparison (mock)
    fields.push({
      field: 'Rating',
      values: Object.fromEntries(products.map(p => [p.id, '4.2/5'])),
      winner: products[0].id,
    });

    return fields;
  }

  private async generateProsCons(products: Product[]): Promise<ProductComparison['prosCons']> {
    if (!this.openai) return [];

    try {
      const productList = products.map(p => 
        `${p.name} (₹${p.lowestPrice})`
      ).join(', ');

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'Generate pros and cons for each product. Return JSON array with productId, pros[], cons[].',
          },
          {
            role: 'user',
            content: `Compare: ${productList}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return parsed.prosCons || products.map(p => ({ productId: p.id, pros: ['Good'], cons: ['Limited'] }));
      }
    } catch (error) {
      this.logger.error('Pros/cons generation failed:', error);
    }

    return products.map(p => ({ productId: p.id, pros: ['Good value'], cons: ['May be expensive'] }));
  }

  // ============ Buy Now / Wait Recommendation ============

  async getBuyRecommendation(productId: string): Promise<BuyRecommendation> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['retailerPrices'],
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Get price history (mock for now)
    const priceHistory = await this.getPriceHistory(productId);
    
    // Calculate recommendation
    if (!this.openai) {
      return this.calculateBasicRecommendation(product, priceHistory);
    }

    try {
      const currentPrice = Number(product.lowestPrice);
      const priceHistoryStr = priceHistory.slice(-7).map(p => 
        `Day ${p.day}: ₹${p.price}`
      ).join(', ');

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a price analysis expert. Analyze price history and give buy recommendations.
Return JSON: recommendation (buy_now|wait|consider), confidence (0-1), reasoning (string), pricePrediction (expectedDrop %, timeframe).`,
          },
          {
            role: 'user',
            content: `Product: ${product.name}\nCurrent Price: ₹${currentPrice}\n7-day history: ${priceHistoryStr}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return {
          recommendation: parsed.recommendation || 'consider',
          confidence: parsed.confidence || 0.5,
          reasoning: parsed.reasoning || 'Based on price analysis',
          pricePrediction: parsed.pricePrediction,
        };
      }
    } catch (error) {
      this.logger.error('Buy recommendation failed:', error);
    }

    return this.calculateBasicRecommendation(product, priceHistory);
  }

  private async getPriceHistory(productId: string): Promise<{ day: number; price: number }[]> {
    // Mock price history - in production, fetch from database
    const history = [];
    const basePrice = 25000 + Math.random() * 10000;
    for (let i = 7; i >= 0; i--) {
      history.push({ day: i, price: basePrice + (Math.random() - 0.5) * 2000 });
    }
    return history;
  }

  private calculateBasicRecommendation(product: Product, priceHistory: { day: number; price: number }[]): BuyRecommendation {
    const currentPrice = Number(product.lowestPrice);
    const avgPrice = priceHistory.reduce((sum, p) => sum + p.price, 0) / priceHistory.length;
    const minPrice = Math.min(...priceHistory.map(p => p.price));
    const maxPrice = Math.max(...priceHistory.map(p => p.price));

    const priceRatio = currentPrice / avgPrice;
    const isLowest = currentPrice <= minPrice * 1.05;
    const isHighest = currentPrice >= maxPrice * 0.95;

    if (isLowest) {
      return {
        recommendation: 'buy_now',
        confidence: 0.8,
        reasoning: `This is one of the lowest prices we've seen (₹${currentPrice.toLocaleString()}).`,
      };
    }

    if (isHighest || priceRatio > 1.1) {
      return {
        recommendation: 'wait',
        confidence: 0.7,
        reasoning: 'Price is higher than usual. Consider waiting for a better deal.',
        pricePrediction: { expectedDrop: 10, timeframe: '1-2 weeks' },
      };
    }

    return {
      recommendation: 'consider',
      confidence: 0.6,
      reasoning: 'Price is near average. Good time to buy if you need it.',
    };
  }

  // ============ Alternative Products ============

  async getAlternatives(productId: string, limit = 5): Promise<ProductRecommendation[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['category', 'brand'],
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Find similar products in same category
    const alternatives = await this.productRepository.find({
      where: { 
        categoryId: product.categoryId,
        isActive: true,
      },
      relations: ['retailerPrices', 'brand'],
      take: limit + 1,
    });

    // Filter out the original product
    const filtered = alternatives.filter(p => p.id !== productId);

    // Score and rank
    return filtered.slice(0, limit).map(p => ({
      product: p,
      score: this.calculateSimilarityScore(product, p),
      reasons: this.generateReasons(product, p),
    }));
  }

  private calculateSimilarityScore(original: Product, candidate: Product): number {
    let score = 0.5; // Base score

    // Same category
    if (original.categoryId === candidate.categoryId) score += 0.2;
    
    // Price similarity
    const origPrice = Number(original.lowestPrice);
    const candPrice = Number(candidate.lowestPrice);
    const priceDiff = Math.abs(origPrice - candPrice) / origPrice;
    if (priceDiff < 0.2) score += 0.2;
    else if (priceDiff < 0.5) score += 0.1;

    // Same brand
    if (original.brandId === candidate.brandId) score += 0.1;

    return Math.min(score, 1);
  }

  private generateReasons(original: Product, candidate: Product): string[] {
    const reasons: string[] = [];
    const origPrice = Number(original.lowestPrice);
    const candPrice = Number(candidate.lowestPrice);

    if (candPrice < origPrice) {
      reasons.push(`₹${Math.round(origPrice - candPrice).toLocaleString('en-IN')} cheaper`);
    } else if (candPrice > origPrice) {
      reasons.push('Premium option');
    }

    if (original.categoryId === candidate.categoryId) {
      reasons.push('Same category');
    }

    if (original.brandId === candidate.brandId) {
      reasons.push('Same brand');
    }

    return reasons.length > 0 ? reasons : ['Similar product'];
  }

  // ============ AI Chat Response ============

  async generateChatResponse(
    userMessage: string,
    conversationHistory: { role: string; content: string }[],
  ): Promise<{ response: string; action?: string; products?: string[] }> {
    if (!this.openai) {
      return { response: 'AI features require OpenAI API key. Please configure OPENAI_API_KEY.', action: 'info' };
    }

    try {
      // Extract intent from message
      const intent = await this.extractIntent(userMessage);

      // Build messages for OpenAI
      const systemPrompt = `You are PriceBrain, an AI shopping assistant. Help users find products, compare prices, and make smart buying decisions.
Current time: ${new Date().toISOString()}
Always be helpful, concise, and provide specific recommendations.`;

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10).map(m => ({ role: m.role as 'system' | 'user' | 'assistant', content: m.content })),
        { role: 'user', content: userMessage },
      ];

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || '';
      
      // Determine action based on intent
      let action: string | undefined;
      if (intent.intent === 'search') action = 'search';
      else if (intent.intent === 'compare') action = 'compare';
      else if (intent.intent === 'recommend') action = 'recommend';

      return { response: content, action };
    } catch (error) {
      this.logger.error('Chat response generation failed:', error);
      return { response: 'Sorry, I encountered an error. Please try again.', action: 'error' };
    }
  }
}
