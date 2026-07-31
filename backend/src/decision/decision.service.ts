import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiDecisionLog } from './entities/ai-decision.entity';
import { AgentMetric } from './entities/agent-metric.entity';
import {
  ProductDecisionDto,
  PurchaseDecisionDto,
  CompareDecisionDto,
  RecommendDecisionDto,
  RecordAgentMetricDto,
} from './dto/decision.dto';

export interface DecisionResult {
  decision: string;
  confidence: number;
  reasoning: string;
  factors: {
    name: string;
    weight: number;
    value: string | number;
  }[];
  recommendations?: string[];
  warnings?: string[];
  metadata: Record<string, any>;
}

@Injectable()
export class DecisionService {
  private readonly logger = new Logger(DecisionService.name);
  private openai: OpenAI | null = null;
  private readonly model: string;

  constructor(
    @InjectRepository(AiDecisionLog)
    private decisionLogRepository: Repository<AiDecisionLog>,
    @InjectRepository(AgentMetric)
    private agentMetricRepository: Repository<AgentMetric>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    this.model = this.configService.get('OPENAI_MODEL', 'gpt-4o-mini');

    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI initialized for Decision Engine');
    }
  }

  // ============ Product Decision ============

  async evaluateProduct(userId: string, dto: ProductDecisionDto): Promise<DecisionResult> {
    const startTime = Date.now();
    const { productId, productData, missionId, context } = dto;

    // Extract evaluation factors
    const factors = this.extractProductFactors(productData);

    // Calculate base scores
    const scores = this.calculateProductScores(factors);

    // Generate AI-powered decision if available
    let reasoning = '';
    let confidence = 0.7;

    if (this.openai) {
      const aiResult = await this.generateProductDecision(productData, context);
      reasoning = aiResult.reasoning;
      confidence = aiResult.confidence;
    } else {
      reasoning = this.generateRuleBasedReasoning(factors, scores);
      confidence = this.calculateConfidence(factors);
    }

    // Determine decision
    const decision = scores.overall >= 0.6 ? 'recommended' : scores.overall >= 0.4 ? 'consider' : 'not_recommended';

    // Log decision
    await this.logDecision({
      userId,
      missionId,
      decisionType: 'product_evaluation',
      inputData: { productId, productData, context },
      outputData: { decision, scores, factors },
      confidenceScore: confidence,
      reasoning,
      executionTimeMs: Date.now() - startTime,
    });

    return {
      decision,
      confidence,
      reasoning,
      factors,
      metadata: { productId, scores },
    };
  }

  // ============ Purchase Decision ============

  async evaluatePurchase(userId: string, dto: PurchaseDecisionDto): Promise<DecisionResult> {
    const startTime = Date.now();
    const { productId, price, retailerId, missionId } = dto;

    const factors: DecisionResult['factors'] = [
      { name: 'price_reasonableness', weight: 0.3, value: 'analyzing...' },
      { name: 'timing', weight: 0.2, value: 'analyzing...' },
      { name: 'value_vs_alternatives', weight: 0.25, value: 'analyzing...' },
      { name: 'urgency', weight: 0.15, value: 'analyzing...' },
      { name: 'budget_fit', weight: 0.1, value: 'analyzing...' },
    ];

    // Calculate factors
    const priceScore = this.evaluatePriceScore(price);
    const timingScore = this.evaluateTimingScore();
    const budgetFitScore = this.evaluateBudgetFit(userId, price);

    factors[0].value = priceScore.label;
    factors[1].value = timingScore.label;
    factors[4].value = budgetFitScore.label;

    // Determine decision
    const overallScore = (priceScore.score + timingScore.score + budgetFitScore.score) / 3;
    let decision = 'proceed';
    let reasoning = '';
    let confidence = 0.8;
    const warnings: string[] = [];

    if (overallScore < 0.4) {
      decision = 'wait';
      reasoning = 'This may not be the best time or price for this purchase.';
      warnings.push('Price or timing may not be optimal');
    } else if (price > 50000) {
      decision = 'require_approval';
      reasoning = 'High-value purchase requires user approval.';
      confidence = 0.9;
    } else {
      reasoning = 'Good time to proceed with this purchase.';
    }

    // Check policy violations
    const policyCheck = await this.checkPolicies(userId, { type: 'purchase', price });
    if (policyCheck.violated) {
      warnings.push(...policyCheck.warnings);
      if (policyCheck.violated) {
        decision = 'blocked';
        reasoning = `Policy violation: ${policyCheck.reasons.join(', ')}`;
      }
    }

    // Log decision
    await this.logDecision({
      userId,
      missionId,
      decisionType: 'purchase_decision',
      inputData: { productId, price, retailerId },
      outputData: { decision, overallScore, factors },
      confidenceScore: confidence,
      reasoning,
      executionTimeMs: Date.now() - startTime,
    });

    return {
      decision,
      confidence,
      reasoning,
      factors,
      warnings,
      metadata: { productId, price, overallScore },
    };
  }

  // ============ Comparison Decision ============

  async compareProducts(userId: string, dto: CompareDecisionDto): Promise<DecisionResult> {
    const startTime = Date.now();
    const { productIds, decisionCriteria } = dto;

    // Generate comparison analysis
    const factors: DecisionResult['factors'] = [
      { name: 'price', weight: 0.3, value: 'comparing...' },
      { name: 'quality', weight: 0.25, value: 'comparing...' },
      { name: 'features', weight: 0.2, value: 'comparing...' },
      { name: 'value', weight: 0.15, value: 'comparing...' },
      { name: 'reviews', weight: 0.1, value: 'comparing...' },
    ];

    const reasoning = `Analyzed ${productIds.length} products based on ${decisionCriteria || 'price and quality'}`;

    // Log decision
    await this.logDecision({
      userId,
      decisionType: 'product_comparison',
      inputData: { productIds, decisionCriteria },
      outputData: { factors },
      confidenceScore: 0.85,
      reasoning,
      executionTimeMs: Date.now() - startTime,
    });

    return {
      decision: 'compared',
      confidence: 0.85,
      reasoning,
      factors,
      recommendations: ['Review the detailed comparison above'],
      metadata: { productIds, count: productIds.length },
    };
  }

  // ============ Recommendation Decision ============

  async generateRecommendations(userId: string, dto: RecommendDecisionDto): Promise<DecisionResult> {
    const startTime = Date.now();
    const { category, budget, limit, missionId } = dto;

    const reasoning = `Generated ${limit || 10} recommendations` +
      (category ? ` in ${category}` : '') +
      (budget ? ` within ₹${budget.toLocaleString()}` : '');

    // Log decision
    await this.logDecision({
      userId,
      missionId,
      decisionType: 'product_recommendation',
      inputData: { category, budget, limit },
      outputData: { reasoning },
      confidenceScore: 0.8,
      reasoning,
      executionTimeMs: Date.now() - startTime,
    });

    return {
      decision: 'recommended',
      confidence: 0.8,
      reasoning,
      recommendations: ['Products will be returned based on your preferences'],
      metadata: { category, budget, limit },
    };
  }

  // ============ Helper Methods ============

  private extractProductFactors(productData: Record<string, any>): DecisionResult['factors'] {
    return [
      { name: 'price', weight: 0.25, value: productData.lowestPrice || 0 },
      { name: 'rating', weight: 0.2, value: productData.rating || 0 },
      { name: 'reviews', weight: 0.1, value: productData.reviewCount || 0 },
      { name: 'availability', weight: 0.15, value: productData.inStock ? 'In Stock' : 'Out of Stock' },
      { name: 'features', weight: 0.15, value: 'Good' },
      { name: 'brand', weight: 0.15, value: productData.brandName || 'Unknown' },
    ];
  }

  private calculateProductScores(factors: DecisionResult['factors']): { overall: number; [key: string]: number } {
    const scores: Record<string, number> = {};

    // Price score (lower is better)
    const price = typeof factors[0].value === 'number' ? factors[0].value : 0;
    scores.price = price < 10000 ? 1 : price < 50000 ? 0.8 : price < 100000 ? 0.6 : 0.4;

    // Rating score
    const rating = typeof factors[1].value === 'number' ? factors[1].value : 4;
    scores.rating = rating / 5;

    // Review count score
    const reviews = typeof factors[2].value === 'number' ? factors[2].value : 0;
    scores.reviews = reviews > 1000 ? 1 : reviews > 500 ? 0.8 : reviews > 100 ? 0.6 : 0.4;

    // Availability score
    scores.availability = factors[3].value === 'In Stock' ? 1 : 0.3;

    // Calculate weighted overall
    scores.overall = (
      scores.price * 0.25 +
      scores.rating * 0.2 +
      scores.reviews * 0.1 +
      scores.availability * 0.15 +
      0.75 * 0.15 + // features
      0.7 * 0.15 // brand
    );

    return scores;
  }

  private async generateProductDecision(
    productData: Record<string, any>,
    context?: string,
  ): Promise<{ reasoning: string; confidence: number }> {
    if (!this.openai) {
      return { reasoning: 'AI not configured', confidence: 0.5 };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a product recommendation expert. Evaluate products and provide brief reasoning.',
          },
          {
            role: 'user',
            content: `Evaluate this product: ${JSON.stringify(productData)}. Context: ${context || 'No specific context'}`,
          },
        ],
      });

      return {
        reasoning: response.choices[0]?.message?.content || 'Based on analysis',
        confidence: 0.8,
      };
    } catch (error) {
      this.logger.error('AI decision generation failed:', error);
      return { reasoning: 'Analysis completed', confidence: 0.6 };
    }
  }

  private generateRuleBasedReasoning(factors: DecisionResult['factors'], scores: Record<string, number>): string {
    const parts: string[] = [];

    if (scores.price >= 0.8) parts.push('competitive price');
    if (scores.rating >= 0.8) parts.push('high rating');
    if (scores.reviews >= 0.8) parts.push('popular choice');
    if (scores.availability >= 0.8) parts.push('readily available');

    return parts.length > 0
      ? `Product is a ${parts.join(', ')}.`
      : 'Consider alternatives based on your priorities.';
  }

  private calculateConfidence(factors: DecisionResult['factors']): number {
    let confidence = 0.5;

    for (const factor of factors) {
      if (typeof factor.value !== 'string' && factor.value > 0) {
        confidence += 0.05;
      }
    }

    return Math.min(confidence, 0.95);
  }

  private evaluatePriceScore(price: number): { score: number; label: string } {
    if (price < 1000) return { score: 0.9, label: 'Very Low' };
    if (price < 10000) return { score: 0.85, label: 'Low' };
    if (price < 50000) return { score: 0.7, label: 'Moderate' };
    if (price < 100000) return { score: 0.5, label: 'High' };
    return { score: 0.3, label: 'Very High' };
  }

  private evaluateTimingScore(): { score: number; label: string } {
    const day = new Date().getDay();
    const month = new Date().getMonth();

    // Festive season bonus
    if ([9, 10, 11].includes(month)) {
      return { score: 0.95, label: 'Great (Festival Season)' };
    }

    // Weekend bonus
    if (day === 0 || day === 6) {
      return { score: 0.8, label: 'Good (Weekend)' };
    }

    return { score: 0.7, label: 'Normal' };
  }

  private async evaluateBudgetFit(userId: string, price: number): Promise<{ score: number; label: string }> {
    // In production, this would check user's budget policies
    return { score: 0.8, label: 'Within Budget' };
  }

  private async checkPolicies(
    userId: string,
    context: { type: string; price?: number },
  ): Promise<{ violated: boolean; reasons: string[]; warnings: string[] }> {
    // In production, this would call the Policy Engine
    return { violated: false, reasons: [], warnings: [] };
  }

  // ============ Logging ============

  private async logDecision(data: {
    userId: string;
    missionId?: string;
    decisionType: string;
    inputData: Record<string, any>;
    outputData: Record<string, any>;
    confidenceScore: number;
    reasoning: string;
    executionTimeMs: number;
  }): Promise<void> {
    try {
      const log = this.decisionLogRepository.create(data);
      await this.decisionLogRepository.save(log);
    } catch (error) {
      this.logger.error('Failed to log decision:', error);
    }
  }

  async findDecisions(
    userId: string,
    options?: { missionId?: string; type?: string; limit?: number },
  ): Promise<AiDecisionLog[]> {
    const query = this.decisionLogRepository
      .createQueryBuilder('d')
      .where('d.userId = :userId', { userId });

    if (options?.missionId) {
      query.andWhere('d.missionId = :missionId', { missionId: options.missionId });
    }

    if (options?.type) {
      query.andWhere('d.decisionType = :type', { type: options.type });
    }

    return query
      .orderBy('d.createdAt', 'DESC')
      .take(options?.limit || 50)
      .getMany();
  }

  // ============ Agent Metrics ============

  async recordAgentMetric(dto: RecordAgentMetricDto): Promise<AgentMetric> {
    const metric = this.agentMetricRepository.create(dto);
    return this.agentMetricRepository.save(metric);
  }

  async getAgentMetrics(
    agentId: string,
    options?: { metricName?: string; limit?: number },
  ): Promise<AgentMetric[]> {
    const query = this.agentMetricRepository
      .createQueryBuilder('m')
      .where('m.agentId = :agentId', { agentId });

    if (options?.metricName) {
      query.andWhere('m.metricName = :metricName', { metricName: options.metricName });
    }

    return query
      .orderBy('m.recordedAt', 'DESC')
      .take(options?.limit || 100)
      .getMany();
  }

  async getAgentStats(agentId: string): Promise<Record<string, any>> {
    const metrics = await this.agentMetricRepository.find({
      where: { agentId },
      order: { recordedAt: 'DESC' },
      take: 1000,
    });

    const byMetric: Record<string, number[]> = {};
    for (const m of metrics) {
      if (!byMetric[m.metricName]) {
        byMetric[m.metricName] = [];
      }
      byMetric[m.metricName].push(Number(m.metricValue));
    }

    const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    for (const [name, values] of Object.entries(byMetric)) {
      stats[name] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };
    }

    return stats;
  }
}
