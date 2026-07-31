import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DecisionService } from './decision.service';
import {
  ProductDecisionDto,
  PurchaseDecisionDto,
  CompareDecisionDto,
  RecommendDecisionDto,
  RecordAgentMetricDto,
} from './dto/decision.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Decision Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('decision')
export class DecisionController {
  constructor(private readonly decisionService: DecisionService) {}

  @Post('product')
  @ApiOperation({ summary: 'Evaluate a product' })
  evaluateProduct(@Request() req, @Body() dto: ProductDecisionDto) {
    return this.decisionService.evaluateProduct(req.user.id, dto);
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Make a purchase decision' })
  evaluatePurchase(@Request() req, @Body() dto: PurchaseDecisionDto) {
    return this.decisionService.evaluatePurchase(req.user.id, dto);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Compare multiple products' })
  compareProducts(@Request() req, @Body() dto: CompareDecisionDto) {
    return this.decisionService.compareProducts(req.user.id, dto);
  }

  @Post('recommend')
  @ApiOperation({ summary: 'Generate recommendations' })
  generateRecommendations(@Request() req, @Body() dto: RecommendDecisionDto) {
    return this.decisionService.generateRecommendations(req.user.id, dto);
  }

  @Get('decisions')
  @ApiOperation({ summary: 'Get decision history' })
  findDecisions(
    @Request() req,
    @Query('missionId') missionId?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: number,
  ) {
    return this.decisionService.findDecisions(req.user.id, { missionId, type, limit });
  }

  // ============ Agent Metrics ============

  @Post('metrics/agent')
  @ApiOperation({ summary: 'Record agent metric' })
  recordAgentMetric(@Body() dto: RecordAgentMetricDto) {
    return this.decisionService.recordAgentMetric(dto);
  }

  @Get('metrics/agent/:agentId')
  @ApiOperation({ summary: 'Get agent metrics' })
  getAgentMetrics(
    @Param('agentId') agentId: string,
    @Query('metricName') metricName?: string,
    @Query('limit') limit?: number,
  ) {
    return this.decisionService.getAgentMetrics(agentId, { metricName, limit });
  }

  @Get('metrics/agent/:agentId/stats')
  @ApiOperation({ summary: 'Get agent statistics' })
  getAgentStats(@Param('agentId') agentId: string) {
    return this.decisionService.getAgentStats(agentId);
  }
}
