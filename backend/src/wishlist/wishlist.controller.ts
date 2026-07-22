import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';
import { User } from '../users/entities/user.entity';
import { WishlistService } from './wishlist.service';

@ApiTags('wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  async findAll(@CurrentUser() user: User) {
    return this.wishlistService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  async add(
    @CurrentUser() user: User,
    @Body() body: { productId: string; targetPrice?: number },
  ) {
    return this.wishlistService.add(user.id, body.productId, body.targetPrice);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async remove(
    @CurrentUser() user: User,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.remove(user.id, productId);
  }

  @Patch(':productId/target-price')
  @ApiOperation({ summary: 'Update target price' })
  async updateTargetPrice(
    @CurrentUser() user: User,
    @Param('productId') productId: string,
    @Body() body: { targetPrice: number },
  ) {
    return this.wishlistService.updateTargetPrice(user.id, productId, body.targetPrice);
  }

  @Patch(':productId/toggle-alert')
  @ApiOperation({ summary: 'Toggle price alert' })
  async togglePriceAlert(
    @CurrentUser() user: User,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.togglePriceAlert(user.id, productId);
  }
}
