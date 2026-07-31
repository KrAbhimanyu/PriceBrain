import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Simulation, SimulationScenario } from './entities/simulation.entity';
import { CreateSimulationDto, UpdateSimulationDto, QuerySimulationsDto, CreateScenarioDto } from './dto/simulation.dto';

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);

  constructor(
    @InjectRepository(Simulation)
    private simulationRepository: Repository<Simulation>,
    @InjectRepository(SimulationScenario)
    private scenarioRepository: Repository<SimulationScenario>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateSimulationDto): Promise<Simulation> {
    const simulation = this.simulationRepository.create({
      ...dto,
      createdBy: userId,
      status: 'pending',
    });

    const saved = await this.simulationRepository.save(simulation);

    this.eventEmitter.emit('simulation.created', {
      simulationId: saved.id,
      organizationId: dto.organizationId,
      simulationType: dto.simulationType,
    });

    this.logger.log(`Simulation created: ${dto.title}`);
    return saved;
  }

  async findAll(organizationId: string, query: QuerySimulationsDto): Promise<Simulation[]> {
    const qb = this.simulationRepository
      .createQueryBuilder('s')
      .where('s.organizationId = :organizationId', { organizationId });

    if (query.simulationType) {
      qb.andWhere('s.simulationType = :simulationType', { simulationType: query.simulationType });
    }

    if (query.status) {
      qb.andWhere('s.status = :status', { status: query.status });
    }

    return qb.orderBy('s.createdAt', 'DESC').getMany();
  }

  async findById(id: string): Promise<Simulation> {
    const simulation = await this.simulationRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!simulation) {
      throw new NotFoundException(`Simulation ${id} not found`);
    }
    return simulation;
  }

  async runSimulation(id: string): Promise<Simulation> {
    const simulation = await this.findById(id);

    if (simulation.status !== 'pending') {
      throw new Error('Can only run pending simulations');
    }

    simulation.status = 'running';
    await this.simulationRepository.save(simulation);

    // Simulate the execution (in production, this would be async and complex)
    try {
      const results = await this.executeSimulation(simulation);
      
      simulation.status = 'completed';
      simulation.results = results.results;
      simulation.predictions = results.predictions;
      simulation.risks = results.risks;
      simulation.alternatives = results.alternatives;
      simulation.successProbability = results.successProbability;
      simulation.expectedCost = results.expectedCost;
      simulation.expectedTimeline = results.expectedTimeline;
      simulation.completedAt = new Date();

      const saved = await this.simulationRepository.save(simulation);

      this.eventEmitter.emit('simulation.completed', {
        simulationId: id,
        successProbability: results.successProbability,
      });

      return saved;
    } catch (error) {
      simulation.status = 'failed';
      await this.simulationRepository.save(simulation);
      throw error;
    }
  }

  private async executeSimulation(simulation: Simulation): Promise<Record<string, any>> {
    // Simulate complex calculation based on type
    const typeHandlers: Record<string, () => Record<string, any>> = {
      'business_growth': () => this.simulateBusinessGrowth(simulation),
      'hiring': () => this.simulateHiring(simulation),
      'budget_change': () => this.simulateBudgetChange(simulation),
      'marketing_campaign': () => this.simulateMarketing(simulation),
      'infrastructure': () => this.simulateInfrastructure(simulation),
      'project_planning': () => this.simulateProjectPlanning(simulation),
    };

    const handler = typeHandlers[simulation.simulationType] || typeHandlers['business_growth'];
    return handler();
  }

  private simulateBusinessGrowth(simulation: Simulation): Record<string, any> {
    const growthRate = simulation.parameters.growthRate || 0.1;
    const baseRevenue = simulation.parameters.baseRevenue || 1000000;

    const projectedRevenue = baseRevenue * (1 + growthRate);
    const successProbability = 70 + (growthRate * 20);

    return {
      results: {
        projectedRevenue,
        revenueGrowth: projectedRevenue - baseRevenue,
        growthRate: (projectedRevenue / baseRevenue - 1) * 100,
      },
      predictions: {
        year1: baseRevenue * (1 + growthRate * 0.8),
        year2: baseRevenue * (1 + growthRate * 1.2),
        year3: baseRevenue * (1 + growthRate * 1.5),
      },
      risks: [
        { name: 'Market Volatility', probability: 30, impact: 'medium' },
        { name: 'Competition', probability: 40, impact: 'high' },
        { name: 'Economic Downturn', probability: 15, impact: 'high' },
      ],
      alternatives: [
        { name: 'Conservative Growth', growthRate: growthRate * 0.5, risk: 'low' },
        { name: 'Aggressive Growth', growthRate: growthRate * 1.5, risk: 'high' },
      ],
      successProbability,
      expectedCost: 0,
      expectedTimeline: '12 months',
    };
  }

  private simulateHiring(simulation: Simulation): Record<string, any> {
    const headcount = simulation.parameters.headcount || 5;
    const avgSalary = simulation.parameters.avgSalary || 100000;

    const totalCost = headcount * avgSalary * 1.3; // Including benefits
    const productivityGain = headcount * 200000; // Simplified productivity calculation

    return {
      results: {
        totalCost,
        productivityGain,
        roi: (productivityGain - totalCost) / totalCost * 100,
      },
      predictions: {
        teamSize: headcount,
        monthlyCost: totalCost / 12,
        breakEven: '6 months',
      },
      risks: [
        { name: 'Hiring Delays', probability: 40, impact: 'medium' },
        { name: 'Bad Hires', probability: 20, impact: 'high' },
      ],
      alternatives: [
        { name: 'Contractors', cost: totalCost * 0.7, flexibility: 'high' },
        { name: 'Offshore Team', cost: totalCost * 0.4, communication: 'challenged' },
      ],
      successProbability: 75,
      expectedCost: totalCost,
      expectedTimeline: '3-6 months',
    };
  }

  private simulateBudgetChange(simulation: Simulation): Record<string, any> {
    const currentBudget = simulation.parameters.currentBudget || 1000000;
    const changePercent = simulation.parameters.changePercent || 10;

    const newBudget = currentBudget * (1 + changePercent / 100);
    const impact = Math.abs(changePercent) * 10000;

    return {
      results: {
        currentBudget,
        newBudget,
        changeAmount: newBudget - currentBudget,
      },
      predictions: {
        monthlyBurn: newBudget / 12,
        runway: Math.floor(currentBudget / (newBudget / 365)),
      },
      risks: [
        { name: 'Cash Flow Issues', probability: 25 * Math.abs(changePercent), impact: 'high' },
        { name: 'Overspending', probability: 30, impact: 'medium' },
      ],
      alternatives: [
        { name: 'Gradual Change', changePercent: changePercent * 0.5, risk: 'low' },
        { name: 'Phased Approach', phases: 4, risk: 'medium' },
      ],
      successProbability: 65 + (50 - Math.abs(changePercent)),
      expectedCost: Math.abs(newBudget - currentBudget),
      expectedTimeline: '1-3 months',
    };
  }

  private simulateMarketing(simulation: Simulation): Record<string, any> {
    const budget = simulation.parameters.budget || 50000;
    const channels = simulation.parameters.channels || ['social'];

    const reach = budget * 100;
    const conversions = reach * 0.02;
    const revenue = conversions * 500;

    return {
      results: {
        reach,
        conversions,
        conversionRate: 2,
        revenue,
        roi: (revenue - budget) / budget * 100,
      },
      predictions: {
        customerAcquisition: conversions,
        ltv: 2500,
      },
      risks: [
        { name: 'Low Engagement', probability: 35, impact: 'medium' },
        { name: 'Ad Fatigue', probability: 25, impact: 'medium' },
      ],
      alternatives: [
        { name: 'Content Marketing', cost: budget * 0.3, time: '6 months' },
        { name: 'Influencer Marketing', cost: budget * 2, reach: reach * 5 },
      ],
      successProbability: 70,
      expectedCost: budget,
      expectedTimeline: '1-3 months',
    };
  }

  private simulateInfrastructure(simulation: Simulation): Record<string, any> {
    const currentCapacity = simulation.parameters.currentCapacity || 1000;
    const growth = simulation.parameters.growth || 0.5;

    const requiredCapacity = currentCapacity * (1 + growth);
    const cost = requiredCapacity * 50;

    return {
      results: {
        currentCapacity,
        requiredCapacity,
        gap: requiredCapacity - currentCapacity,
        estimatedCost: cost,
      },
      predictions: {
        scalability: 'high',
        maintenance: 'quarterly',
      },
      risks: [
        { name: 'Downtime', probability: 15, impact: 'high' },
        { name: 'Overscaling', probability: 30, impact: 'low' },
      ],
      alternatives: [
        { name: 'Cloud Scaling', cost: cost * 0.3, flexibility: 'high' },
        { name: 'Hybrid Approach', cost: cost * 0.6, complexity: 'medium' },
      ],
      successProbability: 80,
      expectedCost: cost,
      expectedTimeline: '2-4 months',
    };
  }

  private simulateProjectPlanning(simulation: Simulation): Record<string, any> {
    const scope = simulation.parameters.scope || 'medium';
    const teamSize = simulation.parameters.teamSize || 5;

    const timelines = { small: 30, medium: 90, large: 180 };
    const budget = { small: 50000, medium: 200000, large: 500000 };

    const duration = timelines[scope as keyof typeof timelines] || 90;
    const cost = budget[scope as keyof typeof budget] || 200000;

    return {
      results: {
        duration,
        budget: cost,
        teamSize,
        dailyCost: cost / duration,
      },
      predictions: {
        completionDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        milestones: Math.floor(duration / 30),
      },
      risks: [
        { name: 'Scope Creep', probability: 45, impact: 'high' },
        { name: 'Resource Constraints', probability: 30, impact: 'medium' },
      ],
      alternatives: [
        { name: 'Agile Approach', iterations: 6, flexibility: 'high' },
        { name: 'Waterfall', phases: 5, predictability: 'high' },
      ],
      successProbability: 75,
      expectedCost: cost,
      expectedTimeline: `${duration} days`,
    };
  }

  async update(id: string, dto: UpdateSimulationDto): Promise<Simulation> {
    const simulation = await this.findById(id);
    Object.assign(simulation, dto);
    return this.simulationRepository.save(simulation);
  }

  async approve(id: string, userId: string): Promise<Simulation> {
    const simulation = await this.findById(id);
    simulation.approvedBy = userId;
    return this.simulationRepository.save(simulation);
  }

  async addScenario(simulationId: string, dto: CreateScenarioDto): Promise<SimulationScenario> {
    const simulation = await this.findById(simulationId);
    const scenario = this.scenarioRepository.create({
      simulationId: simulation.id,
      ...dto,
    });
    return this.scenarioRepository.save(scenario);
  }

  async getScenarios(simulationId: string): Promise<SimulationScenario[]> {
    return this.scenarioRepository.find({
      where: { simulationId },
      order: { probability: 'DESC' },
    });
  }
}
