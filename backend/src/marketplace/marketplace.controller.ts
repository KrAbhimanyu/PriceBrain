import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import {
  CreateAgentListingDto,
  UpdateAgentListingDto,
  CreateReviewDto,
  InstallAgentDto,
  UpdateInstallationDto,
  QueryListingsDto,
} from './dto/marketplace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Agent Marketplace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('marketplace/agents')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // ============ Listings ============

  @Post()
  @ApiOperation({ summary: 'Create agent listing' })
  createListing(@Request() req, @Body() dto: CreateAgentListingDto) {
    return this.marketplaceService.createListing(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all listings' })
  findListings(@Query() query: QueryListingsDto) {
    return this.marketplaceService.findListings(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get categories' })
  getCategories() {
    return this.marketplaceService.getCategories();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured agents' })
  getFeatured() {
    return this.marketplaceService.getFeatured();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing by ID' })
  getListing(@Param('id') id: string) {
    return this.marketplaceService.getListing(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update listing' })
  updateListing(@Param('id') id: string, @Body() dto: UpdateAgentListingDto) {
    return this.marketplaceService.updateListing(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete listing' })
  deleteListing(@Param('id') id: string) {
    return this.marketplaceService.deleteListing(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get listing statistics' })
  getListingStats(@Param('id') id: string) {
    return this.marketplaceService.getListingStats(id);
  }

  // ============ Reviews ============

  @Post(':id/reviews')
  @ApiOperation({ summary: 'Create review' })
  createReview(@Request() req, @Param('id') id: string, @Body() dto: CreateReviewDto) {
    return this.marketplaceService.createReview(req.user.id, id, dto);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get reviews' })
  getReviews(@Param('id') id: string) {
    return this.marketplaceService.getReviews(id);
  }

  @Post('reviews/:reviewId/helpful')
  @ApiOperation({ summary: 'Mark review as helpful' })
  markReviewHelpful(@Param('reviewId') reviewId: string) {
    return this.marketplaceService.markReviewHelpful(reviewId);
  }

  // ============ Installations ============

  @Post('install')
  @ApiOperation({ summary: 'Install an agent' })
  install(@Request() req, @Body() dto: InstallAgentDto) {
    return this.marketplaceService.install(req.user.id, dto);
  }

  @Get('installations/mine')
  @ApiOperation({ summary: 'Get my installations' })
  getMyInstallations(@Request() req, @Query('organizationId') organizationId?: string) {
    return this.marketplaceService.getInstallations(req.user.id, organizationId);
  }

  @Patch('installations/:id')
  @ApiOperation({ summary: 'Update installation' })
  updateInstallation(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateInstallationDto,
  ) {
    return this.marketplaceService.updateInstallation(id, req.user.id, dto);
  }

  @Delete('installations/:id')
  @ApiOperation({ summary: 'Uninstall agent' })
  uninstall(@Request() req, @Param('id') id: string) {
    return this.marketplaceService.uninstall(id, req.user.id);
  }
}
