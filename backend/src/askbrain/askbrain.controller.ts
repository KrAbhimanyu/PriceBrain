import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AskBrainCoreService, AskBrainQuery, AskBrainResponse } from './services/askbrain-core.service';
import { SituationIntelligenceService, SituationAnalysis } from './services/situation-intelligence.service';
import { RecommendationAction } from './entities/shopping-intelligence.entity';
import { MissionType, MissionStatus } from './entities/life-intelligence.entity';

@ApiTags('AskBrain - AI Commerce Intelligence')
@Controller('askbrain')
export class AskBrainController {
  constructor(
    private readonly askbrainService: AskBrainCoreService,
    private readonly situationService: SituationIntelligenceService,
  ) {}

  // ============ CORE QUERY ============

  @Post('query')
  @ApiOperation({ summary: 'Process a query to AskBrain AI' })
  async processQuery(
    @Body()
    body: {
      query: string;
      context?: any;
      missionId?: string;
      mode?: 'shopping' | 'styling' | 'lifestyle' | 'planning';
    },
    @Request() req: any,
  ): Promise<AskBrainResponse> {
    return this.askbrainService.processQuery({
      userId: req.user?.id || 'anonymous',
      query: body.query,
      context: body.context,
      missionId: body.missionId,
      mode: body.mode,
    });
  }

  // ============ SITUATION ANALYSIS ============

  @Post('situation')
  @ApiOperation({ summary: 'Analyze a real-life situation and generate complete shopping solution' })
  async analyzeSituation(
    @Body()
    body: {
      situation: string;
      userContext?: any;
    },
    @Request() req: any,
  ): Promise<SituationAnalysis> {
    // Get full user context if available
    let userContext = body.userContext || {};
    if (req.user?.id) {
      const storedContext = await this.askbrainService.getUserContext(req.user.id);
      userContext = { ...storedContext, ...userContext };
    }

    return this.situationService.analyzeSituation(body.situation, userContext);
  }

  @Post('situation/outfit')
  @ApiOperation({ summary: 'Get complete outfit recommendation for a situation' })
  async getSituationOutfit(
    @Body()
    body: {
      situation: string;
      budget?: number;
      style?: string;
    },
  ) {
    return this.situationService.analyzeSituation(
      `I need an outfit for ${body.situation}`,
      { budget: body.budget, stylePreferences: [body.style] }
    );
  }

  @Post('situation/custom')
  @ApiOperation({ summary: 'Handle any custom situation described by user' })
  async handleCustomSituation(
    @Body()
    body: {
      description: string;
      details?: {
        location?: string;
        season?: string;
        budget?: string;
        participants?: string[];
      };
    },
    @Request() req: any,
  ): Promise<SituationAnalysis> {
    // Build comprehensive query from description
    let query = body.description;
    if (body.details?.location) query += ` in ${body.details.location}`;
    if (body.details?.season) query += ` during ${body.details.season}`;
    if (body.details?.budget) query += ` with budget ${body.details.budget}`;

    let userContext = {};
    if (req.user?.id) {
      userContext = await this.askbrainService.getUserContext(req.user.id);
    }

    return this.situationService.analyzeSituation(query, userContext);
  }

  // ============ USER CONTEXT ============

  @Get('context')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user context' })
  async getUserContext(@Request() req: any) {
    return this.askbrainService.getUserContext(req.user.id);
  }

  @Put('context')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user context' })
  async updateUserContext(
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.askbrainService.updateUserContext(req.user.id, body);
  }

  // ============ SHOPPING INTELLIGENCE ============

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get shopping recommendations' })
  async getRecommendations(
    @Request() req: any,
    @Query('action') action?: RecommendationAction,
    @Query('limit') limit?: number,
  ) {
    return this.askbrainService.getRecommendations(req.user.id, { action, limit });
  }

  @Post('recommendations/:id/feedback')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit feedback on recommendation' })
  async submitFeedback(
    @Param('id') id: string,
    @Body()
    body: {
      purchased?: boolean;
      satisfaction?: number;
      notes?: string;
    },
  ) {
    await this.askbrainService.updateRecommendationFeedback(id, body);
    return { success: true };
  }

  @Post('analyze-deal')
  @ApiOperation({ summary: 'Analyze a deal for a product' })
  async analyzeDeal(
    @Body()
    body: {
      productId: string;
      currentPrice: number;
      originalPrice: number;
      historicalAvg: number;
    },
  ) {
    const fakeAnalysis = await this.askbrainService.detectFakeDiscount(
      body.currentPrice,
      body.originalPrice,
      body.historicalAvg,
    );

    return {
      isFakeDiscount: fakeAnalysis.isFake,
      claimedDiscount: ((body.originalPrice - body.currentPrice) / body.originalPrice) * 100,
      actualDiscount: fakeAnalysis.actualDiscount,
      verdict: fakeAnalysis.isFake ? 'FAKE_DISCOUNT' : 'GENUINE_DISCOUNT',
    };
  }

