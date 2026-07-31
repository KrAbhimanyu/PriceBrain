import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentMarketplace } from './entities/agent-marketplace.entity';
import { AgentReview } from './entities/agent-review.entity';
import { AgentInstallation } from './entities/agent-installation.entity';
import { Agent, AgentStatus } from '../kernel/entities/agent.entity';
import {
  CreateAgentListingDto,
  UpdateAgentListingDto,
  CreateReviewDto,
  InstallAgentDto,
  UpdateInstallationDto,
  QueryListingsDto,
} from './dto/marketplace.dto';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(
    @InjectRepository(AgentMarketplace)
    private marketplaceRepository: Repository<AgentMarketplace>,
    @InjectRepository(AgentReview)
    private reviewRepository: Repository<AgentReview>,
    @InjectRepository(AgentInstallation)
    private installationRepository: Repository<AgentInstallation>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ============ LISTINGS ============

  async createListing(userId: string, dto: CreateAgentListingDto): Promise<AgentMarketplace> {
    const agent = await this.agentRepository.findOne({
      where: { id: dto.agentId },
    });
    if (!agent) {
      throw new NotFoundException(`Agent ${dto.agentId} not found`);
    }

    const listing = this.marketplaceRepository.create({
      ...dto,
      authorId: userId,
      authorName: 'User', // Would get from user service
    });

    const saved = await this.marketplaceRepository.save(listing);

    // Update agent marketplace flag
    agent.isMarketplace = true;
    agent.marketplaceId = saved.id;
    await this.agentRepository.save(agent);

    return saved;
  }

  async findListings(query: QueryListingsDto): Promise<AgentMarketplace[]> {
    const qb = this.marketplaceRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.agent', 'agent')
      .where('m.isActive = true');

    if (query.category) {
      qb.andWhere('m.category = :category', { category: query.category });
    }

    if (query.featuredOnly) {
      qb.andWhere('m.isFeatured = true');
    }

    if (query.pricingModel) {
      qb.andWhere('m.pricingModel = :pricingModel', { pricingModel: query.pricingModel });
    }

    if (query.search) {
      qb.andWhere(
        '(m.shortDescription ILIKE :search OR m.longDescription ILIKE :search OR agent.name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Sorting
    const sortBy = query.sortBy || 'downloadCount';
    qb.orderBy(`m.${sortBy}`, 'DESC');

    return qb.getMany();
  }

  async getListing(id: string): Promise<AgentMarketplace> {
    const listing = await this.marketplaceRepository.findOne({
      where: { id },
      relations: ['agent'],
    });
    if (!listing) {
      throw new NotFoundException(`Listing ${id} not found`);
    }
    return listing;
  }

  async updateListing(id: string, dto: UpdateAgentListingDto): Promise<AgentMarketplace> {
    const listing = await this.getListing(id);
    Object.assign(listing, dto);
    return this.marketplaceRepository.save(listing);
  }

  async deleteListing(id: string): Promise<void> {
    const listing = await this.getListing(id);
    await this.marketplaceRepository.remove(listing);
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    return this.marketplaceRepository
      .createQueryBuilder('m')
      .select('m.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('m.isActive = true')
      .groupBy('m.category')
      .getRawMany();
  }

  async getFeatured(): Promise<AgentMarketplace[]> {
    return this.marketplaceRepository.find({
      where: { isFeatured: true, isActive: true },
      relations: ['agent'],
      order: { rating: 'DESC' },
      take: 10,
    });
  }

  // ============ REVIEWS ============

  async createReview(userId: string, marketplaceId: string, dto: CreateReviewDto): Promise<AgentReview> {
    // Check if already reviewed
    const existing = await this.reviewRepository.findOne({
      where: { marketplaceId, userId },
    });
    if (existing) {
      throw new BadRequestException('You have already reviewed this agent');
    }

    const review = this.reviewRepository.create({
      ...dto,
      marketplaceId,
      userId,
      status: 'approved', // Auto-approve for now
    });

    const saved = await this.reviewRepository.save(review);

    // Update marketplace rating
    await this.updateMarketplaceRating(marketplaceId);

    return saved;
  }

  async getReviews(marketplaceId: string): Promise<AgentReview[]> {
    return this.reviewRepository.find({
      where: { marketplaceId, status: 'approved' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async markReviewHelpful(reviewId: string): Promise<void> {
    await this.reviewRepository.increment({ id: reviewId }, 'helpfulCount', 1);
  }

  private async updateMarketplaceRating(marketplaceId: string): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { marketplaceId, status: 'approved' },
    });

    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await this.marketplaceRepository.update(marketplaceId, {
        rating: avgRating,
        ratingCount: reviews.length,
      });
    }
  }

  // ============ INSTALLATIONS ============

  async install(userId: string, dto: InstallAgentDto): Promise<AgentInstallation> {
    const listing = await this.getListing(dto.marketplaceId);

    // Check if already installed
    const existing = await this.installationRepository.findOne({
      where: {
        marketplaceId: dto.marketplaceId,
        userId,
        organizationId: dto.organizationId || null,
      },
    });
    if (existing) {
      throw new BadRequestException('Agent is already installed');
    }

    // Create installed agent instance
    const installedAgent = await this.agentRepository.save({
      name: `${listing.agent.name} (User)`,
      slug: `${listing.agent.slug}-${Date.now()}`,
      agentType: listing.agent.agentType,
      capabilities: listing.agent.capabilities,
      permissions: listing.agent.permissions,
      config: dto.config || {},
      status: AgentStatus.ACTIVE,
      isMarketplace: false,
      ownerId: userId,
      organizationId: dto.organizationId,
    });

    // Create installation record
    const installation = this.installationRepository.create({
      marketplaceId: dto.marketplaceId,
      userId,
      organizationId: dto.organizationId,
      installedAgentId: installedAgent.id,
      version: listing.agent.version,
      config: dto.config || {},
      status: 'active',
    });

    const saved = await this.installationRepository.save(installation);

    // Update stats
    await this.marketplaceRepository.increment({ id: dto.marketplaceId }, 'installCount', 1);

    // Emit event
    this.eventEmitter.emit('agent.installed', {
      installationId: saved.id,
      marketplaceId: dto.marketplaceId,
      userId,
    });

    return saved;
  }

  async getInstallations(userId: string, organizationId?: string): Promise<AgentInstallation[]> {
    const qb = this.installationRepository
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.marketplace', 'marketplace')
      .leftJoinAndSelect('i.installedAgent', 'agent')
      .where('i.userId = :userId', { userId });

    if (organizationId) {
      qb.andWhere('(i.organizationId = :orgId OR i.organizationId IS NULL)', { orgId: organizationId });
    }

    return qb.orderBy('i.lastUsedAt', 'DESC').getMany();
  }

  async updateInstallation(
    installationId: string,
    userId: string,
    dto: UpdateInstallationDto,
  ): Promise<AgentInstallation> {
    const installation = await this.installationRepository.findOne({
      where: { id: installationId, userId },
    });

    if (!installation) {
      throw new NotFoundException(`Installation ${installationId} not found`);
    }

    if (dto.enabled !== undefined) {
      installation.status = dto.enabled ? 'active' : 'disabled';
    }

    if (dto.config) {
      installation.config = { ...installation.config, ...dto.config };
    }

    return this.installationRepository.save(installation);
  }

  async uninstall(installationId: string, userId: string): Promise<void> {
    const installation = await this.installationRepository.findOne({
      where: { id: installationId, userId },
      relations: ['installedAgent'],
    });

    if (!installation) {
      throw new NotFoundException(`Installation ${installationId} not found`);
    }

    // Delete installed agent
    if (installation.installedAgent) {
      await this.agentRepository.remove(installation.installedAgent);
    }

    await this.installationRepository.remove(installation);

    // Emit event
    this.eventEmitter.emit('agent.uninstalled', {
      installationId,
      userId,
    });
  }

  async recordUsage(installationId: string): Promise<void> {
    await this.installationRepository.update(installationId, {
      lastUsedAt: new Date(),
    });
  }

  // ============ STATISTICS ============

  async getListingStats(marketplaceId: string): Promise<{
    rating: number;
    ratingCount: number;
    installCount: number;
    downloadCount: number;
  }> {
    const listing = await this.getListing(marketplaceId);
    return {
      rating: listing.rating,
      ratingCount: listing.ratingCount,
      installCount: listing.installCount,
      downloadCount: listing.downloadCount,
    };
  }
}
