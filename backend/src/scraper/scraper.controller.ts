import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { AmazonScraperService } from './amazon-scraper.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly amazonScraperService: AmazonScraperService,
  ) {}

  @Get('retailers')
  @Public()
  @ApiOperation({ summary: 'Get list of supported retailers for scraping' })
  async getSupportedRetailers() {
    return {
      retailers: this.scraperService.getSupportedRetailers(),
    };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get scraper status for all retailers' })
  async getScraperStatus() {
    return this.scraperService.getScraperStatus();
  }

  @Post('scrape/:retailer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Run scraper for a specific retailer' })
  async scrapeRetailer(@Param('retailer') retailer: string) {
    if (retailer === 'amazon') {
      return this.amazonScraperService.scrapeRetailer();
    }
    const count = await this.scraperService.scrapeRetailer(retailer);
    return { success: true, productsScraped: count };
  }

  @Post('scrape-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Run all scrapers' })
  async runAllScrapers() {
    const result = await this.scraperService.runAllScrapers();
    const amazonResult = await this.amazonScraperService.scrapeRetailer();
    return { ...result, amazon: amazonResult };
  }

  @Post('toggle/:retailer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Enable or disable a scraper' })
  async toggleScraper(
    @Param('retailer') retailer: string,
    @Body() body: { enabled: boolean },
  ) {
    await this.scraperService.toggleScraper(retailer, body.enabled);
    return { success: true, retailer, enabled: body.enabled };
  }

  // ============ Amazon-Specific Endpoints ============

  @Get('amazon/search')
  @Public()
  @ApiOperation({ summary: 'Search products on Amazon' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'page', required: false })
  async searchAmazon(@Query('q') query: string, @Query('page') page?: number) {
    return this.amazonScraperService.searchProducts(query, page || 1);
  }

  @Get('amazon/product/:asin')
  @Public()
  @ApiOperation({ summary: 'Get Amazon product details by ASIN' })
  async getAmazonProduct(@Param('asin') asin: string) {
    return this.amazonScraperService.getProductDetails(asin);
  }

  @Get('amazon/price/:asin')
  @Public()
  @ApiOperation({ summary: 'Get current Amazon price for an ASIN' })
  async getAmazonPrice(@Param('asin') asin: string) {
    return this.amazonScraperService.updateProductPrice(asin);
  }

  @Post('amazon/prices/batch')
  @Public()
  @ApiOperation({ summary: 'Batch update prices for multiple ASINs' })
  async batchUpdateAmazonPrices(@Body() body: { asins: string[] }) {
    return this.amazonScraperService.batchUpdatePrices(body.asins);
  }

  // ============ Search Endpoints ============

  @Get('search/:retailer')
  @Public()
  @ApiOperation({ summary: 'Search products on a retailer website' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  async searchProducts(
    @Param('retailer') retailer: string,
    @Query('q') query: string,
    @Query('page') page?: number,
  ) {
    return this.scraperService.searchProducts(retailer, query, page || 1);
  }

  // ============ Product Details ============

  @Get('product/:retailer/:productId')
  @Public()
  @ApiOperation({ summary: 'Get product details from a retailer' })
  async getProductDetails(
    @Param('retailer') retailer: string,
    @Param('productId') productId: string,
  ) {
    const product = await this.scraperService.getProductDetails(retailer, productId);
    if (!product) {
      return { error: 'Product not found' };
    }
    return product;
  }

  // ============ Price Updates ============

  @Get('price/:retailer/:productId')
  @Public()
  @ApiOperation({ summary: 'Get current price from a retailer' })
  async getPrice(
    @Param('retailer') retailer: string,
    @Param('productId') productId: string,
  ) {
    return this.scraperService.updatePrice(retailer, productId);
  }

  @Post('prices/batch')
  @Public()
  @ApiOperation({ summary: 'Batch update prices for multiple products' })
  async batchUpdatePrices(@Body() body: { retailer: string; productIds: string[] }) {
    return this.scraperService.batchUpdatePrices(body.retailer, body.productIds);
  }

  // ============ Legacy Endpoint ============

  @Post('scrape-product')
  @Public()
  @ApiOperation({ summary: 'Scrape a single product URL' })
  async scrapeProduct(
    @Body() body: { retailer: string; productUrl: string },
  ) {
    const product = await this.scraperService.scrapeProduct(body.retailer, body.productUrl);
    return product ?? { error: 'Failed to scrape product' };
  }
}