  @Post('price-prediction')
  @ApiOperation({ summary: 'Predict future price' })
  async predictPrice(
    @Body()
    body: {
      productId: string;
      daysAhead?: number;
    },
  ) {
    return this.askbrainService.predictPrice(body.productId, body.daysAhead || 30);
  }

  @Post('calculate-deal-score')
  @ApiOperation({ summary: 'Calculate deal score' })
  async calculateDealScore(
    @Body()
    body: {
      product: any;
    },
    @Request() req: any,
  ) {
    const userContext = await this.askbrainService.getUserContext(req.user?.id || 'anonymous');
    const dealScore = await this.askbrainService.calculateDealScore(body.product, userContext);
    const trustScore = await this.askbrainService.calculateTrustScore(body.product);

    return {
      dealScore,
      trustScore,
      valueScore: (dealScore + trustScore) / 2,
      verdict: dealScore >= 80 ? 'EXCELLENT_DEAL' : dealScore >= 60 ? 'GOOD_DEAL' : 'FAIR_DEAL',
    };
  }

  // ============ MISSION PLANNING ============

  @Post('missions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new mission' })
  async createMission(
    @Body()
    body: {
      title: string;
      description?: string;
      missionType: MissionType;
      eventDate?: Date;
      totalBudget: number;
      goals?: string[];
    },
    @Request() req: any,
  ) {
    // Implementation would create mission
    return { success: true, message: 'Mission created' };
  }

  @Get('missions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user missions' })
  async getMissions(
    @Request() req: any,
    @Query('status') status?: MissionStatus,
  ) {
    // Implementation would fetch missions
    return [];
  }

  @Get('missions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get mission details' })
  async getMission(@Param('id') id: string) {
    // Implementation would fetch mission
    return { id, title: 'Sample Mission' };
  }

  @Put('missions/:id/tasks')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update mission tasks' })
  async updateMissionTasks(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return { success: true };
  }

  // ============ STYLING ============

  @Post('outfit-recommendation')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get outfit recommendation' })
  async getOutfitRecommendation(
    @Body()
    body: {
      occasion: string;
      season?: string;
      budget?: number;
    },
    @Request() req: any,
  ) {
    const query = `What should I wear for ${body.occasion}?`;
    const context = await this.askbrainService.getUserContext(req.user.id);
    
    return this.askbrainService.processQuery({
      userId: req.user.id,
      query,
      mode: 'styling',
      context,
    });
  }

  @Post('digital-wardrobe')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add item to digital wardrobe' })
  async addToWardrobe(
    @Body()
    body: {
      productId: string;
      category: string;
      color: string;
      brand: string;
      size: string;
    },
    @Request() req: any,
  ) {
    return { success: true, message: 'Item added to wardrobe' };
  }

  @Get('digital-wardrobe')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get digital wardrobe' })
  async getWardrobe(@Request() req: any) {
    return [];
  }

  // ============ LIFESTYLE ============

  @Get('life-timeline')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get life timeline' })
  async getLifeTimeline(@Request() req: any) {
    return [];
  }

  @Post('life-event')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add life event' })
  async addLifeEvent(
    @Body()
    body: {
      eventType: string;
      eventName: string;
      eventDate: Date;
      description?: string;
    },
    @Request() req: any,
  ) {
    return { success: true };
  }

  // ============ COMPARISON ============

  @Post('compare')
  @ApiOperation({ summary: 'Compare products' })
  async compareProducts(
    @Body()
    body: {
      products: Array<{
        id: string;
        name: string;
        price: number;
        specs: Record<string, any>;
      }>;
    },
    @Request() req: any,
  ) {
    const query = `Compare ${body.products.map(p => p.name).join(' vs ')}`;
    return this.askbrainService.processQuery({
      userId: req.user?.id || 'anonymous',
      query,
      mode: 'shopping',
    });
  }

  // ============ ANALYTICS ============

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get AskBrain usage statistics' })
  async getStats(@Request() req: any) {
    return {
      totalQueries: 0,
      recommendationsGenerated: 0,
      purchasesMade: 0,
      moneySaved: 0,
      avgSatisfactionScore: 0,
      topCategories: [],
    };
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get personalized insights' })
  async getInsights(@Request() req: any) {
    return {
      spendingPattern: 'Budget-conscious',
      qualityPreference: 'Premium',
      styleTendency: 'Classic',
      recommendations: [
        'Consider investing in versatile basics',
        'Watch for sales on your preferred brands',
      ],
    };
  }
}
