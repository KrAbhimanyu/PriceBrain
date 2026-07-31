import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { AskBrainUserContext, Gender, LifeStage } from './entities/user-context.entity';
import { AskBrainRecommendation, RecommendationAction, ProductTrustLevel, DealQuality } from './entities/shopping-intelligence.entity';
import { AskBrainMission, AskBrainMissionTask, AskBrainLifeTimeline, MissionType, MissionStatus } from './entities/life-intelligence.entity';

export interface AskBrainQuery {
  userId: string;
  query: string;
  context?: Partial<AskBrainUserContext>;
  missionId?: string;
  mode?: 'shopping' | 'styling' | 'lifestyle' | 'planning';
}

export interface AskBrainResponse {
  answer: string;
  recommendations?: Partial<AskBrainRecommendation>[];
  outfits?: any[];
  missions?: Partial<AskBrainMission>[];
  expertPerspectives?: string[];
  reasoning?: string;
  confidenceLevel?: number;
  sources?: string[];
  suggestions?: string[];
  followUpQuestions?: string[];
  contextUsed?: string[];
}

@Injectable()
export class AskBrainCoreService {
  private readonly logger = new Logger(AskBrainCoreService.name);
  private openai: OpenAI | null = null;
  private readonly defaultModel = 'gpt-4o';

