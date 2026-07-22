import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active coupons' })
  async findAll(@Body('retailerId') retailerId?: string) {
    return this.couponsService.findAll(retailerId);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get coupon by code' })
  async findOne(@Param('code') code: string) {
    return this.couponsService.findOne(code);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code' })
  async validate(
    @Body() body: { code: string; purchaseAmount: number },
  ) {
    return this.couponsService.validate(body.code, body.purchaseAmount);
  }
}
