import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search products' })
  async search(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.search(query, page || 1, limit || 20);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  async suggestions(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.searchService.suggestions(query, limit || 10);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending searches' })
  async trending(@Query('limit') limit?: number) {
    return this.searchService.getTrendingSearches(limit || 10);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get popular categories' })
  async categories(@Query('limit') limit?: number) {
    return this.searchService.getPopularCategories(limit || 10);
  }

  @Get('brands')
  @ApiOperation({ summary: 'Get popular brands' })
  async brands(@Query('limit') limit?: number) {
    return this.searchService.getPopularBrands(limit || 10);
  }
}
