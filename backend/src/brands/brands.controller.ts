import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BrandsService } from './brands.service';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  async findAllBrands() {
    return this.brandsService.findAllBrands();
  }

  @Get('retailers')
  @ApiOperation({ summary: 'Get all retailers' })
  async findAllRetailers() {
    return this.brandsService.findAllRetailers();
  }
}