  constructor(
    @InjectRepository(AskBrainUserContext)
    private userContextRepo: Repository<AskBrainUserContext>,
    @InjectRepository(AskBrainRecommendation)
    private recommendationRepo: Repository<AskBrainRecommendation>,
    @InjectRepository(AskBrainMission)
    private missionRepo: Repository<AskBrainMission>,
    @InjectRepository(AskBrainMissionTask)
    private missionTaskRepo: Repository<AskBrainMissionTask>,
    @InjectRepository(AskBrainLifeTimeline)
    private timelineRepo: Repository<AskBrainLifeTimeline>,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('AskBrain AI Core initialized with GPT-4o');
    }
  }

  // ============ CORE QUERY PROCESSING ============

  async processQuery(query: AskBrainQuery): Promise<AskBrainResponse> {
    const startTime = Date.now();
    this.logger.log(`Processing AskBrain query for user ${query.userId}: ${query.query}`);

    try {
      // Step 1: Gather user context
      const userContext = await this.getUserContext(query.userId);
      
      // Step 2: Merge provided context with stored context
      const mergedContext = { ...userContext, ...query.context };

      // Step 3: Detect query intent
      const intent = this.detectIntent(query.query);

      // Step 4: Route to appropriate engine
      let response: AskBrainResponse;

      switch (intent.type) {
        case 'shopping':
          response = await this.processShoppingQuery(query.query, mergedContext);
          break;
        case 'styling':
          response = await this.processStylingQuery(query.query, mergedContext);
          break;
        case 'lifestyle':
          response = await this.processLifestyleQuery(query.query, mergedContext);
          break;
        case 'planning':
          response = await this.processPlanningQuery(query.query, mergedContext);
          break;
        case 'comparison':
          response = await this.processComparisonQuery(query.query, mergedContext);
          break;
        case 'explanation':
          response = await this.processExplanationQuery(query.query, mergedContext);
          break;
        default:
          response = await this.processGeneralQuery(query.query, mergedContext);
      }

      // Step 5: Add expert perspectives
      response.expertPerspectives = this.generateExpertPerspectives(intent.type, mergedContext);

      // Step 6: Add context used
      response.contextUsed = this.getContextUsed(mergedContext);

      // Step 7: Log the interaction
      await this.logInteraction(query.userId, query.query, response);

      this.logger.log(`Query processed in ${Date.now() - startTime}ms`);

      return response;
    } catch (error) {
      this.logger.error(`Error processing query: ${error}`);
      return {
        answer: 'I apologize, but I encountered an error processing your request. Please try again.',
        confidenceLevel: 0,
      };
    }
  }

  // ============ USER CONTEXT ============

  async getUserContext(userId: string): Promise<Partial<AskBrainUserContext>> {
    const context = await this.userContextRepo.findOne({ where: { userId } });
    if (context) {
      return context;
    }

    // Return default context
    return {
      userId,
      lifeStage: LifeStage.ADULT,
      riskTolerance: 'medium',
      urgencyLevel: 'medium',
    };
  }

  async updateUserContext(userId: string, updates: Partial<AskBrainUserContext>): Promise<AskBrainUserContext> {
    let context = await this.userContextRepo.findOne({ where: { userId } });

    if (context) {
      Object.assign(context, updates);
    } else {
      context = this.userContextRepo.create({ userId, ...updates });
    }

    return this.userContextRepo.save(context);
  }

  // ============ INTENT DETECTION ============

  private detectIntent(query: string): { type: string; entities: string[]; confidence: number } {
    const queryLower = query.toLowerCase();

    const patterns = {
      shopping: ['buy', 'purchase', 'price', 'best', 'recommend', 'deal', 'discount', 'offer', 'cost', 'worth'],
      styling: ['wear', 'outfit', 'dress', 'style', 'match', 'coordinate', 'fashion', 'clothes'],
      lifestyle: ['wedding', 'birthday', 'event', 'travel', 'vacation', 'home', 'setup', 'occasion'],
      planning: ['plan', 'mission', 'goal', 'budget', 'timeline', 'shopping list', 'checklist'],
      comparison: ['vs', 'versus', 'compare', 'difference', 'better', 'worse', 'which'],
      explanation: ['why', 'explain', 'how', 'what', 'reason', 'understand'],
    };

    const scores: Record<string, number> = {};

    for (const [type, keywords] of Object.entries(patterns)) {
      scores[type] = keywords.filter(k => queryLower.includes(k)).length;
    }

    const maxType = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    return {
      type: maxType[1] > 0 ? maxType[0] : 'general',
      entities: [],
      confidence: maxType[1] / patterns[maxType[0]].length,
    };
  }

  // ============ SHOPPING INTELLIGENCE ============

  private async processShoppingQuery(query: string, context: Partial<AskBrainUserContext>): Promise<AskBrainResponse> {
    // Analyze the shopping intent
    const intent = this.analyzeShoppingIntent(query, context);

    // Generate recommendation using AI
    const answer = await this.generateShoppingResponse(query, context, intent);

    // Create recommendation record
    const recommendation = this.createRecommendation(query, intent, context);

    return {
      answer,
      recommendations: [recommendation],
      reasoning: intent.reasoning,
      confidenceLevel: intent.confidence,
      followUpQuestions: intent.followUpQuestions,
    };
  }

  private analyzeShoppingIntent(query: string, context: Partial<AskBrainUserContext>): any {
    const queryLower = query.toLowerCase();

    // Detect action keywords
    let action: RecommendationAction = RecommendationAction.BUY_NOW;
    
    if (queryLower.includes('should i wait') || queryLower.includes('price drop')) {
      action = RecommendationAction.WAIT;
    } else if (queryLower.includes('skip') || queryLower.includes('avoid')) {
      action = RecommendationAction.SKIP;
    } else if (queryLower.includes('used') || queryLower.includes('second hand')) {
      action = RecommendationAction.BUY_USED;
    } else if (queryLower.includes('premium') || queryLower.includes('high end')) {
      action = RecommendationAction.BUY_PREMIUM;
    } else if (queryLower.includes('budget') || queryLower.includes('cheap') || queryLower.includes('affordable')) {
      action = RecommendationAction.BUY_BUDGET;
    }

    // Calculate deal score based on context
    let dealScore = 70; // Base score
    
    if (context.shoppingBudget && context.shoppingBudget > 0) {
      dealScore += 10; // Budget user
    }
    
    if (context.urgencyLevel === 'low') {
      dealScore += 10; // Patient shopper
    }

    return {
      action,
      dealScore: Math.min(100, dealScore),
      trustScore: 75,
      valueScore: 80,
      reasoning: this.generateReasoning(query, context, action),
      followUpQuestions: this.generateFollowUpQuestions(query, context),
      confidence: 0.85,
    };
  }

  private generateReasoning(query: string, context: Partial<AskBrainUserContext>, action: RecommendationAction): string {
    const reasonings = [];

    // Add context-based reasoning
    if (context.lifeStage) {
      reasonings.push(`Considering your life stage as ${context.lifeStage}`);
    }

    if (context.urgencyLevel) {
      reasonings.push(`Urgency level: ${context.urgencyLevel}`);
    }

    if (context.shoppingBudget) {
      reasonings.push(`Your shopping budget: ₹${context.shoppingBudget}`);
    }

    // Add action-specific reasoning
    switch (action) {
      case RecommendationAction.WAIT:
        reasonings.push('Prices typically drop during sale events');
        reasonings.push('Festival sales often offer better deals');
        break;
      case RecommendationAction.BUY_NOW:
        reasonings.push('This appears to be a good time to purchase');
        reasonings.push('Price is at or near historical low');
        break;
      case RecommendationAction.BUY_BUDGET:
        reasonings.push('Budget-friendly alternatives available');
        reasonings.push('Good value for money options exist');
        break;
    }

    return reasonings.join('. ') + '.';
  }

  private generateFollowUpQuestions(query: string, context: Partial<AskBrainUserContext>): string[] {
    const questions = [];

    if (!context.shoppingBudget) {
      questions.push('What is your budget for this purchase?');
    }

    if (!context.urgencyLevel) {
      questions.push('When do you need this by?');
    }

    questions.push('Is this for a specific occasion?');
    questions.push('Do you have any brand preferences?');

    return questions;
  }

  private createRecommendation(query: string, intent: any, context: Partial<AskBrainUserContext>): Partial<AskBrainRecommendation> {
    return {
      recommendedAction: intent.action,
      dealScore: intent.dealScore,
      trustScore: intent.trustScore,
      valueScore: intent.valueScore,
      confidenceLevel: intent.confidence,
      explanation: intent.reasoning,
      contextUsed: this.getContextUsed(context),
      expertPerspective: intent.expertPerspectives?.[0],
    };
  }

  // ============ STYLING INTELLIGENCE ============

  private async processStylingQuery(query: string, context: Partial<AskBrainUserContext>): Promise<AskBrainResponse> {
    const outfit = this.generateOutfitRecommendation(query, context);

    return {
      answer: `Based on your profile and the occasion, here's a complete outfit recommendation.`,
      outfits: [outfit],
      reasoning: this.generateStylingReasoning(context),
      confidenceLevel: 0.8,
    };
  }

  private generateOutfitRecommendation(query: string, context: Partial<AskBrainUserContext>): any {
    const occasion = this.detectOccasion(query);
    const season = context.season || 'all_season';

    return {
      occasion,
      season,
      outfit: [
        { category: 'Top', name: 'Suggested top', reason: 'Matches your style preference', essential: true },
        { category: 'Bottom', name: 'Suggested bottom', reason: 'Coordinates with top', essential: true },
        { category: 'Footwear', name: 'Suggested footwear', reason: 'Comfortable and stylish', essential: true },
        { category: 'Accessory', name: 'Watch', reason: 'Adds polish', essential: false },
        { category: 'Accessory', name: 'Belt', reason: 'Completes look', essential: false },
      ],
      totalPrice: 5000,
      colorMatching: context.colorPreferences || ['neutral'],
      styleDescription: `Smart casual look for ${occasion}`,
      tips: [
        'Consider the weather when choosing fabrics',
        'Accessorize according to the occasion',
        'Comfort should be a priority',
      ],
    };
  }

  private generateStylingReasoning(context: Partial<AskBrainUserContext>): string {
    const reasonings = [];

    if (context.stylePreferences?.length) {
      reasonings.push(`Your style preference: ${context.stylePreferences.join(', ')}`);
    }

    if (context.colorPreferences?.length) {
      reasonings.push(`Your preferred colors: ${context.colorPreferences.join(', ')}`);
    }

    if (context.bodyType) {
      reasonings.push(`Recommendations suited for ${context.bodyType} body type`);
    }

    if (context.profession) {
      reasonings.push(`Considering your profession as ${context.profession}`);
    }

    return reasonings.join('. ');
  }

  private detectOccasion(query: string): string {
    const occasions = {
      'wedding': 'Wedding',
      'party': 'Party',
      'interview': 'Interview',
      'office': 'Office',
      'casual': 'Casual',
      'formal': 'Formal',
      'date': 'Date Night',
      'gym': 'Gym',
      'home': 'Home',
    };

    for (const [key, value] of Object.entries(occasions)) {
      if (query.toLowerCase().includes(key)) {
        return value;
      }
    }

    return 'Casual';
  }

  // ============ LIFESTYLE INTELLIGENCE ============

  private async processLifestyleQuery(query: string, context: Partial<AskBrainUserContext>): Promise<AskBrainResponse> {
    const detectedEvent = this.detectLifeEvent(query);

    if (detectedEvent) {
      const mission = await this.createMissionFromEvent(detectedEvent, context);
      return {
        answer: `I understand you're planning for ${detectedEvent.type}. Let me create a comprehensive shopping mission for you.`,
        missions: [mission],
        reasoning: `This is a ${detectedEvent.type} event${detectedEvent.date ? ` on ${detectedEvent.date}` : ''}`,
        confidenceLevel: 0.9,
      };
    }

    return {
      answer: 'Tell me more about the event or situation you\'re planning for.',
      confidenceLevel: 0.5,
      followUpQuestions: [
        'When is the event?',
        'What\'s your budget?',
        'Who will be attending?',
      ],
    };
  }

  private detectLifeEvent(query: string): { type: MissionType; date?: Date; name?: string } | null {
    const queryLower = query.toLowerCase();

    const eventPatterns: Record<string, MissionType> = {
      'wedding': MissionType.WEDDING,
      'engagement': MissionType.ENGAGEMENT,
      'reception': MissionType.RECEPTION,
      'birthday': MissionType.BIRTHDAY,
      'anniversary': MissionType.ANNIVERSARY,
      'diwali': MissionType.FESTIVAL,
      'holi': MissionType.FESTIVAL,
      'christmas': MissionType.FESTIVAL,
      'vacation': MissionType.VACATION,
      'trip': MissionType.TRAVEL,
      'holiday': MissionType.VACATION,
      'interview': MissionType.INTERVIEW,
      'college': MissionType.COLLEGE,
      'new job': MissionType.FIRST_JOB,
      'first job': MissionType.FIRST_JOB,
      'home setup': MissionType.HOMESETUP,
      'moving': MissionType.MOVING,
      'baby': MissionType.BABY_PLANNING,
      'renovation': MissionType.RENOVATION,
      'gym': MissionType.GYM,
    };

    for (const [pattern, type] of Object.entries(eventPatterns)) {
      if (queryLower.includes(pattern)) {
        return { type, name: pattern };
      }
    }

    return null;
  }

  private async createMissionFromEvent(event: any, context: Partial<AskBrainUserContext>): Promise<Partial<AskBrainMission>> {
    const missionName = this.generateMissionName(event.type);

    return {
      title: missionName,
      description: `Complete shopping plan for ${event.type}`,
      missionType: event.type,
      status: MissionStatus.PLANNING,
      totalBudget: context.shoppingBudget || 100000,
      eventDate: event.date,
      eventName: event.name,
      context: {
        userLifeStage: context.lifeStage,
        userProfession: context.profession,
        familyMembers: context.familyMembers,
      },
    };
  }

  private generateMissionName(type: MissionType): string {
    const names: Record<MissionType, string> = {
      [MissionType.WEDDING]: 'Complete Wedding Shopping Mission',
      [MissionType.ENGAGEMENT]: 'Engagement Preparation Mission',
      [MissionType.RECEPTION]: 'Reception Shopping Mission',
      [MissionType.BIRTHDAY]: 'Birthday Celebration Mission',
      [MissionType.ANNIVERSARY]: 'Anniversary Special Mission',
      [MissionType.FESTIVAL]: 'Festival Preparation Mission',
      [MissionType.TRAVEL]: 'Travel Preparation Mission',
      [MissionType.VACATION]: 'Vacation Shopping Mission',
      [MissionType.BUSINESS_TRIP]: 'Business Trip Mission',
      [MissionType.INTERVIEW]: 'Interview Outfit Mission',
      [MissionType.COLLEGE]: 'College Ready Mission',
      [MissionType.SCHOOL]: 'Back to School Mission',
      [MissionType.GYM]: 'Fitness Journey Mission',
      [MissionType.HOMESETUP]: 'Home Setup Mission',
      [MissionType.KITCHEN]: 'Kitchen Essentials Mission',
      [MissionType.LIVING_ROOM]: 'Living Room Makeover Mission',
      [MissionType.BEDROOM]: 'Bedroom Setup Mission',
      [MissionType.STUDY_ROOM]: 'Study Room Mission',
      [MissionType.WFH]: 'Work From Home Setup Mission',
      [MissionType.GAMING]: 'Gaming Setup Mission',
      [MissionType.PHOTOGRAPHY]: 'Photography Setup Mission',
      [MissionType.CONTENT_CREATION]: 'Content Creator Setup Mission',
      [MissionType.BABY_PLANNING]: 'Baby Preparation Mission',
      [MissionType.FIRST_JOB]: 'First Job Ready Mission',
      [MissionType.PROMOTION]: 'Promotion Celebration Mission',
      [MissionType.RETIREMENT]: 'Retirement Life Mission',
      [MissionType.MOVING]: 'Moving House Mission',
      [MissionType.RENOVATION]: 'Home Renovation Mission',
      [MissionType.CUSTOM]: 'Custom Shopping Mission',
    };

    return names[type] || 'Shopping Mission';
  }

  // ============ PLANNING ENGINE ============

  private async processPlanningQuery(query: string, context: Partial<AskBrainUserContext>): Promise<AskBrainResponse> {
    const mission = await this.createMissionFromQuery(query, context);

    return {
      answer: `I've created a comprehensive shopping plan based on your goal. Let me break it down into actionable tasks.`,
      missions: [mission],
      reasoning: `This plan is customized for your ${context.lifeStage || 'current'} life stage with a budget of ₹${context.shoppingBudget || 'not set'}`,
      confidenceLevel: 0.85,
    };
  }

  private async createMissionFromQuery(query: string, context: Partial<AskBrainUserContext>): Promise<Partial<AskBrainMission>> {
    // Create a new mission based on the query
    const mission = this.missionRepo.create({
      userId: context.userId || '',
      title: this.extractGoalFromQuery(query),
      description: query,
      missionType: MissionType.CUSTOM,
      status: MissionStatus.PLANNING,
      totalBudget: context.shoppingBudget || 50000,
      goals: this.extractGoals(query),
      context: {
        originalQuery: query,
        userContext: context,
      },
    });

    return this.missionRepo.save(mission);
  }

  private extractGoalFromQuery(query: string): string {
    // Simple extraction - in production, use NLP
    const words = query.split(' ');
    const goal = words.slice(0, 5).join(' ');
    return `Goal: ${goal}...`;
  }

  private extractGoals(query: string): string[] {
    // Simple extraction - in production, use NLP
    return [
      'Research products',
      'Compare options',
      'Set budget',
      'Create shopping list',
      'Execute purchases',
    ];
  }

  // ============ COMPARISON & EXPLANATION ============

  private async processComparisonQuery(query: string, context: Partial<AskBrainUserContext>): Promise<AskBrainResponse> {
    return {
      answer: await this.generateComparisonResponse(query, context),
      reasoning: 'Comparison based on specifications, price, reviews, and your preferences',
      confidenceLevel: 0.88,
    };
  }

  private async generateComparisonResponse(query: string, context: Partial<AskBrainUserContext>): Promise<string> {
    if (!this.openai) {
      return 'I can help you compare products. Please provide more details about what you want to compare.';
    }

    const prompt = `As a product research analyst, compare the following for user with context: ${JSON.stringify(context)}
    
Query: ${query}

Provide a detailed comparison including:
1. Key differences
2. Pros and cons of each
3. Price comparison
4. Value for money
5. My recommendation`;

    const completion = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        { role: 'system', content: 'You are a product research analyst helping users make smart purchasing decisions.' },
        { role: 'user', content: prompt },
      ],
    });

    return completion.choices[0]?.message?.content || '';
  }

  private async processExplanationQuery(query: string, context: Partial<AskBrainUserContext>): Promise<AskBrainResponse> {
    return {
      answer: await this.generateExplanationResponse(query, context),
      reasoning: 'Explanation based on product data, user reviews, and expert analysis',
      confidenceLevel: 0.9,
    };
  }

  private async generateExplanationResponse(query: string, context: Partial<AskBrainUserContext>): Promise<string> {
    if (!this.openai) {
      return 'To explain this properly, I need more context. Could you specify what product or topic you\'d like to understand better?';
    }

    const prompt = `User Context: ${JSON.stringify(context)}
    
Question: ${query}

Explain in detail:
1. What this means
2. Why it matters for the user
3. What to consider
4. Common misconceptions`;

    const completion = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        { role: 'system', content: 'You are a knowledgeable shopping advisor who explains things clearly and helps users understand products deeply.' },
        { role: 'user', content: prompt },
      ],
    });

    return completion.choices[0]?.message?.content || '';
  }

  // ============ GENERAL QUERY ============

  private async processGeneralQuery(query: string, context: Partial<AskBrainUserContext>): Promise<AskBrainResponse> {
    return {
      answer: await this.generateGeneralResponse(query, context),
      suggestions: this.generateSuggestions(query, context),
      followUpQuestions: [
        'Are you looking to buy something specific?',
        'Do you have a budget in mind?',
        'Is this for a special occasion?',
      ],
      confidenceLevel: 0.75,
    };
  }

  private async generateGeneralResponse(query: string, context: Partial<AskBrainUserContext>): Promise<string> {
    if (!this.openai) {
      return 'I\'m here to help you make smart purchasing decisions. Ask me about products, prices, styling, or planning your shopping.';
    }

    const prompt = `User Context: ${JSON.stringify(context)}
    
Question: ${query}

As AskBrain (PriceBrain's AI Commerce Intelligence), help the user with their shopping query. Be informative, helpful, and focus on making the best decision for the user.`;

    const completion = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        { role: 'system', content: 'You are AskBrain, the world\'s smartest AI Commerce Intelligence System. Your mission is to help users make the best purchasing decisions by understanding their complete context.' },
        { role: 'user', content: prompt },
      ],
    });

    return completion.choices[0]?.message?.content || '';
  }

  private generateSuggestions(query: string, context: Partial<AskBrainUserContext>): string[] {
    const suggestions = [];

    if (!context.shoppingBudget) {
      suggestions.push('Set your shopping budget');
    }

    if (!context.stylePreferences?.length) {
      suggestions.push('Tell me your style preferences');
    }

    suggestions.push('Browse product categories');
    suggestions.push('Check current deals');

    return suggestions;
  }

  // ============ EXPERT PERSPECTIVES ============

  private generateExpertPerspectives(queryType: string, context: Partial<AskBrainUserContext>): string[] {
    const perspectives = [];

    perspectives.push('🛒 Shopping Expert: Focus on value and necessity');
    perspectives.push('💰 Financial Advisor: Consider your budget and financial goals');
    perspectives.push('📊 Product Analyst: Research specifications and reviews');
    perspectives.push('🎨 Stylist: Think about versatility and occasions');

    if (context.lifeStage === LifeStage.YOUNG_ADULT) {
      perspectives.push('🌱 Life Planner: Invest in versatile, timeless pieces');
    }

    if (context.sustainabilityPreference) {
      perspectives.push('🌿 Sustainability Advisor: Consider environmental impact');
    }

    return perspectives;
  }

  // ============ CONTEXT TRACKING ============

  private getContextUsed(context: Partial<AskBrainUserContext>): string[] {
    const used = [];

    if (context.age) used.push('Age');
    if (context.gender) used.push('Gender');
    if (context.profession) used.push('Profession');
    if (context.lifeStage) used.push('Life Stage');
    if (context.shoppingBudget) used.push('Budget');
    if (context.stylePreferences?.length) used.push('Style Preferences');
    if (context.colorPreferences?.length) used.push('Color Preferences');
    if (context.urgencyLevel) used.push('Urgency Level');
    if (context.familyMembers?.length) used.push('Family Context');
    if (context.location) used.push('Location');

    return used;
  }

  // ============ INTERACTION LOGGING ============

  private async logInteraction(userId: string, query: string, response: AskBrainResponse): Promise<void> {
    this.eventEmitter.emit('askbrain.query', {
      userId,
      query,
      response,
      timestamp: new Date(),
    });
  }

  // ============ AI RESPONSE GENERATION ============

  private async generateShoppingResponse(query: string, context: any, intent: any): Promise<string> {
    if (!this.openai) {
      return this.generateFallbackResponse(query, context, intent);
    }

    const systemPrompt = `You are AskBrain, PriceBrain's AI Commerce Intelligence System.

Your mission: Help users make the SMARTEST purchasing decisions by understanding their COMPLETE context.

You NEVER:
- Answer immediately without reasoning
- Recommend products without understanding the user's needs
- Push sponsored or biased recommendations

You ALWAYS:
- Think like a Shopping Expert, Financial Advisor, Product Analyst, and Stylist
- Provide evidence-based recommendations
- Explain WHY and WHY NOT for every recommendation
- Consider the user's complete context (budget, lifestyle, preferences, etc.)
- Suggest alternatives when appropriate
- Detect fake discounts and misleading offers

Current user context: ${JSON.stringify(context)}

Generate a helpful, informative response that addresses the user's query.`;

    const completion = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return completion.choices[0]?.message?.content || '';
  }

  private generateFallbackResponse(query: string, context: any, intent: any): string {
    return `Based on your query and context, here are my thoughts:

**Analysis:**
${intent.reasoning}

**Recommendation:** ${intent.action}

**Deal Score:** ${intent.dealScore}/100
**Trust Score:** ${intent.trustScore}/100

Please configure OPENAI_API_KEY for AI-powered recommendations.`;
  }

  // ============ SHOPPING INTELLIGENCE METHODS ============

  async calculateDealScore(product: any, userContext: Partial<AskBrainUserContext>): Promise<number> {
    let score = 50;

    // Price-based scoring
    if (product.currentPrice && product.historicalLow) {
      const priceDiff = ((product.currentPrice - product.historicalLow) / product.historicalLow) * 100;
      if (priceDiff <= 0) score += 30;
      else if (priceDiff <= 10) score += 20;
      else if (priceDiff <= 20) score += 10;
    }

    // Review-based scoring
    if (product.rating && product.rating >= 4.5) score += 15;
    else if (product.rating && product.rating >= 4) score += 10;

    // Demand-based scoring
    if (product.inStock && product.stockLevel === 'high') score += 5;

    return Math.min(100, score);
  }

  async calculateTrustScore(product: any): Promise<number> {
    let score = 50;

    // Seller trust
    if (product.sellerRating && product.sellerRating >= 4.5) score += 20;
    else if (product.sellerRating && product.sellerRating >= 4) score += 10;

    // Authenticity
    if (product.authenticityGuaranteed) score += 15;

    // Return policy
    if (product.returnPolicy && product.returnPolicy.days >= 30) score += 10;
    else if (product.returnPolicy && product.returnPolicy.days >= 7) score += 5;

    // Reviews
    if (product.totalReviews && product.totalReviews >= 100) score += 5;

    return Math.min(100, score);
  }

  async detectFakeDiscount(productPrice: number, originalPrice: number, historicalAvg: number): Promise<{ isFake: boolean; actualDiscount: number }> {
    const claimedDiscount = ((originalPrice - productPrice) / originalPrice) * 100;
    const actualVsHistorical = historicalAvg > 0 
      ? ((productPrice - historicalAvg) / historicalAvg) * 100 
      : 0;

    // If current price is higher than historical average, discount might be fake
    const isFake = actualVsHistorical > 5 || claimedDiscount > 70;
    const actualDiscount = actualVsHistorical <= 0 
      ? claimedDiscount 
      : -actualVsHistorical;

    return { isFake, actualDiscount };
  }

  async predictPrice(productId: string, daysAhead: number = 30): Promise<{ predictedPrice: number; confidence: number; date: Date }> {
    // Simple prediction based on historical data
    // In production, use ML models
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + daysAhead);

    return {
      predictedPrice: 0, // Would calculate from historical data
      confidence: 0.6,
      date: baseDate,
    };
  }

  // ============ RECOMMENDATION METHODS ============

  async createRecommendationRecord(
    userId: string,
    product: any,
    action: RecommendationAction,
    scores: { deal: number; trust: number; value: number },
    reasoning: string,
  ): Promise<AskBrainRecommendation> {
    const recommendation = this.recommendationRepo.create({
      userId,
      productId: product.id,
      productName: product.name,
      recommendedAction: action,
      dealScore: scores.deal,
      trustScore: scores.trust,
      valueScore: scores.value,
      currentPrice: product.currentPrice,
      reasons: reasoning.split('. '),
      confidenceLevel: (scores.deal + scores.trust + scores.value) / 3,
      explanation: reasoning,
    });

    return this.recommendationRepo.save(recommendation);
  }

  async getRecommendations(userId: string, options: { action?: RecommendationAction; limit?: number } = {}): Promise<AskBrainRecommendation[]> {
    const query = this.recommendationRepo
      .createQueryBuilder('rec')
      .where('rec.userId = :userId', { userId })
      .orderBy('rec.dealScore', 'DESC');

    if (options.action) {
      query.andWhere('rec.recommendedAction = :action', { action: options.action });
    }

    return query.take(options.limit || 10).getMany();
  }

  async updateRecommendationFeedback(recommendationId: string, feedback: { purchased?: boolean; satisfaction?: number; notes?: string }): Promise<void> {
    const recommendation = await this.recommendationRepo.findOne({ where: { id: recommendationId } });
    if (!recommendation) return;

    if (feedback.purchased !== undefined) {
      recommendation.purchased = feedback.purchased;
      recommendation.purchasedAt = feedback.purchased ? new Date() : null;
    }

    if (feedback.satisfaction !== undefined) {
      recommendation.satisfactionScore = feedback.satisfaction;
    }

    if (feedback.notes) {
      recommendation.feedback = feedback.notes;
    }

    await this.recommendationRepo.save(recommendation);
  }
}
