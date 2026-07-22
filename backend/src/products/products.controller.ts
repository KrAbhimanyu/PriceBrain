import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { SearchProductsDto } from './dto/search-products.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with filters and pagination' })
  async findAll(@Query() query: SearchProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  async findFeatured(@Query('limit') limit?: number) {
    return this.productsService.findFeatured(limit || 10);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name or slug' })
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.search(query, limit || 10);
  }

  @Get('facets')
  @ApiOperation({ summary: 'Get filter facets for products' })
  async getFacets(
    @Query('category') category?: string,
    @Query('brand') brand?: string,
  ) {
    return this.productsService.getFacets(category, brand);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a single product by ID or slug' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.productsService.findOne(idOrSlug);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products' })
  async getRelated(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getRelated(id, limit || 10);
  }
}
