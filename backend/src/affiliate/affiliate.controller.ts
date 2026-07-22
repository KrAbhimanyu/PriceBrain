import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AffiliateService } from './affiliate.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Get('retailers')
  @Public()
  @ApiOperation({ summary: 'Get list of supported retailers' })
  async getRetailers() {
    return this.affiliateService.getSupportedRetailers();
  }

  @Get('redirect/:retailerPriceId')
  @Public()
  @ApiOperation({ summary: 'Redirect to retailer with affiliate tracking' })
  @ApiQuery({ name: 'ipAddress', required: false, description: 'User IP address for tracking' })
  async redirect(
    @Param('retailerPriceId') retailerPriceId: string,
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser('id') userId?: string,
  ) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0];
    const userAgent = req.headers['user-agent'];
    
    const result = await this.affiliateService.redirect(retailerPriceId, userId, ipAddress, userAgent);
    return res.redirect(result.redirectUrl);
  }

  @Get('link/:retailerPriceId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get affiliate link details (requires auth)' })
  async getLink(
    @Param('retailerPriceId') retailerPriceId: string,
    @CurrentUser() user?: User,
  ) {
    return this.affiliateService.generateAffiliateLink(retailerPriceId, user?.id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get click statistics' })
  @ApiQuery({ name: 'productId', required: false, description: 'Filter by product ID' })
  @ApiQuery({ name: 'retailerId', required: false, description: 'Filter by retailer ID' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look back' })
  async getStats(
    @Req() req: Request,
  ) {
    const productId = req.query['productId'] as string;
    const retailerId = req.query['retailerId'] as string;
    const days = req.query['days'] ? parseInt(req.query['days'] as string, 10) : undefined;
    
    return this.affiliateService.getClickStats(productId, retailerId, days);
  }
}
