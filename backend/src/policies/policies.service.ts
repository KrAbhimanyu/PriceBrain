import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy } from './entities/policy.entity';
import { CreatePolicyDto, UpdatePolicyDto } from './dto/policy.dto';
import { PolicyType } from '../shared/enums/mission.enum';

export interface PolicyEvaluationResult {
  allowed: boolean;
  violatedPolicies: Policy[];
  suggestions: string[];
  actions: Record<string, any>[];
}

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
  ) {}

  // ============ Policy CRUD ============

  async create(userId: string, dto: CreatePolicyDto): Promise<Policy> {
    const policy = this.policyRepository.create({
      ...dto,
      userId,
    });
    return this.policyRepository.save(policy);
  }

  async findAll(userId: string, type?: PolicyType): Promise<Policy[]> {
    const query = this.policyRepository.createQueryBuilder('p')
      .where('p.userId = :userId', { userId });

    if (type) {
      query.andWhere('p.type = :type', { type });
    }

    return query.orderBy('p.priority', 'DESC').getMany();
  }

  async findActive(userId: string): Promise<Policy[]> {
    return this.policyRepository.find({
      where: { userId, isActive: true },
      order: { priority: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({
      where: { id, userId },
    });

    if (!policy) {
      throw new NotFoundException(`Policy ${id} not found`);
    }

    return policy;
  }

  async update(id: string, userId: string, dto: UpdatePolicyDto): Promise<Policy> {
    const policy = await this.findOne(id, userId);
    Object.assign(policy, dto);
    return this.policyRepository.save(policy);
  }

  async delete(id: string, userId: string): Promise<void> {
    const policy = await this.findOne(id, userId);
    await this.policyRepository.remove(policy);
  }

  async toggle(id: string, userId: string): Promise<Policy> {
    const policy = await this.findOne(id, userId);
    policy.isActive = !policy.isActive;
    return this.policyRepository.save(policy);
  }

  // ============ Policy Evaluation ============

  async evaluate(userId: string, context: Record<string, any>): Promise<PolicyEvaluationResult> {
    const policies = await this.findActive(userId);
    const violatedPolicies: Policy[] = [];
    const suggestions: string[] = [];
    const actions: Record<string, any>[] = [];

    for (const policy of policies) {
      const violated = this.checkPolicyViolation(policy, context);
      if (violated) {
        violatedPolicies.push(policy);
        suggestions.push(...this.generateSuggestions(policy));
        actions.push(...(policy.actions || []));
      }
    }

    return {
      allowed: violatedPolicies.length === 0,
      violatedPolicies,
      suggestions,
      actions,
    };
  }

  private checkPolicyViolation(policy: Policy, context: Record<string, any>): boolean {
    const conditions = policy.conditions;

    switch (policy.type) {
      case PolicyType.BUDGET:
        return this.checkBudgetPolicy(conditions, context);

      case PolicyType.BRAND_PREFERENCE:
        return this.checkBrandPreferencePolicy(conditions, context);

      case PolicyType.SELLER_TRUST:
        return this.checkSellerTrustPolicy(conditions, context);

      case PolicyType.RATING_THRESHOLD:
        return this.checkRatingThresholdPolicy(conditions, context);

      case PolicyType.ECO_FRIENDLY:
        return this.checkEcoFriendlyPolicy(conditions, context);

      case PolicyType.PRODUCT_PREFERENCE:
        return this.checkProductPreferencePolicy(conditions, context);

      default:
        return false;
    }
  }

  private checkBudgetPolicy(conditions: Record<string, any>, context: Record<string, any>): boolean {
    const maxBudget = conditions.maxBudget;
    if (!maxBudget) return false;

    const currentSpent = context.currentSpent || 0;
    const newAmount = context.amount || 0;

    return currentSpent + newAmount > maxBudget;
  }

  private checkBrandPreferencePolicy(conditions: Record<string, any>, context: Record<string, any>): boolean {
    const preferredBrands = conditions.preferredBrands || [];
    const excludedBrands = conditions.excludedBrands || [];

    if (excludedBrands.length > 0 && excludedBrands.includes(context.brandName)) {
      return true;
    }

    if (preferredBrands.length > 0 && !preferredBrands.includes(context.brandName)) {
      return true;
    }

    return false;
  }

  private checkSellerTrustPolicy(conditions: Record<string, any>, context: Record<string, any>): boolean {
    const minRating = conditions.minRating || 4.0;
    return (context.sellerRating || 5) < minRating;
  }

  private checkRatingThresholdPolicy(conditions: Record<string, any>, context: Record<string, any>): boolean {
    const minRating = conditions.minRating || 4.0;
    return (context.productRating || 5) < minRating;
  }

  private checkEcoFriendlyPolicy(conditions: Record<string, any>, context: Record<string, any>): boolean {
    if (conditions.ecoFriendlyOnly && !context.isEcoFriendly) {
      return true;
    }
    return false;
  }

  private checkProductPreferencePolicy(conditions: Record<string, any>, context: Record<string, any>): boolean {
    const preferredCategories = conditions.preferredCategories || [];
    const excludedCategories = conditions.excludedCategories || [];

    if (excludedCategories.length > 0 && excludedCategories.includes(context.category)) {
      return true;
    }

    if (preferredCategories.length > 0 && !preferredCategories.includes(context.category)) {
      return true;
    }

    return false;
  }

  private generateSuggestions(policy: Policy): string[] {
    const suggestions: string[] = [];

    switch (policy.type) {
      case PolicyType.BUDGET:
        suggestions.push(`Budget exceeded. Consider waiting for a better deal.`);
        break;
      case PolicyType.BRAND_PREFERENCE:
        suggestions.push(`Consider products from preferred brands.`);
        break;
      case PolicyType.SELLER_TRUST:
        suggestions.push(`This seller has low ratings. Be cautious.`);
        break;
      case PolicyType.RATING_THRESHOLD:
        suggestions.push(`Consider products with higher ratings.`);
        break;
      case PolicyType.ECO_FRIENDLY:
        suggestions.push(`Look for eco-friendly alternatives.`);
        break;
    }

    return suggestions;
  }

  // ============ System Policies ============

  async createDefaultPolicies(userId: string): Promise<Policy[]> {
    const defaultPolicies: CreatePolicyDto[] = [
      {
        name: 'Approval Required for High-Value Purchases',
        description: 'Require approval for purchases above ₹50,000',
        type: PolicyType.APPROVAL_REQUIRED,
        conditions: { minAmount: 50000 },
        actions: [{ type: 'require_approval' }],
        priority: 100,
      },
      {
        name: 'Minimum Rating Threshold',
        description: 'Only recommend products with 4+ star rating',
        type: PolicyType.RATING_THRESHOLD,
        conditions: { minRating: 4.0 },
        priority: 50,
      },
    ];

    const created: Policy[] = [];
    for (const dto of defaultPolicies) {
      const policy = await this.create(userId, dto);
      created.push(policy);
    }

    return created;
  }

  // ============ Statistics ============

  async getStats(userId: string): Promise<{
    total: number;
    active: number;
    byType: Record<string, number>;
  }> {
    const policies = await this.findAll(userId);

    const byType: Record<string, number> = {};
    for (const policy of policies) {
      byType[policy.type] = (byType[policy.type] || 0) + 1;
    }

    return {
      total: policies.length,
      active: policies.filter((p) => p.isActive).length,
      byType,
    };
  }
}
